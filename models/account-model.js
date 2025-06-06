const pool = require("../database"); // Adjust path if your database/index.js is elsewhere

/* *****************************
 * Add new account to database
 * ***************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client')";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    // Log the error for debugging.
    console.error("registerAccount error:", error);
    // Re-throw or return an error message that can be handled by the controller
    if (error.code === '23505') { // PostgreSQL unique violation error code (e.g., duplicate email)
        throw new Error("Email already exists. Please login or use a different email.");
    }
    throw new Error("Failed to register account.");
  }
}

/* *****************************
 * Check for existing email (for registration validation)
 * ***************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT COUNT(*) FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rows[0].count > 0;
  } catch (error) {
    console.error("checkExistingEmail error:", error);
    throw new Error("Failed to check existing email.");
  }
}


/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0]; // Returns the account data or undefined if not found
  } catch (error) {
    console.error("getAccountByEmail error: " + error);
    // It's generally better to throw an error here to be caught by handleErrors,
    // or let the controller handle a 'null' return for "not found".
    // For this specific case, returning null is fine as controller checks !accountData
    return null;
  }
}


module.exports = {
  registerAccount,
  checkExistingEmail, // Export this for validation middleware
  getAccountByEmail,
};
