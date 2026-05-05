const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// 🔹 Crear nivel (admin)
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { course_id, level_number, title } = req.body;

  const sql = 'INSERT INTO levels (course_id, level_number, title) VALUES (?, ?, ?)';
  db.query(sql, [course_id, level_number, title], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Nivel creado');
  });
});

// 🔹 Obtener niveles por curso
router.get('/:course_id', (req, res) => {
  const { course_id } = req.params;

  const sql = 'SELECT * FROM levels WHERE course_id = ? ORDER BY level_number ASC';
  db.query(sql, [course_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

module.exports = router;