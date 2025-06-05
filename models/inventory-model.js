// Add new inventory item
async function addInventoryItem(data) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_image,
    inv_thumbnail,
  } = data

  try {
    const sql = `INSERT INTO inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
    const result = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
    ])
    return result
  } catch (error) {
    throw error
  }
}

module.exports = {
  addInventoryItem,
  // other model functions...
}
