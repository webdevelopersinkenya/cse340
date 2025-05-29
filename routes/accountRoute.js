const express = require("express");
const router = express.Router();

// Example route for /account
router.get("/", (req, res) => {
  res.render("account/home", { title: "Account Home" });
});


module.exports = router;
