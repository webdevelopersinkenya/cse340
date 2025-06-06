const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../middleware/validation"); // Assuming you have this validation middleware

/* **************************************
 * GET login view
 * URL: /account/login
 ***************************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* **************************************
 * GET registration view
 * URL: /account/register
 ***************************************/
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* **************************************
 * Process Registration
 * URL: /account/register
 * Includes validation middleware
 ***************************************/
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

/* **************************************
 * Process Login Request
 * URL: /account/login
 * Includes validation middleware and points to accountLogin controller
 ***************************************/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* **************************************
 * GET Account Management View (UPDATED)
 * URL: /account/
 * Purpose: Displays client's account dashboard after login
 * Applies checkLogin middleware to protect this route.
 ***************************************/
router.get(
  "/",
  utilities.checkLogin, // ADD THIS LINE: Apply checkLogin middleware
  utilities.handleErrors(accountController.buildAccountManagement)
);


module.exports = router;
