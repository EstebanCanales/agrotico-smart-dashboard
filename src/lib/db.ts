
import { createPool } from 'mysql2/promise';

// Since config.js is a CommonJS module, we use require
const config = require('../../config');

if (!config.database) {
  throw new Error('Database configuration is missing in config.js');
}

// Create the connection pool.
const pool = createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
