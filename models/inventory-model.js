const pool = require("../database");

/* ***************************
 * Get inventory item by inv_id
 * Parameterized statement
 ***************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM inventory WHERE inv_id = $1",
      [inv_id]
    );
    return data.rows[0]; // Return the first (and only) matching row
  } catch (error) {
    console.error("getInventoryById error: " + error);
    throw new Error("Failed to get inventory item by ID."); // Re-throw a custom error
  }
}

module.exports = {
  getInventoryById,
};
