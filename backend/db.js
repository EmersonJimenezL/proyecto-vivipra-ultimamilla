const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "vivipra_db",
  password: "##vivipra.2025",
  port: 5432,
});

module.exports = pool;
