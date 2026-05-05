const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { verifyToken, isAdmin } = require('../middleware/auth');


// =====================================================
// 🔹 DASHBOARD NORMAL (USUARIO)
// =====================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 👤 USUARIO
    const [userResult] = await db.promise().query(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );
    const user = userResult[0];

    // 📚 CURSOS INSCRITOS
    const [[coursesCount]] = await db.promise().query(
      'SELECT COUNT(*) as total FROM enrollments WHERE user_id = ?',
      [userId]
    );

    // 🎓 CERTIFICADOS
    const [[certificatesCount]] = await db.promise().query(
      'SELECT COUNT(*) as total FROM certificates WHERE user_id = ?',
      [userId]
    );

    // 📊 PROGRESO REAL
    const [[progressResult]] = await db.promise().query(`
      SELECT 
        COUNT(*) as totalLessons,
        SUM(completed = TRUE) as completedLessons
      FROM progress
      WHERE user_id = ?
    `, [userId]);

    const totalLessons = progressResult.totalLessons || 0;
    const completedLessons = progressResult.completedLessons || 0;

    let progress = 0;
    if (totalLessons > 0) {
      progress = Math.round((completedLessons / totalLessons) * 100);
    }

    // 🔹 CERTIFICADOS REALES
const [certificatesResult] = await db.promise().query(`
  SELECT 
    cert.id,
    c.title,
    cert.certificate_code,
    cert.pdf_url,
    cert.created_at
  FROM certificates cert
  JOIN courses c ON cert.course_id = c.id
  WHERE cert.user_id = ?
  ORDER BY cert.created_at DESC
  LIMIT 5
`, [userId]);

    // 🔥 RACHA REAL
    const [[streakResult]] = await db.promise().query(`
      SELECT COUNT(*) as streak
      FROM progress
      WHERE user_id = ? AND completed = TRUE
    `, [userId]);

    const streak = streakResult.streak || 0;

    res.json({
  success: true,
  data: {
    user,
    stats: {
      courses: coursesCount.total,
      progress,
      certificates: certificatesCount.total,
      streak
    },
    certificates: certificatesResult
  }
});

  } catch (error) {
    console.error('❌ Error dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error cargando dashboard'
    });
  }
});

// =====================================================
// 🔹 ACTUALIZAR PERFIL
// =====================================================
router.put('/profile/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, password } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio'
      });
    }

    if (password) {
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.promise().query(
        'UPDATE users SET name = ?, password = ? WHERE id = ?',
        [name, hashedPassword, userId]
      );
    } else {
      await db.promise().query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
      );
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error actualizando perfil'
    });
  }
});

// =====================================================
// 🔹 ADMIN STATS
// =====================================================
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const [[users]] = await db.promise().query('SELECT COUNT(*) AS total FROM users');
    const [[courses]] = await db.promise().query('SELECT COUNT(*) AS total FROM courses');
    const [[certificates]] = await db.promise().query('SELECT COUNT(*) AS total FROM certificates');
    const [[exams]] = await db.promise().query('SELECT COUNT(*) AS total FROM exams');

    res.json({
      success: true,
      stats: {
        users: users.total,
        courses: courses.total,
        certificates: certificates.total,
        exams: exams.total
      }
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 LISTAR USUARIOS
// =====================================================
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ success: true, users });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 CREAR USUARIO (ADMIN O USER)
// =====================================================
router.post('/create-user', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Completa todos los campos'
      });
    }

    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role === 'admin' ? 'admin' : 'user']
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 CAMBIAR ROL (ADMIN ↔ USER)
// =====================================================
router.put('/change-role/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // No puede cambiarse a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio rol'
      });
    }

    // Si intenta quitar admin, verificar que quede al menos 1
    if (role === 'user') {
      const [[adminCount]] = await db.promise().query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'admin'"
      );

      if (adminCount.total <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Debe existir al menos un administrador'
        });
      }
    }

    await db.promise().query(
      `UPDATE users SET role = ? WHERE id = ?`,
      [role === 'admin' ? 'admin' : 'user', id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 ELIMINAR USUARIO
// =====================================================
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (parseInt(id) === adminId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propio usuario'
      });
    }

    const [users] = await db.promise().query(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    if (user.role === 'admin') {
      const [[adminCount]] = await db.promise().query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'admin'"
      );

      if (adminCount.total <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Debe existir al menos un administrador'
        });
      }
    }

    // 🔥 BORRAR DEPENDENCIAS PRIMERO
    await db.promise().query('DELETE FROM activity_log WHERE user_id = ?', [id]);
    await db.promise().query('DELETE FROM progress WHERE user_id = ?', [id]);
    await db.promise().query('DELETE FROM results WHERE user_id = ?', [id]);
    await db.promise().query('DELETE FROM enrollments WHERE user_id = ?', [id]);
    await db.promise().query('DELETE FROM certificates WHERE user_id = ?', [id]);

    // 🔥 BORRAR USUARIO
    await db.promise().query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ success: true });

  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando usuario'
    });
  }
});

// =====================================================
// 🔹 AUDITORÍA
// =====================================================
router.get('/audit', verifyToken, isAdmin, async (req, res) => {
  try {
    const [logs] = await db.promise().query(`
      SELECT 
        a.id,
        u.name AS user_name,
        u.email,
        a.action,
        a.details,
        a.created_at
      FROM activity_log a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    res.json({ success: true, logs });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// =====================================================
// 🔹 CERTIFICADOS ADMIN
// =====================================================
router.get('/certificates', verifyToken, isAdmin, async (req, res) => {
  try {
    const [certificates] = await db.promise().query(`
      SELECT 
        cert.certificate_code,
        u.name AS student,
        c.title AS course,
        cert.created_at
      FROM certificates cert
      JOIN users u ON cert.user_id = u.id
      JOIN courses c ON cert.course_id = c.id
      ORDER BY cert.created_at DESC
    `);

    res.json({ success: true, certificates });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;