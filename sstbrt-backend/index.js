const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const levelRoutes = require('./routes/levels');
const lessonRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');
const examRoutes = require('./routes/exams');
const questionRoutes = require('./routes/questions');
const resultRoutes = require('./routes/results');
const certificatesRoutes = require('./routes/certificates');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

console.log('🔥 INDEX.JS ACTUALIZADO - CORS FIX V3');

// =======================
// CORS MANUAL PRODUCCIÓN
// =======================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log('🌍 ORIGIN:', origin);
  console.log('📌 METHOD:', req.method);
  console.log('📌 URL:', req.originalUrl);

  const allowedOrigins = [
    'https://sstbrt.com',
    'https://www.sstbrt.com',
    'https://sstbrt-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    console.log('✅ PREFLIGHT OPTIONS RESPONDIDO');
    return res.status(204).end();
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// PRUEBA CORS
app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS funcionando correctamente',
    origin: req.headers.origin || null
  });
});

// ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, '../sstbrt-frontend')));
app.use('/certificates-files', express.static(path.join(__dirname, 'certificates')));

// RUTAS API
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// RUTAS FRONTEND
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/index.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/auth.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/dashboard.html'));
});

app.get('/my-courses', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/my-courses.html'));
});

app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/courses.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/admin.html'));
});

app.get('/progress', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/progress.html'));
});

app.get('/certificates', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/certificates.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../sstbrt-frontend/profile.html'));
});

// 404 API
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta API no encontrada'
  });
});

// FALLBACK FRONTEND
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../sstbrt-frontend/index.html'));
});

// ERRORES
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

async function createDefaultAdmin() {
  try {
    const [admins] = await db.promise().query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (admins.length > 0) {
      console.log('✅ Admin ya existe.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.promise().query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ['Administrador', 'admin@sstbrt.com', hashedPassword, 'admin']
    );

    console.log('🔥 Admin creado');
  } catch (error) {
    console.error('❌ Error creando admin:', error);
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🔒 CORS manual habilitado correctamente`);
});

module.exports = app;
