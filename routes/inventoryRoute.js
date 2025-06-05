const express = require("express");
const router = new express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities/"); // For handleErrors
const { body } = require('express-validator'); // For server-side validation rules

/* **************************************
 * Route to build inventory by classification view (Existing)
 * URL: /inv/type/:classificationName
 ***************************************/
router.get("/type/:classificationName", utilities.handleErrors(inventoryController.buildByClassificationName));

/* **************************************
 * Route to build single inventory item detail view (Existing)
 * URL: /inv/detail/:invId
 ***************************************/
router.get("/detail/:invId", utilities.handleErrors(inventoryController.buildByInvId));

/* **************************************
 * Route to build Management View (Task 1)
 * URL: /inv/
 * Purpose: Displays links to add classification and add inventory
 ***************************************/
router.get("/", utilities.handleErrors(inventoryController.buildManagement));

/* **************************************
 * Route to build Add New Classification View (Task 2 - GET)
 * URL: /inv/add-classification
 ***************************************/
router.get("/add-classification", utilities.handleErrors(inventoryController.buildAddClassification));

/* **************************************
 * Route to Process Add New Classification (Task 2 - POST)
 * URL: /inv/add-classification
 * Includes server-side validation middleware
 ***************************************/
router.post(
  "/add-classification",
  // Validation chain for classification_name
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/) // No spaces or special characters
    .withMessage("Classification name cannot contain spaces or special characters."),
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
 * Includes server-side validation middleware
 ***************************************/
router.post(
  "/add-inventory",
  // Validation chain for inventory fields
  body("inv_make")
    .trim()
    .isLength({ min: 3 }).withMessage("Make must be at least 3 characters."),
  body("inv_model")
    .trim()
    .isLength({ min: 3 }).withMessage("Model must be at least 3 characters."),
  body("inv_year")
    .trim()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 }).withMessage("Year must be a valid 4-digit number."),
  body("inv_description")
    .trim()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),
  body("inv_image")
    .trim()
    .isLength({ min: 6 }).withMessage("Image path is required."),
  body("inv_thumbnail")
    .trim()
    .isLength({ min: 6 }).withMessage("Thumbnail path is required."),
  body("inv_price")
    .trim()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles")
    .trim()
    .isInt({ min: 0 }).withMessage("Mileage must be a positive integer."),
  body("inv_color")
    .trim()
    .isLength({ min: 3 }).withMessage("Color is required."),
  body("classification_id")
    .trim()
    .isInt({ min: 1 }).withMessage("Please select a classification."),
  utilities.handleErrors(inventoryController.registerInventory)
);

module.exports = router;
