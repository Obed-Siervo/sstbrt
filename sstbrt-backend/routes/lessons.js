const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ============================================
// CREAR LECCIÓN (ADMIN)
// ============================================
router.post('/', verifyToken, isAdmin, (req, res) => {
  const { level_id, title, type, content_url, order_number } = req.body;

  const sql = `
    INSERT INTO lessons (level_id, title, type, content_url, order_number)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [level_id, title, type, content_url, order_number], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error creando lección');
    }

    res.send('Lección creada');
  });
});

// ============================================
// OBTENER LECCIONES POR NIVEL (BLOQUEADO POR PROGRESO)
// ============================================
router.get('/:level_id', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const { level_id } = req.params;

  const levelSql = `
    SELECT id, course_id, level_number
    FROM levels
    WHERE id = ?
  `;

  db.query(levelSql, [level_id], (err, levelResult) => {
    if (err) return res.status(500).send(err);

    if (levelResult.length === 0) {
      return res.status(404).send({ message: 'Nivel no encontrado' });
    }

    const currentLevel = levelResult[0];

    // Nivel 1 siempre libre
    if (currentLevel.level_number === 1) {
      return loadLessons(level_id, user_id, res);
    }

    // Buscar nivel anterior
    const prevLevelSql = `
      SELECT id
      FROM levels
      WHERE course_id = ? AND level_number = ?
      LIMIT 1
    `;

    db.query(
      prevLevelSql,
      [currentLevel.course_id, currentLevel.level_number - 1],
      (err, prevLevelResult) => {
        if (err) return res.status(500).send(err);

        if (prevLevelResult.length === 0) {
          return res.status(404).send({ message: 'Nivel anterior no encontrado' });
        }

        const prevLevelId = prevLevelResult[0].id;

        // Validar si completó todas las lecciones del nivel anterior
        const progressSql = `
          SELECT
            COUNT(l.id) AS totalLessons,
            COUNT(CASE WHEN p.completed = TRUE THEN 1 END) AS completedLessons
          FROM lessons l
          LEFT JOIN progress p
            ON p.lesson_id = l.id
            AND p.user_id = ?
          WHERE l.level_id = ?
        `;

        db.query(progressSql, [user_id, prevLevelId], (err, progressResult) => {
          if (err) return res.status(500).send(err);

          const stats = progressResult[0];
          const totalLessons = Number(stats.totalLessons);
          const completedLessons = Number(stats.completedLessons);

          if (totalLessons === 0 || completedLessons < totalLessons) {
            return res.status(403).send({
              message: 'Debes completar el nivel anterior primero'
            });
          }

          loadLessons(level_id, user_id, res);
        });
      }
    );
  });
});

// ============================================
// MARCAR LECCIÓN COMO COMPLETADA
// ============================================
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;

    const [lessonRows] = await db.promise().query(
      'SELECT id FROM lessons WHERE id = ? LIMIT 1',
      [lessonId]
    );

    if (!lessonRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada'
      });
    }

    await db.promise().query(`
      INSERT INTO progress (user_id, lesson_id, completed, completed_at)
      VALUES (?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE
        completed = TRUE,
        completed_at = NOW()
    `, [userId, lessonId]);

    const [[lessonData]] = await db.promise().query(`
      SELECT l.level_id
      FROM lessons l
      WHERE l.id = ?
      LIMIT 1
    `, [lessonId]);

    const levelId = lessonData.level_id;

    const [[levelStats]] = await db.promise().query(`
      SELECT
        COUNT(l.id) AS totalLessons,
        COUNT(CASE WHEN p.completed = TRUE THEN 1 END) AS completedLessons
      FROM lessons l
      LEFT JOIN progress p
        ON p.lesson_id = l.id
        AND p.user_id = ?
      WHERE l.level_id = ?
    `, [userId, levelId]);

    const levelCompleted =
      Number(levelStats.totalLessons) > 0 &&
      Number(levelStats.totalLessons) === Number(levelStats.completedLessons);

    res.status(200).json({
      success: true,
      message: 'Lección completada',
      levelCompleted
    });

  } catch (error) {
    console.error('❌ Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Error completando lección'
    });
  }
});

// ============================================
// HELPER: CARGAR LECCIONES
// ============================================
function loadLessons(level_id, user_id, res) {
  const sql = `
    SELECT 
      l.*,
      COALESCE(p.completed, FALSE) AS completed
    FROM lessons l
    LEFT JOIN progress p
      ON p.lesson_id = l.id
      AND p.user_id = ?
    WHERE l.level_id = ?
    ORDER BY l.order_number ASC
  `;

  db.query(sql, [user_id, level_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
}

module.exports = router;