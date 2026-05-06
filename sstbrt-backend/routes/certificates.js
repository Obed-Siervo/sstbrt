const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const db = require('../db');

const router = express.Router();

const CERT_DIR = path.join(__dirname, '..', 'certificates');

// URL pública real
const BASE_URL = process.env.PUBLIC_URL || 'https://sstbrt.com';

// Crear carpeta si no existe
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

// ============================================
// VERIFY CERTIFICATE PAGE
// ============================================
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const sql = `
      SELECT
        u.name,
        c.title AS course,
        cert.certificate_code,
        cert.created_at
      FROM certificates cert
      JOIN users u ON cert.user_id = u.id
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.certificate_code = ?
      LIMIT 1
    `;

    const [rows] = await db.promise().query(sql, [code]);

    if (!rows.length) {
      return res.status(404).send(`
        <html>
          <body style="font-family:Arial;padding:40px;text-align:center;">
            <h1>❌ Certificado no válido</h1>
            <p>El certificado no fue encontrado.</p>
          </body>
        </html>
      `);
    }

    const cert = rows[0];

    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Certificado válido</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <style>
          body{
            margin:0;
            background:#F8FAFC;
            font-family:Arial,sans-serif;
            display:flex;
            justify-content:center;
            align-items:center;
            min-height:100vh;
            padding:20px;
          }

          .card{
            background:white;
            max-width:650px;
            width:100%;
            border-radius:20px;
            padding:35px;
            box-shadow:0 10px 35px rgba(0,0,0,.08);
            text-align:center;
          }

          .badge{
            background:#DCFCE7;
            color:#15803D;
            padding:8px 15px;
            border-radius:999px;
            display:inline-block;
            font-weight:bold;
            margin-bottom:20px;
          }

          h1{
            margin:0;
            color:#0F172A;
          }

          .muted{
            color:#64748B;
            margin-top:10px;
            margin-bottom:25px;
          }

          .info{
            text-align:left;
            background:#F8FAFC;
            border:1px solid #E2E8F0;
            border-radius:14px;
            padding:20px;
          }

          .row{
            display:flex;
            justify-content:space-between;
            margin-bottom:12px;
            gap:20px;
          }

          .label{
            color:#64748B;
            font-weight:bold;
          }

          .value{
            color:#0F172A;
            font-weight:bold;
            text-align:right;
          }

          .btn{
            display:inline-block;
            margin-top:25px;
            background:#2563EB;
            color:white;
            text-decoration:none;
            padding:14px 20px;
            border-radius:12px;
            font-weight:bold;
          }

          .btn:hover{
            background:#1D4ED8;
          }
        </style>
      </head>

      <body>

        <div class="card">

          <div class="badge">✅ Certificado válido</div>

          <h1>${escapeHtml(cert.name)}</h1>

          <p class="muted">
            Este certificado ha sido emitido por SSTBRT Academy.
          </p>

          <div class="info">

            <div class="row">
              <div class="label">Curso</div>
              <div class="value">${escapeHtml(cert.course)}</div>
            </div>

            <div class="row">
              <div class="label">Fecha</div>
              <div class="value">${formatDate(cert.created_at)}</div>
            </div>

            <div class="row">
              <div class="label">Código</div>
              <div class="value">${escapeHtml(cert.certificate_code)}</div>
            </div>

          </div>

          <a 
            class="btn"
            href="${BASE_URL}/api/certificates/${encodeURIComponent(cert.certificate_code)}"
            target="_blank"
          >
            📜 Descargar certificado PDF
          </a>

        </div>

      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    return res.status(500).send('Error validando certificado');
  }
});

// ============================================
// GENERAR PDF CERTIFICADO
// ============================================
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const sql = `
      SELECT
        u.name,
        c.title AS course,
        cert.certificate_code,
        cert.created_at
      FROM certificates cert
      JOIN users u ON cert.user_id = u.id
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.certificate_code = ?
      LIMIT 1
    `;

    const [rows] = await db.promise().query(sql, [code]);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Certificado no encontrado'
      });
    }

    const data = rows[0];

    const fileName = `${data.certificate_code}.pdf`;
    const filePath = path.join(CERT_DIR, fileName);

    // Si ya existe el PDF
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // URL del QR
    const verificationUrl = `${BASE_URL}/api/certificates/verify/${encodeURIComponent(data.certificate_code)}`;

    // Generar QR
    const qrImage = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 220
    });

    // PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // Fondo
    doc.rect(0, 0, pageW, pageH).fill('#F8FAFC');

    // Marco
    doc
      .lineWidth(3)
      .strokeColor('#2563EB')
      .roundedRect(25, 25, pageW - 50, pageH - 50, 18)
      .stroke();

    // Título
    doc
      .font('Helvetica-Bold')
      .fontSize(38)
      .fillColor('#0F172A')
      .text('CERTIFICADO', 0, 70, {
        align: 'center'
      });

    // Texto
    doc
      .font('Helvetica')
      .fontSize(15)
      .fillColor('#334155')
      .text('Se otorga a:', 0, 150, {
        align: 'center'
      });

    // Nombre
    doc
      .font('Helvetica-Bold')
      .fontSize(30)
      .fillColor('#2563EB')
      .text(data.name, 0, 185, {
        align: 'center'
      });

    // Curso
    doc
      .font('Helvetica')
      .fontSize(15)
      .fillColor('#334155')
      .text('Por haber completado exitosamente el curso:', 0, 245, {
        align: 'center'
      });

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#0F172A')
      .text(data.course, 0, 278, {
        align: 'center'
      });

    // Fecha
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#0F172A')
      .text(`Fecha: ${formatDate(data.created_at)}`, 0, 345, {
        align: 'center'
      });

    // Código
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#64748B')
      .text(`Código: ${data.certificate_code}`, 0, 365, {
        align: 'center'
      });

    // Firma
    doc
      .moveTo(pageW / 2 - 90, 415)
      .lineTo(pageW / 2 + 90, 415)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#111827')
      .text('Director Académico', 0, 423, {
        align: 'center'
      });

    // QR
    doc.image(qrImage, pageW - 150, pageH - 150, {
      width: 95
    });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#64748B')
      .text('Escanea para verificar', pageW - 170, pageH - 45, {
        width: 130,
        align: 'center'
      });

    doc.end();

    stream.on('finish', () => {
      return res.sendFile(filePath);
    });

    stream.on('error', err => {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: 'Error generando PDF'
      });
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: 'Error generando certificado'
    });
  }
});

module.exports = router;
