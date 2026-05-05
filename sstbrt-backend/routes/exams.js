const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ============================================
// CREAR EXAMEN FINAL (1 POR CURSO)
// ============================================
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { course_id, title } = req.body;

    const [existing] = await db.promise().query(
      'SELECT id FROM exams WHERE course_id = ? LIMIT 1',
      [course_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este curso ya tiene un examen final'
      });
    }

    await db.promise().query(
      'INSERT INTO exams (course_id, title) VALUES (?, ?)',
      [course_id, title]
    );

    res.status(201).json({
      success: true,
      message: 'Examen final creado'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error creando examen'
    });
  }
});

// ============================================
// OBTENER EXAMEN FINAL POR CURSO
// ============================================
router.get('/course/:course_id', verifyToken, async (req, res) => {
  try {
    const courseId = req.params.course_id;

    const [[exam]] = await db.promise().query(
      'SELECT * FROM exams WHERE course_id = ? LIMIT 1',
      [courseId]
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    const [questions] = await db.promise().query(`
      SELECT 
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d
      FROM questions
      WHERE exam_id = ?
      ORDER BY id ASC
    `, [exam.id]);

    res.status(200).json({
      success: true,
      exam,
      questions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error cargando examen'
    });
  }
});

// ============================================
// ENVIAR RESPUESTAS EXAMEN FINAL
// ============================================
router.post('/:exam_id/submit', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const examId = req.params.exam_id;
    const { answers } = req.body;

    const [questions] = await db.promise().query(`
      SELECT id, correct_option
      FROM questions
      WHERE exam_id = ?
    `, [examId]);

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Este examen no tiene preguntas'
      });
    }

    let correct = 0;

    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;

    await db.promise().query(`
      INSERT INTO results (user_id, exam_id, score, passed)
      VALUES (?, ?, ?, ?)
    `, [userId, examId, score, passed]);

    // 🔥 NUEVO: Crear certificado si aprobó
    if (passed) {
      const [examInfo] = await db.promise().query(
        `SELECT course_id FROM exams WHERE id = ?`,
        [examId]
      );

      if (examInfo.length === 0) {
        return res.status(500).json({ success: false, message: 'Examen no encontrado' });
      }

      const certificateCode = `SSTBRT-${Date.now()}`;

      await db.promise().query(`
        INSERT INTO certificates (user_id, course_id, certificate_code)
        VALUES (?, ?, ?)
      `, [userId, examInfo[0].course_id, certificateCode]);

      res.status(200).json({
        success: true,
        score,
        passed,
        certificateCode  // 🔥 Nuevo campo
      });
    } else {
      res.status(200).json({
        success: true,
        score,
        passed
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error enviando examen'
    });
  }
});

module.exports = router;