const express = require("express");
const router = new express.Router();
const inventoryController = require("../controllers/inventoryController");
const utilities = require("../utilities/"); // For handleErrors

// Route to build inventory by classification view (existing)
// router.get("/type/:classificationId", utilities.handleErrors(inventoryController.buildByClassificationId));

/* **************************************
 * Route to build single inventory item detail view
 * URL: /inv/detail/:invId
 * invId will be a number representing the inventory item's ID
 ***************************************/
router.get("/detail/:invId", utilities.handleErrors(inventoryController.buildByInvId));


module.exports = router;
