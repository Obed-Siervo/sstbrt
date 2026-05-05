const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Enviar respuestas y calcular nota
router.post('/', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { exam_id, answers } = req.body;

  // 1. Buscar nivel del examen
  const examSql = `
    SELECT level_id
    FROM exams
    WHERE id = ?
  `;

  db.query(examSql, [exam_id], (err, examResult) => {
    if (err) return res.status(500).send(err);
    if (examResult.length === 0) return res.status(404).send({ message: 'Examen no encontrado' });

    const level_id = examResult[0].level_id;

    // 2. Contar lecciones del nivel
    const lessonsSql = `
      SELECT COUNT(*) AS totalLessons
      FROM lessons
      WHERE level_id = ?
    `;

    db.query(lessonsSql, [level_id], (err, lessonResult) => {
      if (err) return res.status(500).send(err);

      const totalLessons = lessonResult[0].totalLessons;

      // 3. Contar progreso completado
      const progressSql = `
        SELECT COUNT(*) AS completedLessons
        FROM progress p
        JOIN lessons l ON p.lesson_id = l.id
        WHERE p.user_id = ?
          AND l.level_id = ?
          AND p.completed = TRUE
      `;

      db.query(progressSql, [user_id, level_id], (err, progressResult) => {
        if (err) return res.status(500).send(err);

        const completedLessons = progressResult[0].completedLessons;

        if (completedLessons < totalLessons) {
          return res.status(403).send({
            message: 'Debes completar todas las lecciones antes de hacer el examen'
          });
        }

        // 4. Verificar si ya aprobó este examen
        const checkResultSql = `
          SELECT id
          FROM results
          WHERE user_id = ? AND exam_id = ? AND passed = TRUE
          LIMIT 1
        `;

        db.query(checkResultSql, [user_id, exam_id], (err, existingResult) => {
          if (err) return res.status(500).send(err);

          if (existingResult.length > 0) {
            return res.status(403).send({
              message: 'Ya aprobaste este examen'
            });
          }

          // 5. Buscar preguntas
          const questionsSql = `
            SELECT id, correct_option
            FROM questions
            WHERE exam_id = ?
          `;

          db.query(questionsSql, [exam_id], (err, questions) => {
            if (err) return res.status(500).send(err);
            if (questions.length === 0) {
              return res.status(404).send({ message: 'Este examen no tiene preguntas' });
            }

            let correct = 0;

            questions.forEach(q => {
              if (answers[q.id] === q.correct_option) {
                correct++;
              }
            });

            const score = (correct / questions.length) * 10;
            const passed = score >= 7;

            // 6. Guardar resultado
            const insertSql = `
              INSERT INTO results (user_id, exam_id, score, passed)
              VALUES (?, ?, ?, ?)
            `;
            db.query(insertSql, [user_id, exam_id, score, passed], (err) => {
              if (err) return res.status(500).send(err);

              if (!passed) {
                return res.send({ score, passed });
              }
              // ✅ GENERAR CERTIFICADO SI APROBÓ
              const certificateCode = `SSTBRT-${Date.now()}`;
              const certificateSql = `
              iNSERT INTO certificates (user_id, course_id, certificate_code, created_at)
              SELECT ?, l.course_id, ?, NOW()
              FROM exams e
              JOIN levels l ON e.level_id = l.id
              WHERE e.id = ?`;
              db.query(certificateSql, [user_id, certificateCode, exam_id], (err) => {
                if (err) return res.status(500).send(err);
                res.send({
                  score,
                  passed,
                  certificateCode
                });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;