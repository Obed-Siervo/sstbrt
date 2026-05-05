const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();


// =====================================================
// 🔹 CATÁLOGO GENERAL (USUARIOS)
// =====================================================
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [courses] = await db.promise().query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.created_at,
        c.is_active,
        c.image,

        EXISTS(
          SELECT 1
          FROM enrollments e
          WHERE e.course_id = c.id
            AND e.user_id = ?
        ) AS enrolled

      FROM courses c
      WHERE c.is_active = TRUE
      ORDER BY c.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 MIS CURSOS
// =====================================================
router.get('/my-courses', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [courses] = await db.promise().query(`
      SELECT 
        c.id,
        c.title,
        c.description,

        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN l.id END) AS completed_lessons,

        ROUND(
          (
            COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN l.id END) * 100.0
          ) / NULLIF(COUNT(DISTINCT l.id), 0)
        ) AS progress

      FROM enrollments e
      INNER JOIN courses c ON c.id = e.course_id
      LEFT JOIN levels lv ON lv.course_id = c.id
      LEFT JOIN lessons l ON l.level_id = lv.id
      LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = e.user_id

      WHERE e.user_id = ?
      GROUP BY c.id
      ORDER BY e.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 DETALLE DE CURSO
// =====================================================
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const [courseRows] = await db.promise().query(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.image,
        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN l.id END) AS completed_lessons,
        ROUND(
          (
            COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN l.id END) * 100.0
          ) / NULLIF(COUNT(DISTINCT l.id), 0)
        ) AS progress
      FROM courses c
      LEFT JOIN levels lv ON lv.course_id = c.id
      LEFT JOIN lessons l ON l.level_id = lv.id
      LEFT JOIN progress p 
        ON p.lesson_id = l.id 
        AND p.user_id = ?
      WHERE c.id = ?
      GROUP BY c.id
      LIMIT 1
    `, [userId, courseId]);

    if (!courseRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    const course = courseRows[0];

    const [levels] = await db.promise().query(`
      SELECT id, level_number, title
      FROM levels
      WHERE course_id = ?
      ORDER BY level_number ASC
    `, [courseId]);

    for (const level of levels) {
      const [lessons] = await db.promise().query(`
        SELECT
          l.id,
          l.title,
          l.type,
          l.content_url,
          l.order_number,
          COALESCE(p.completed, FALSE) AS completed
        FROM lessons l
        LEFT JOIN progress p
          ON p.lesson_id = l.id
          AND p.user_id = ?
        WHERE l.level_id = ?
        ORDER BY l.order_number ASC
      `, [userId, level.id]);

      level.lessons = lessons;
    }

    const [[finalExam]] = await db.promise().query(`
      SELECT id, title
      FROM exams
      WHERE course_id = ?
      LIMIT 1
    `, [courseId]);

    course.image = course.image || '/images/default-course.jpg';
    course.levels = levels;
    course.finalExam = finalExam || null;

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('❌ Error loading course detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error cargando curso'
    });
  }
});

// =====================================================
// 🔹 INSCRIBIRSE A CURSO
// =====================================================
router.post('/:id/enroll', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const [existing] = await db.promise().query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya estás inscrito en este curso'
      });
    }

    await db.promise().query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    res.status(201).json({
      success: true,
      message: 'Inscripción completada'
    });

  } catch (error) {
    console.error('Error enrolling course:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inscribirse'
    });
  }
});


// =====================================================
// 🔹 ADMIN - VER TODOS LOS CURSOS
// =====================================================
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const [courses] = await db.promise().query(`
      SELECT id, title, description, image, is_active, created_at
      FROM courses
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      courses
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 ADMIN - CREAR
// =====================================================
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, image, is_active } = req.body;

    await db.promise().query(`
      INSERT INTO courses (title, description, image, is_active)
      VALUES (?, ?, ?, ?)
    `, [
      title,
      description,
      image || null,
      is_active ? 1 : 0
    ]);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 ADMIN - EDITAR
// =====================================================
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, image, is_active } = req.body;

    await db.promise().query(`
      UPDATE courses
      SET title = ?, description = ?, image = ?, is_active = ?
      WHERE id = ?
    `, [
      title,
      description,
      image || null,
      is_active ? 1 : 0,
      req.params.id
    ]);

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// 🔹 ADMIN - ELIMINAR
// =====================================================
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.promise().query(
      `DELETE FROM courses WHERE id = ?`,
      [req.params.id]
    );

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;