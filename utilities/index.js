// utilities/index.js
const invModel = require("../models/inventory-model");

// Build navigation bar from classifications
async function getNav() {
  try {
    const data = await invModel.getClassifications();
    // Check if data and data.rows exist and are arrays
    const classifications = data?.rows ?? [];

    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    classifications.forEach((row) => {
      list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error in getNav:", error.message);
    return "<ul><li><a href='/' title='Home page'>Home</a></li></ul>";
  }
}

// Build grid of vehicle listings
function buildClassificationGrid(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  let grid = '<ul id="inv-display">';
  data.forEach((vehicle) => {
    const priceFormatted = new Intl.NumberFormat("en-US").format(vehicle.inv_price);
    grid += `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${priceFormatted}</span>
        </div>
      </li>
    `;
  });
  grid += "</ul>";
  return grid;
}

// Build detailed view of a single vehicle
function buildVehicleDetailHtml(vehicle) {
  if (!vehicle) {
    return "<p>Vehicle details not available.</p>";
  }

  const priceFormatted = Number(vehicle.inv_price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const milesFormatted = Number(vehicle.inv_miles).toLocaleString("en-US");

  return `
    <section class="vehicle-detail">
      <div class="vehicle-image">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> ${priceFormatted}</p>
        <p><strong>Mileage:</strong> ${milesFormatted} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </section>
  `;
}

// Wrapper to catch and forward errors in controllers
function handleErrors(controller) {
  return async function (req, res, next) {
    try {
      await controller(req, res, next);
    } catch (err) {
      console.error("Controller error:", err.message);
      next(err);
    }
  };
}

module.exports = {
  getNav,
  buildClassificationGrid,
  buildVehicleDetailHtml,
  handleErrors,
};
