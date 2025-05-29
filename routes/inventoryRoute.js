
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');
const inventoryModel = require('../models/inventory-model');
// GET management view
router.get('/', invController.showManagement)
router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildDetailView)
);
// GET form
router.get('/add-classification', invController.showAddClassification)

// POST form
router.post(
  '/add-classification',
  invController.validateClassification, // server-side validation
  invController.addClassification
)

router.get("/error/test", (req, res, next) => {
  throw new Error("Intentional error for testing 500");
});
// EXPORT THE ROUTER AFTER DEFINING ALL ROUTES
module.exports = router;
