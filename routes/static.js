// routes/static.js
const express = require('express');
const router = express.Router();
const baseController = require('../controllers/baseController');

// Route to serve homepage
router.get("/", baseController.buildHome);

module.exports = router;



