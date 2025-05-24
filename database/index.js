// database/index.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://gab340:gab340@localhost:5500/gab340",
  // If you have SSL config for production, add it here
});

module.exports = pool;

