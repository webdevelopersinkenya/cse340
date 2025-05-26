const pool = require("../database/");

const getInventoryById = async (invId) => {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [invId]);
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

module.exports = { getInventoryById };
