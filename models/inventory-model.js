const pool = require("../database/");

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get inventory item by ID
 * ************************** */
async function getInventoryItemById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Database error when fetching inventory item: " + error.message);
  }
}

/* ***************************
 *  Get all classifications
 * ************************** */
async function getClassifications() {
  try {
    const sql = "SELECT * FROM classification ORDER BY classification_name";
    const data = await pool.query(sql);
    return data;  // contains .rows property
  } catch (error) {
    console.error("getClassifications error: " + error);
    throw error;
  }
}

module.exports = {
  getInventoryByClassificationId,
  getInventoryItemById,
  getClassifications,
};
