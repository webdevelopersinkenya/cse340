const pool = require('../database/index.js'); // Assuming this path is correct for your database connection

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
    console.error("Error building classification list:", error); // Log the error
    throw error; // Re-throw the error for upstream handling
  }
}

/**
 * Builds the navigation HTML string from database data.
 * This is a placeholder; you'll need to fetch actual navigation items from your DB.
 * For example, if you have a 'navigation' table with 'name' and 'url' columns.
 * @returns {string} The HTML string for the navigation.
 */
async function getNav() {
  try {
    // You would typically fetch navigation items from a database table here.
    // For demonstration, let's assume a table named 'navigation_items'
    // with columns 'name' and 'link_path'.
    const sql = 'SELECT name, link_path FROM navigation_items ORDER BY order_column ASC'; // Adjust table/column names as per your DB schema
    const data = await pool.query(sql);
    const navItems = data.rows;

    let navList = '<ul>';
    navList += '<li><a href="/">Home</a></li>'; // Always include Home, or fetch it

    navItems.forEach((item) => {
      navList += `<li><a href="${item.link_path}">${item.name}</a></li>`;
    });
    navList += '</ul>';

    return navList;
  } catch (error) {
    console.error("Error building navigation:", error); // Log the error
    // Return a default or empty navigation list in case of error
    return '<ul><li><a href="/">Home</a></li></ul>';
  }
}


// Export both functions so they can be used by other modules
module.exports = {
  buildClassificationList,
  getNav, // <--- IMPORTANT: Export the new getNav function
};
