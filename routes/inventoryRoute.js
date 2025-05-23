

const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');
const inventoryModel = require('../models/inventory-model');

router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildDetailView)
);

router.get("/error/test", (req, res, next) => {
  throw new Error("Intentional error for testing 500");

  module.exports = router;
});

