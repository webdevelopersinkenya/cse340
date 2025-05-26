const express = require("express");
const router = express.Router();

// Example route for /account
router.get("/", (req, res) => {
  res.send("Account Home Page");
});

module.exports = router;
