// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'psicologia_db', 
  password: 'admin123',
  port: 5432,
});

pool.connect()
  .then(() => console.log('🟢 Conectado a PostgreSQL'))
  .catch((err) => console.error('🔴 Error al conectar a PostgreSQL', err));

module.exports = pool;

