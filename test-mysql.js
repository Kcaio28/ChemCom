const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    const [rows] = await connection.query('SHOW DATABASES;');
    console.log('✅ Conexão bem-sucedida!');
    console.table(rows);
    await connection.end();
  } catch (error) {
    console.error('❌ Falha ao conectar:', error.message);
  }
})();
