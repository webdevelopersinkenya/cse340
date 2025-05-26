const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const buildById = async (req, res, next) => {
  const invId = req.params.invId;
  try {
    const data = await invModel.getInventoryById(invId);
    if (!data) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }

    // Use the custom utility function to build the HTML
    const htmlContent = utilities.buildDetailHTML(data);

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      htmlContent
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { buildById };
