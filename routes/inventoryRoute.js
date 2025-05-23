

const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');

router.get("/detail/:inv_id", 
  utilities.handleErrors(invController.buildDetailView)
);

module.exports = router;

router.get("/error/test", (req, res, next) => {
  throw new Error("Intentional error for testing 500");
});
