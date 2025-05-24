// models/inventory-model.js
const pool = require("../database"); // Your database connection

// Existing function
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

// New function to get all classifications
async function getClassifications() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification ORDER BY classification_name`
    );
    return data.rows;
  } catch (error) {
    console.error("getClassifications error: " + error);
    throw error;
  }
}

module.exports = {
  getInventoryByClassificationId,
  getClassifications,   // Add this export!
};
