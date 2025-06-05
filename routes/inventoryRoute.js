const express = require("express");
const router = new express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities/"); // For handleErrors

/* **************************************
 * Route to build inventory by classification view
 * URL: /inv/type/:classificationName
 * classificationName will be a string (e.g., 'Sedan', 'SUV')
 ***************************************/
router.get("/type/:classificationName", utilities.handleErrors(inventoryController.buildByClassificationName));

/* **************************************
 * Route to build single inventory item detail view (existing from previous task)
 * URL: /inv/detail/:invId
 ***************************************/
router.get("/detail/:invId", utilities.handleErrors(inventoryController.buildByInvId));


module.exports = router;

