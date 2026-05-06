const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

// ============================================
// IMPORTAR RUTAS
// ============================================
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

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(cors({
  origin: [
    'https://sstbrt.com',
    'https://www.sstbrt.com',
    'https://sstbrt-frontend.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache control middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================
app.use(express.static(path.join(__dirname, '../sstbrt-frontend')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// ============================================
// RUTAS API
// ============================================
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

// ============================================
// RUTAS FRONTEND
// ============================================
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

// ============================================
// FALLBACK 404
// ============================================
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../sstbrt-frontend/index.html'));
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============================================
// CREAR ADMIN POR DEFECTO
// ============================================
async function createDefaultAdmin() {
  try {
    const [admins] = await db.promise().query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (admins.length > 0) {
      console.log('✅ Admin ya existe, no se creó otro.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.promise().query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      ['Administrador', 'admin@sstbrt.com', hashedPassword, 'admin']
    );

    console.log('🔥 Admin por defecto creado');
    console.log('📧 Email: admin@sstbrt.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error creando admin por defecto:', error);
  }
}

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;

//createDefaultAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📂 Frontend: ${path.join(__dirname, '../sstbrt-frontend')}`);
    console.log(`🔒 CORS habilitado`);
  });

module.exports = app;
