const inventoryModel = require("../models/inventory-model");
const utilities = require("../utilities/");

/* ***************************
 * Build inventory by classification view
 * Purpose: Retrieves and renders all inventory items for a specific classification.
 * Route: /inv/type/:classificationName
 ***************************** */
async function buildByClassificationName(req, res) {
  const classification_name = req.params.classificationName; // Get classification name from URL

  // Retrieve inventory data by classification name
  const inventoryData = await inventoryModel.getInventoryByClassificationName(classification_name);

  // Check if any inventory data was found
  if (inventoryData.length === 0) {
    // If no vehicles found for the classification, render a 404 error
    const error = new Error(`No vehicles found for ${classification_name} classification.`);
    error.status = 404;
    throw error; // Pass 404 error to global handler
  }

  // Build the HTML grid for classified vehicles using a utility function
  const gridHtml = await utilities.buildClassificationGrid(inventoryData);

  // Get navigation for the layout
  let nav = await utilities.getNav();

  // Render the classification view
  res.render("inventory/classification", {
    title: `${classification_name} Vehicles`, // Dynamic title
    nav,
    grid: gridHtml, // Pass the generated HTML grid to the view
  });
}

/* ***************************
 * Build inventory item detail view (Existing function)
 * Purpose: Retrieves specific vehicle details and renders them in a dedicated view.
 * Route: /inv/detail/:invId
 ***************************** */
async function buildByInvId(req, res) {
  const inv_id = parseInt(req.params.invId);

  if (isNaN(inv_id)) {
    throw new Error("Invalid inventory ID provided.");
  }

  const vehicleData = await inventoryModel.getInventoryById(inv_id);

  if (!vehicleData) {
    const error = new Error("Vehicle Not Found");
    error.status = 404;
    throw error;
  }

  const detailHtml = await utilities.buildVehicleDetail(vehicleData);
  let nav = await utilities.getNav();

  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    body: detailHtml, // Inject the HTML string into the layout's body placeholder
  });
}

module.exports = {
  buildByClassificationName, // Export the new function
  buildByInvId,
};
