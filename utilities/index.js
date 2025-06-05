const pool = require('../database/index.js'); // Keep this line, though it won't be used for getNav in this option

// Build classification select list with optional selected id
async function buildClassificationList(selectedId) {
  try {
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
    console.error("Error building classification list:", error);
    throw error;
  }
}

/**
 * Builds the navigation HTML string with hardcoded values.
 * This is a quick fix if you don't want to use a database table for navigation.
 * @returns {string} The HTML string for the navigation.
 */
async function getNav() {
  // Hardcoding navigation items directly
  let navList = '<ul>';
  navList += '<li><a href="/">Home</a></li>';
  navList += '<li><a href="/custom">Custom</a></li>';
  navList += '<li><a href="/sedan">Sedan</a></li>';
  navList += '<li><a href="/suv">SUV</a></li>';
  navList += '<li><a href="/truck">Truck</a></li>';
  navList += '</ul>';

  return navList; // No try/catch needed here as no database call is made
}

// Export both functions
module.exports = {
  buildClassificationList,
  getNav,
};
