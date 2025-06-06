const accountModel = require("../models/account-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require('express-validator');

/* ****************************************
 * Deliver login view
 * ************************************ */
async function buildLogin(req, res) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  });
}

/* ****************************************
 * Deliver registration view
 * ************************************ */
async function buildRegister(req, res) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  });
}

/* ****************************************
 * Process Registration
 * ************************************ */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Account Login Error:", error);
    throw new Error('Access Forbidden');
  }
}

/* ****************************************
 * Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

/* ****************************************
 * Deliver Account Update View (Task 5)
 * Purpose: Pre-populates form with current account data.
 * ************************************ */
async function buildAccountUpdate(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData; // Data from JWT
  res.render("account/account-update", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id, // Pass account_id for update query
  });
}

/* ****************************************
 * Process Account Profile Update (Task 5)
 * Purpose: Handles submission of updated account profile.
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_id // Hidden input from form
  } = req.body;

  const errors = validationResult(req); // Collect server-side validation errors
  if (!errors.isEmpty()) {
    req.flash("notice", "Please fix the errors below.");
    return res.status(400).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }

  try {
    const updateResult = await accountModel.updateAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_id
    );

    if (updateResult) {
      req.flash("notice", "Account information successfully updated.");
      
      // Re-issue JWT with updated data (important if accountData is used elsewhere)
      // Fetch the latest data from DB to ensure it's fresh (including account_type)
      const updatedAccountData = await accountModel.getAccountById(account_id);
      delete updatedAccountData.account_password; // Remove password before signing JWT
      
      const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }

      res.redirect("/account/"); // Redirect to account management
    } else {
      req.flash("notice", "Sorry, the account update failed. Please try again.");
      res.status(500).render("account/account-update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      });
    }
  } catch (error) {
    req.flash("notice", "An unexpected error occurred: " + error.message);
    res.status(500).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
}

/* ****************************************
 * Process Password Update (Task 5)
 * Purpose: Handles submission of new password.
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  const errors = validationResult(req); // Collect server-side validation errors
  if (!errors.isEmpty()) {
    req.flash("notice", "Please fix the errors below.");
    // When re-rendering, you need to provide all original account data for stickiness
    const accountData = res.locals.accountData; // Get current data from res.locals (from JWT)
    return res.status(400).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: errors.array(),
      account_firstname: accountData.account_firstname, // Pass original data back
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (hashError) {
    req.flash("notice", "Error processing password change.");
    console.error("Password hash error:", hashError);
    const accountData = res.locals.accountData; // Re-fetch current data for sticky form
    return res.status(500).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  }

  try {
    const updateResult = await accountModel.updatePassword(
      hashedPassword,
      account_id
    );

    if (updateResult) {
      req.flash("notice", "Password successfully updated.");
      res.redirect("/account/"); // Redirect to account management on success
    } else {
      req.flash("notice", "Sorry, the password update failed. Please try again.");
      const accountData = res.locals.accountData; // Re-fetch current data for sticky form
      res.status(500).render("account/account-update", {
        title: "Edit Account",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_id: accountData.account_id,
      });
    }
  } catch (error) {
    req.flash("notice", "An unexpected error occurred: " + error.message);
    const accountData = res.locals.accountData; // Re-fetch current data for sticky form
    res.status(500).render("account/account-update", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
    });
  }
}

/* ****************************************
 * Process Logout (Task 6)
 * Purpose: Clears the JWT cookie and redirects to home.
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt"); // Delete the JWT cookie
  req.flash("notice", "You have been logged out."); // Optional: Flash message
  res.redirect("/"); // Redirect to the home page
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  accountLogout, // EXPORT NEW FUNCTION
};
