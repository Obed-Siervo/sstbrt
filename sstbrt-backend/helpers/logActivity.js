const db = require('../db');

async function logActivity(userId, action, details = null) {
  try {
    await db.promise().query(
      `INSERT INTO activity_log (user_id, action, details)
       VALUES (?, ?, ?)`,
      [userId, action, details]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

module.exports = logActivity;