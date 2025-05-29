const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { body, validationResult } = require('express-validator');

// Show management view
const showManagement = (req, res) => {
  const messages = req.flash('info') || [];
  res.render('inventory/management', { messages });
};

// Show add-classification form
const showAddClassification = (req, res) => {
  res.render('inventory/add-classification', { errors: [] });
};

// Server-side validation for classification
const validateClassification = [
  body('classification_name')
    .trim()
    .notEmpty().withMessage('Name required')
    .isAlphanumeric().withMessage('No spaces or special chars'),
];

// Handle add-classification form submission
const addClassification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('inventory/add-classification', {
      errors: errors.array()
    });
  }
  const { classification_name } = req.body;
  const result = await invModel.insertClassification(classification_name);
  if (result.success) {
    req.flash('info', 'Classification added!');
    res.redirect('/inv');
  } else {
    res.render('inventory/add-classification', {
      errors: [{ msg: 'Insertion failed.' }]
    });
  }
};

// Build the detail view by ID
const buildDetailView = async (req, res, next) => {
  const invId = req.params.inv_id; // note: updated to match your route
  try {
    const data = await invModel.getInventoryById(invId);
    if (!data) {
      const error = new Error("Vehicle not found");
      error.status = 404;
      throw error;
    }
    const htmlContent = utilities.buildDetailHTML(data);
    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      htmlContent
    });
  } catch (err) {
    next(err);
  }
};

// Export all handlers
module.exports = {
  showManagement,
  showAddClassification,
  validateClassification,
  addClassification,
  buildDetailView
};
