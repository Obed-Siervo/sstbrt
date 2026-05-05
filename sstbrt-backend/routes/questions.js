const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// 🔹 Crear pregunta
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { exam_id, question, option_a, option_b, option_c, option_d, correct_option } = req.body;

  const sql = `
    INSERT INTO questions 
    (exam_id, question, option_a, option_b, option_c, option_d, correct_option)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [exam_id, question, option_a, option_b, option_c, option_d, correct_option], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Pregunta creada');
  });
});

module.exports = router;