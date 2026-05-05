const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const logActivity = require('../helpers/logActivity'); // 👈 NUEVO

const router = express.Router();

// ============================================
// REGISTRO
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Por favor completa todos los campos' 
      });
    }

    const [existing] = await db.promise().query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: 'El email ya está registrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // ✅ Registrar actividad
    await logActivity(result.insertId, 'register', 'Se registró en la plataforma');

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      success: true
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Por favor completa todos los campos' 
      });
    }

    const [results] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(401).json({ 
        message: 'Las credenciales no son correctas' 
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
      
    if (!match) {
      return res.status(401).json({ 
        message: 'Las credenciales no son correctas' 
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );

    // ✅ Registrar login
    await logActivity(user.id, 'login', 'Inició sesión');

    res.status(200).json({ 
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// ============================================
// LOGOUT
// ============================================
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ success: false });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key'
    );

    // ✅ Registrar logout
    await logActivity(decoded.id, 'logout', 'Cerró sesión');

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;