// routes/accountRoutes.js or wherever this is defined
const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Example route for /account
router.get("/", (req, res) => {
  res.render("account/home", {
    title: "Account Home",
    currentPage: "account-home"  // ✅ this fixes the error
  });
});

module.exports = router;

