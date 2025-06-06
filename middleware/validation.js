const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model"); // Assuming you have an account model for DB checks

const validate = {}; // Create a validation object

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // email is required and must be a valid email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // sanitize email
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        // Check if email exists in database
        const account = await accountModel.getAccountByEmail(account_email);
        if (!account) {
          throw new Error("Email address not found.");
        }
      }),

    // password is required and must meet requirements
    body("account_password")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters.")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{10,}$/
      )
      .withMessage(
        "Password must contain at least 1 uppercase, 1 number, and 1 special character."
      ),
  ];
};

/* ***********************************
 * Check Login Data
 * Purpose: Checks data from login form and returns errors or passes to controller.
 * ********************************* */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req); // Collects validation errors

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav(); // Assuming utilities are available globally or imported
    req.flash("notice", "Please fix the errors below.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(), // Pass errors to the view
      account_email, // Keep email sticky
    });
    return; // Stop execution if errors
  }
  next(); // No errors, proceed to next middleware/controller
};

// Assuming you also have these from previous assignments for registration
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email already exists. Please login or use a different email.");
        }
      }),
    body("account_password")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters.")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{10,}$/)
      .withMessage("Password must contain at least 1 uppercase, 1 number, and 1 special character."),
  ];
};

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};


module.exports = validate;
