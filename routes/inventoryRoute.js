const express = require("express");
const router = new express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities/"); // For handleErrors
const { body } = require('express-validator');

/* **************************************
 * Route to build inventory by classification view
 * URL: /inv/type/:classificationName
 ***************************************/
router.get("/type/:classificationName", utilities.handleErrors(inventoryController.buildByClassificationName));

/* **************************************
 * Route to build single inventory item detail view
 * URL: /inv/detail/:invId
 ***************************************/
router.get("/detail/:invId", utilities.handleErrors(inventoryController.buildByInvId));

/* **************************************
 * Route to build Management View (Task 1)
 * URL: / (when mounted at /inv in server.js)
 * Purpose: Displays links to add classification and add inventory
 ***************************************/
router.get("/", utilities.handleErrors(inventoryController.buildManagement)); // <-- This is the route for /inv/

/* **************************************
 * Route to build Add New Classification View (Task 2 - GET)
 * URL: /inv/add-classification
 ***************************************/
router.get("/add-classification", utilities.handleErrors(inventoryController.buildAddClassification));

/* **************************************
 * Route to Process Add New Classification (Task 2 - POST)
 * URL: /inv/add-classification
 ***************************************/
router.post(
  "/add-classification",
  // ... validation ...
  utilities.handleErrors(inventoryController.registerClassification)
);

/* **************************************
 * Route to build Add New Inventory View (Task 3 - GET)
 * URL: /inv/add-inventory
 ***************************************/
router.get("/add-inventory", utilities.handleErrors(inventoryController.buildAddInventory));

/* **************************************
 * Route to Process Add New Inventory (Task 3 - POST)
 * URL: /inv/add-inventory
 ***************************************/
router.post(
  "/add-inventory",
  // ... validation ...
  utilities.handleErrors(inventoryController.registerInventory)
);

module.exports = router;
