const pool = require('../database/');

/* ***********************
 * General Utilities
 *************************/

/**
 * Builds the navigation HTML string from database data or hardcoded values.
 * @returns {string} The HTML string for the navigation.
 */
async function getNav() {
  let navList = '<ul>';
  try {
    const sql = 'SELECT name, link_path FROM navigation_items ORDER BY order_column ASC';
    const data = await pool.query(sql);
    const navItems = data.rows;

    navList += '<li><a href="/">Home</a></li>';

    navItems.forEach((item) => {
      navList += `<li><a href="${item.link_path}">${item.name}</a></li>`;
    });

  } catch (error) {
    console.error("Error building navigation:", error.message, error.stack);
    navList += '<li><a href="/">Home</a></li>';
    navList += '<li><a href="/custom">Custom</a></li>';
    navList += '<li><a href="/sedan">Sedan</a></li>';
    navList += '<li><a href="/suv">SUV</a></li>';
    navList += '<li><a href="/truck">Truck</a></li>';
    console.warn("Using hardcoded navigation due to database error or missing 'navigation_items' table.");
  }
  navList += '</ul>';
  return navList;
}

/**
 * Builds a classification select list (e.g., for vehicle types).
 * @param {number} [selectedId] - The ID of the classification to be pre-selected.
 * @returns {string} The HTML string for the select list.
 */
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
    console.error("Error building classification list:", error.message, error.stack);
    throw error;
  }
}

/**
 * Builds the HTML for a single vehicle detail view. (Existing function)
 * @param {object} vehicleData - The object containing all vehicle details.
 * @returns {string} The HTML string for the vehicle detail view.
 */
async function buildVehicleDetail(vehicleData) {
    if (!vehicleData) {
        return '<p class="error-message">Vehicle data is unavailable.</p>';
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(vehicleData.inv_price);

    const formattedMileage = new Intl.NumberFormat('en-US').format(vehicleData.inv_miles);

    let detailHtml = `
        <div class="vehicle-detail-container">
            <div class="vehicle-detail-image">
                <img src="${vehicleData.inv_image}" alt="${vehicleData.inv_make} ${vehicleData.inv_model} - Full Image" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/000000?text=Image+Missing';">
            </div>
            <div class="vehicle-detail-info">
                <h1>${vehicleData.inv_make} ${vehicleData.inv_model}</h1>
                <p class="price"><strong>Price:</strong> ${formattedPrice}</p>
                
                <hr>
                <p><strong>Year:</strong> ${vehicleData.inv_year}</p>
                <p><strong>Mileage:</strong> ${formattedMileage} miles</p>
                <p><strong>Color:</strong> ${vehicleData.inv_color}</p>
                <p><strong>Description:</strong> ${vehicleData.inv_description}</p>
            </div>
        </div>
    `;
    return detailHtml;
}

/**
 * Builds the HTML grid of inventory items for a classification view.
 * @param {Array<object>} data - An array of inventory item objects.
 * @returns {string} The HTML string for the grid.
 */
async function buildClassificationGrid(data) {
  let grid = '';
  if (data.length > 0) {
    grid = '<div class="inv-classification-grid">';
    data.forEach(vehicle => {
      grid += `
        <div class="inv-card">
          <a href="/inv/detail/${vehicle.inv_id}" title="View details for ${vehicle.inv_make} ${vehicle.inv_model}">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" onerror="this.onerror=null;this.src='https://placehold.co/280x200/CCCCCC/000000?text=Thumbnail+Missing';">
          </a>
          <div class="inv-card-content">
            <h2>
              <a href="/inv/detail/${vehicle.inv_id}" title="View details for ${vehicle.inv_make} ${vehicle.inv_model}">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(vehicle.inv_price)}</span>
          </div>
        </div>
      `;
    });
    grid += '</div>';
  } else {
    grid += '<p class="notice">Sorry, no vehicles matching this classification could be found.</p>';
  }
  return grid;
}


/**
 * Higher-order function to wrap async route handlers for centralized error handling.
 * @param {function} fn - The async function to wrap.
 * @returns {function} An Express middleware function.
 */
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  getNav,
  buildClassificationList,
  buildVehicleDetail,
  buildClassificationGrid,
  handleErrors,
};
