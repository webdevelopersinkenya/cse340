const pool = require("../database");

/* ***************************
 * Get inventory item by inv_id (Existing function)
 * Parameterized statement
 ***************************** */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM inventory LEFT JOIN classification ON inventory.classification_id = classification.classification_id WHERE inv_id = $1",
      [inv_id]
    );
    return data.rows[0]; // Return the first (and only) matching row
  } catch (error) {
    console.error("getInventoryById error: " + error);
    throw new Error("Failed to get inventory item by ID.");
  }
}

/* ***************************
 * Get all inventory items for a specific classification
 * Purpose: Retrieves all vehicles belonging to a given classification.
 * Parameterized statement to prevent SQL Injection.
 ***************************** */
async function getInventoryByClassificationName(classification_name) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory
       LEFT JOIN classification ON inventory.classification_id = classification.classification_id
       WHERE classification.classification_name = $1`,
      [classification_name]
    );
    return data.rows; // Return all matching rows
  } catch (error) {
    console.error("getInventoryByClassificationName error: " + error);
    throw new Error("Failed to get inventory items by classification name.");
  }
}

module.exports = {
  getInventoryById,
  getInventoryByClassificationName, // Export the new function
};
