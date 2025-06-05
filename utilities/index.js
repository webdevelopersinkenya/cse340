const pool = require('../database/'); // Path to your PostgreSQL connection pool

/* ***********************
 * General Utilities
 *************************/

/**
 * Builds the navigation HTML string from database data or hardcoded values.
 * Adjust the SQL query and table/column names to match your database schema
 * or use the hardcoded option if you don't store nav in the DB.
 * @returns {string} The HTML string for the navigation.
 */
async function getNav() {
  let navList = '<ul>';
  try {
    // Option 1: Fetch navigation items from a database table (Recommended for dynamic nav)
    // IMPORTANT: Replace 'navigation_items', 'name', 'link_path', 'order_column' with your actual DB details.
    // Ensure this table and data exist in your PostgreSQL database.
    const sql = 'SELECT name, link_path FROM navigation_items ORDER BY order_column ASC';
    const data = await pool.query(sql);
    const navItems = data.rows;

    // Add 'Home' link explicitly, or ensure it's in your DB
    navList += '<li><a href="/">Home</a></li>';

    navItems.forEach((item) => {
      // Ensure 'active' class is handled by your client-side JS or template logic
      navList += `<li><a href="${item.link_path}">${item.name}</a></li>`;
    });

  } catch (error) {
    console.error("Error building navigation:", error.message, error.stack);
    // Option 2: Hardcode navigation if database query fails or table doesn't exist
    // This is the fallback if Option 1 causes an error
    navList += '<li><a href="/">Home</a></li>';
    navList += '<li><a href="/custom">Custom</a></li>';
    navList += '<li><a href="/sedan">Sedan</a></li>';
    navList += '<li><a href="/suv">SUV</a></li>';
    navList += '<li><a href="/truck">Truck</a></li>';
    console.warn("Using hardcoded navigation due to database error. Please create 'navigation_items' table if dynamic nav is desired.");
  }
  navList += '</ul>';
  return navList;
}

/**
 * Builds a classification select list (e.g., for vehicle types).
 * Fetches data from the 'classification' table.
 * @param {number} [selectedId] - The ID of the classification to be pre-selected.
 * @returns {string} The HTML string for the select list.
 */
async function buildClassificationList(selectedId) {
  try {
    // IMPORTANT: Ensure 'classification' table exists in your PostgreSQL database.
    const sql = 'SELECT classification_id, classification_name FROM classification ORDER BY classification_name ASC';
    const classifications = await pool.query(sql);
    let options = '<select name="classification_id" id="classificationList" required>';
    options += '<option value="">Select a Classification</option>';

    classifications.rows.forEach((row) => {
      const selected = row.classification_id == selectedId ? 'selected' : '';
      options += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`;
    });

    options += '</select>';
    return options;
  } catch (error) {
    console.error("Error building classification list:", error.message, error.stack);
    // If the classification table doesn't exist, this error will be caught.
    // In production, you might want a more graceful fallback than re-throwing.
    throw error;
  }
}

/**
 * Higher-order function to wrap async route handlers for centralized error handling.
 * Prevents repetitive try-catch blocks in every controller function.
 * @param {function} fn - The async function to wrap.
 * @returns {function} An Express middleware function.
 */
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Export all utility functions
module.exports = {
  getNav,
  buildClassificationList,
  handleErrors, // <--- This line is essential for exporting handleErrors
};
