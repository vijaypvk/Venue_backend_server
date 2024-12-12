const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: "localhost",
  port: 3307,
  user: "test",
  password: "test",
  database: "booking",
  // Optional - Set the maximum number of connections in the pool
  connectionLimit: 20,
});

module.exports = db;