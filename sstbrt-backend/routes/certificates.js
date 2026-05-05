const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const db = require('../db');

const router = express.Router();

const CERT_DIR = path.join(__dirname, '..', 'certificates');

// Asegurar que exista la carpeta certificates
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
// PÁGINA DE VALIDACIÓN DEL CERTIFICADO
// El QR apuntará aquí
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
        <!doctype html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado no válido</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #F8FAFC;
              color: #0F172A;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
            }
            .card {
              background: #fff;
              padding: 32px;
              border-radius: 18px;
              box-shadow: 0 10px 30px rgba(0,0,0,.08);
              border: 1px solid #E2E8F0;
              max-width: 520px;
              width: calc(100% - 32px);
              text-align: center;
            }
            h1 { margin: 0 0 12px; color: #DC2626; }
            p { color: #64748B; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Certificado no válido</h1>
            <p>El código no existe o no fue encontrado en el sistema.</p>
          </div>
        </body>
        </html>
      `);
    }

    const cert = rows[0];
    const downloadUrl = `/api/certificates/${encodeURIComponent(cert.certificate_code)}`;

    return res.send(`
      <!doctype html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validación de certificado</title>
        <style>
          :root {
            --primary: #2563EB;
            --primary-dark: #1D4ED8;
            --success: #10B981;
            --dark: #0F172A;
            --gray-500: #64748B;
            --gray-200: #E2E8F0;
            --gray-50: #F8FAFC;
            --white: #FFFFFF;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, Arial, sans-serif;
            background: linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%);
            color: var(--dark);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .card {
            width: 100%;
            max-width: 620px;
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 22px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, .10);
            padding: 30px;
            text-align: center;
          }
          .badge {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 999px;
            background: #DCFCE7;
            color: #15803D;
            font-weight: 700;
            font-size: 0.85rem;
            margin-bottom: 14px;
          }
          h1 {
            margin: 0 0 10px;
            font-size: 2rem;
          }
          .muted {
            color: var(--gray-500);
            margin: 0 0 24px;
          }
          .info {
            background: var(--gray-50);
            border: 1px solid var(--gray-200);
            border-radius: 16px;
            padding: 18px;
            text-align: left;
            margin-bottom: 22px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 10px 0;
            border-bottom: 1px solid #EEF2F7;
          }
          .row:last-child { border-bottom: none; }
          .label {
            color: var(--gray-500);
            font-weight: 600;
          }
          .value {
            color: var(--dark);
            font-weight: 700;
            text-align: right;
          }
          .actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .btn {
            display: inline-block;
            padding: 12px 18px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            transition: .25s ease;
          }
          .btn-primary {
            background: var(--primary);
            color: #fff;
          }
          .btn-primary:hover { background: var(--primary-dark); }
          .btn-secondary {
            background: #E2E8F0;
            color: #0F172A;
          }
          .btn-secondary:hover { background: #CBD5E1; }
          .small {
            margin-top: 16px;
            font-size: .85rem;
            color: var(--gray-500);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Certificado válido</div>
          <h1>${escapeHtml(cert.name)}</h1>
          <p class="muted">Este certificado ha sido registrado correctamente en SSTBRT Academy.</p>

          <div class="info">
            <div class="row">
              <div class="label">Curso</div>
              <div class="value">${escapeHtml(cert.course)}</div>
            </div>
            <div class="row">
              <div class="label">Fecha de emisión</div>
              <div class="value">${formatDate(cert.created_at)}</div>
            </div>
            <div class="row">
              <div class="label">Código de verificación</div>
              <div class="value">${escapeHtml(cert.certificate_code)}</div>
            </div>
          </div>

          <div class="actions">
            <a class="btn btn-primary" href="${downloadUrl}" target="_blank" rel="noopener noreferrer">
              Descargar certificado PDF
            </a>
            <a class="btn btn-secondary" href="/">
              Ir al inicio
            </a>
          </div>

          <div class="small">
            Si este certificado fue compartido por QR, puedes verificarlo aquí.
          </div>
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
// GENERAR / SERVIR PDF DEL CERTIFICADO
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
    const publicUrl = `/api/certificates/${fileName}`;

    // Si ya existe el PDF, lo servimos
    if (fs.existsSync(filePath)) {
      await db.promise().query(
        `UPDATE certificates SET pdf_url = ? WHERE certificate_code = ?`,
        [publicUrl, code]
      ).catch(() => {});

      return res.sendFile(filePath);
    }

    // QR que apunta a la página de validación
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/certificates/${data.certificate_code}`;
      const qrImage = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 220
    });

    // Crear PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const outerMargin = 22;

    // Fondo
    doc.rect(0, 0, pageW, pageH).fill('#F8FAFC');

    // Marco principal
    doc
      .lineWidth(3)
      .strokeColor('#2563EB')
      .roundedRect(
        outerMargin,
        outerMargin,
        pageW - outerMargin * 2,
        pageH - outerMargin * 2,
        18
      )
      .stroke();

    // Marco interior
    doc
      .lineWidth(1)
      .strokeColor('#BFDBFE')
      .roundedRect(
        outerMargin + 8,
        outerMargin + 8,
        pageW - (outerMargin + 8) * 2,
        pageH - (outerMargin + 8) * 2,
        14
      )
      .stroke();

    // Encabezado
    doc
      .font('Helvetica')
      .fontSize(16)
      .fillColor('#64748B')
      .text('SSTBRT Academy', 0, 46, { align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(40)
      .fillColor('#0F172A')
      .text('CERTIFICADO', 0, 78, { align: 'center' });

    // Línea decorativa
    doc
      .moveTo(pageW / 2 - 82, 128)
      .lineTo(pageW / 2 + 82, 128)
      .lineWidth(2)
      .strokeColor('#2563EB')
      .stroke();

    // Texto principal
    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#334155')
      .text('Se otorga a:', 0, 152, { align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(30)
      .fillColor('#2563EB')
      .text(data.name, 0, 184, { align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(13)
      .fillColor('#334155')
      .text('Por haber completado exitosamente el curso:', 0, 240, { align: 'center' });

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#0F172A')
      .text(data.course, 0, 268, { align: 'center' });

    // Fecha y código
    const formattedDate = formatDate(data.created_at);

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#0F172A')
      .text(`Fecha: ${formattedDate}`, 0, 342, { align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#64748B')
      .text(`Código de verificación: ${data.certificate_code}`, 0, 363, {
        align: 'center'
      });

    // Firma
    doc
      .moveTo(pageW / 2 - 90, 406)
      .lineTo(pageW / 2 + 90, 406)
      .lineWidth(1)
      .strokeColor('#111827')
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#111827')
      .text('Director Académico', 0, 414, { align: 'center' });

    // QR dentro del marco
    const qrBoxW = 132;
    const qrBoxH = 132;
    const qrBoxX = pageW - outerMargin - qrBoxW;
    const qrBoxY = pageH - outerMargin - qrBoxH;

    doc
      .roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 12)
      .fillAndStroke('#FFFFFF', '#E2E8F0');

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#334155')
      .text('VERIFICACIÓN QR', qrBoxX, qrBoxY + 10, {
        width: qrBoxW,
        align: 'center'
      });

    doc.image(qrImage, qrBoxX + 24, qrBoxY + 24, {
      width: 84
    });

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#64748B')
      .text('Escanea para validar', qrBoxX, qrBoxY + 110, {
        width: qrBoxW,
        align: 'center'
      });

    doc.end();

    stream.on('finish', async () => {
      try {
        await db.promise().query(
          `UPDATE certificates SET pdf_url = ? WHERE certificate_code = ?`,
          [publicUrl, code]
        );
      } catch (e) {
        console.error('Error actualizando pdf_url:', e.message);
      }

      return res.sendFile(filePath);
    });

    stream.on('error', (err) => {
      console.error('Error escribiendo PDF:', err);
      return res.status(500).json({
        success: false,
        message: 'Error generando el PDF'
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