// /database/index.js

const { Pool } = require("pg");

// Load environment variables if using dotenv (important for local development)
require("dotenv").config();

/* ***********************
 * PostgreSQL Connection Pool Setup
 * Configures the database connection pool with crucial settings
 * to improve stability and prevent ECONNRESET errors.
 *************************/
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your database connection URL from environment variables
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // *** CRUCIAL SETTINGS FOR ECONNRESET ***
  max: 20, // Maximum number of clients (connections) in the pool. Adjust based on your Render.com DB tier.
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds. This MUST be less than your DB server's idle timeout.
  connectionTimeoutMillis: 5000, // How long to wait for a client to be acquired from the pool (5 seconds)
});

/* ***********************
 * Optional: Test Database Connection on Startup
 * A simple query to verify the connection is working.
 *************************/
pool.query('SELECT 1 + 1 AS solution')
  .then(res => {
    console.log("Database connection successful. Solution:", res.rows[0].solution);
  })
  .catch(err => {
    console.error("Database connection failed on startup:", err.message, err.stack);
    // You might want to exit the process or take other action if DB connection is critical for app startup
    // process.exit(1);
  });

// Export the pool so it can be used throughout the application
module.exports = pool;
