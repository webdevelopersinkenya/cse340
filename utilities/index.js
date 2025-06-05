const pool = require('../database/index.js')

// Build classification select list with optional selected id
async function buildClassificationList(selectedId) {
  try {
    const sql = 'SELECT classification_id, classification_name FROM classification ORDER BY classification_name ASC'
    const classifications = await pool.query(sql)
    let options = '<select name="classification_id" id="classificationList" required>'
    options += '<option value="">Select a Classification</option>'

    classifications.rows.forEach((row) => {
      const selected = row.classification_id == selectedId ? 'selected' : ''
      options += `<option value="${row.classification_id}" ${selected}>${row.classification_name}</option>`
    })

    options += '</select>'
    return options
  } catch (error) {
    throw error
  }
}

module.exports = {
  buildClassificationList,
}
