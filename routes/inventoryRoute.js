const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController.js')

router.get('/', invController.buildManagementView)
router.get('/add-classification', invController.buildAddClassificationView)
router.post(
  '/add-classification',
  invController.validateClassification,
  invController.processAddClassification
)

router.get('/add-inventory', invController.buildAddInventoryView)
router.post(
  '/add-inventory',
  invController.validateInventory,
  invController.processAddInventory
)

module.exports = router
