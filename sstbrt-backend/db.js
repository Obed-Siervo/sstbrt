const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123', // tu pass
  database: 'sstbrt_db'
});

db.connect(err => {
  if (err) console.error(err);
  else console.log('MySQL conectado 🔥');
});

module.exports = db;

