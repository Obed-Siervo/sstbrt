const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// 🔹 Marcar lección como completada
router.post('/complete', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { lesson_id } = req.body;

  const sql = `
    INSERT INTO progress (user_id, lesson_id, completed, completed_at)
    VALUES (?, ?, TRUE, NOW())
    ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()
  `;

  db.query(sql, [user_id, lesson_id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error guardando progreso');
    }
    res.send('Lección completada');
  });
});

// 🔹 Ver progreso por curso
router.get('/:course_id', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { course_id } = req.params;

  const sql = `
    SELECT l.id AS lesson_id, p.completed
    FROM lessons l
    JOIN levels lv ON l.level_id = lv.id
    LEFT JOIN progress p 
      ON p.lesson_id = l.id AND p.user_id = ?
    WHERE lv.course_id = ?
  `;

  db.query(sql, [user_id, course_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

module.exports = router;