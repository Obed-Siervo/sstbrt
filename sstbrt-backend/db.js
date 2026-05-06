const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando MySQL:', err);
    return;
  }

  console.log('✅ MySQL conectado');
  connection.release();
});

module.exports = db;
