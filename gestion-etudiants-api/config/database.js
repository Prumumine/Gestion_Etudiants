const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecole'
});

db.connect(err => {
  if (err) {
    console.error('Erreur MySQL :', err.message);
    process.exit(1);
  }
  console.log('MySQL connecté');
});

module.exports = db;
