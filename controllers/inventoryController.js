const inventoryModel = require("../models/inventory-model");
const utilities = require("../utilities/"); // Assuming utilities/index.js

/* ***************************
 * Build inventory by classification view
 * (Existing function, just for context of where buildByInvId fits)
 ***************************** */
async function buildByClassificationId(req, res) {
  // ... (your existing code for building classification view) ...
  // This function is assumed to already exist and work.
  // Example placeholder for its structure:
  const classification_id = parseInt(req.params.classificationId);
  const data = await inventoryModel.getInventoryByClassificationId(classification_id); // Assuming this model function exists
  const grid = await utilities.buildClassificationGrid(data); // Assuming this utility function exists
  let nav = await utilities.getNav();
  const classificationName = data[0].classification_name;
  res.render("inventory/classification", {
    title: classificationName + " Vehicles",
    nav,
    grid,
  });
}

/* ***************************
 * Build inventory item detail view
 * Purpose: Retrieves specific vehicle details and renders them in a dedicated view.
 * Route: /inv/detail/:invId
 ***************************** */
async function buildByInvId(req, res) {
  const inv_id = parseInt(req.params.invId); // Get inventory ID from URL parameters

  // Ensure inv_id is a valid number
  if (isNaN(inv_id)) {
    throw new Error("Invalid inventory ID provided."); // Trigger 500 error if ID is not a number
  }

  // Retrieve vehicle data from the model
  const vehicleData = await inventoryModel.getInventoryById(inv_id);

  // Check if vehicle data was found
  if (!vehicleData) {
    // If no vehicle is found, create a 404 error
    const error = new Error("Vehicle Not Found");
    error.status = 404;
    throw error; // Pass the 404 error to the error handling middleware
  }

  // Build the HTML for the vehicle detail view using a utility function
  const detailHtml = await utilities.buildVehicleDetail(vehicleData);

  // Get navigation for the layout
  let nav = await utilities.getNav();

  // Render the detail view, passing title, nav, and the generated detail HTML
  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`, // Dynamic title
    nav,
    body: detailHtml, // Inject the HTML string into the layout's body placeholder
  });
}

module.exports = {
  // buildByClassificationId, // Export your existing function if it's here
  buildByInvId,
};
