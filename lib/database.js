const mysql = require('mysql2/promise');

// Configuración de base de datos para producción
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agrotico_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Si hay una URL de base de datos completa (para servicios como PlanetScale, Neon, etc.)
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = url.hostname;
  dbConfig.port = url.port || 3306;
  dbConfig.user = url.username;
  dbConfig.password = url.password;
  dbConfig.database = url.pathname.slice(1);
  
  // Configuración SSL para servicios en la nube
  if (url.protocol === 'mysql:' || url.protocol === 'mysqls:') {
    dbConfig.ssl = { rejectUnauthorized: false };
  }
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error.message);
    throw error;
  }
}

// Función para cerrar el pool
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de conexiones cerrado');
  } catch (error) {
    console.error('❌ Error cerrando pool:', error.message);
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  closePool
};
