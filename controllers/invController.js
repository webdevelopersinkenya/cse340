const util = require('../utilities/index')
const { body, validationResult } = require('express-validator');
const invModel = require('../models/inventory-model') // ensure imported

// View for adding inventory
async function buildAddInventoryView(req, res, next) {
  try {
    const classificationList = await util.buildClassificationList()
    const message = req.flash('message')
    const errors = req.flash('errors')

    res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      classificationList,
      message,
      errors,
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: '',
      inv_image: '/images/no-image.png',
      inv_thumbnail: '/images/no-image-thumb.png',
      currentPage: 'add-inventory'
    })
  } catch (error) {
    next(error)
  }
}

// Validation middleware
const validateInventory = [
  body('inv_make').trim().notEmpty().withMessage('Make is required'),
  body('inv_model').trim().notEmpty().withMessage('Model is required'),
  body('inv_year').isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid number'),
  body('inv_description').trim().notEmpty().withMessage('Description is required'),
  body('inv_price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('inv_miles').isInt({ min: 0 }).withMessage('Miles must be a positive integer'),
  body('inv_color').trim().notEmpty().withMessage('Color is required'),
  body('classification_id').notEmpty().withMessage('Classification is required'),
  body('inv_image').trim().optional(),
  body('inv_thumbnail').trim().optional(),
]

// Process inventory form submission
async function processAddInventory(req, res, next) {
  const errors = validationResult(req)
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_image,
    inv_thumbnail,
  } = req.body

  if (!errors.isEmpty()) {
    const classificationList = await util.buildClassificationList(classification_id)
    return res.render('inventory/add-inventory', {
      title: 'Add New Inventory Item',
      errors: errors.array(),
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
      message: null,
      currentPage: 'add-inventory'
    })
  }

  try {
    const insertResult = await invModel.addInventoryItem({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image,
      inv_thumbnail,
    })

    if (insertResult.rowCount > 0) {
      req.flash('message', 'Inventory item added successfully.')
      return res.redirect('/inv')
    } else {
      const classificationList = await util.buildClassificationList(classification_id)
      return res.render('inventory/add-inventory', {
        title: 'Add New Inventory Item',
        errors: null,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        inv_image,
        inv_thumbnail,
        message: 'Failed to add inventory item.',
        currentPage: 'add-inventory'
      })
    }
  } catch (error) {
    next(error)
  }
}

// Management View
async function buildManagementView(req, res, next) {
  try {
    const classificationList = await util.buildClassificationList()
    res.render('inventory/management', {
      title: 'Vehicle Management',
      classificationList,
      currentPage: 'management'
    })
  } catch (error) {
    next(error)
  }
}

// Add Classification View
function buildAddClassificationView(req, res) {
  res.render('inventory/add-classification', {
    title: 'Add New Classification',
    errors: null,
    classification_name: '',
    currentPage: 'add-classification'
  })
}

// Validate Classification
const validateClassification = [
  body('classification_name')
    .trim()
    .notEmpty()
    .withMessage('Classification name is required.')
    .isLength({ min: 3 })
    .withMessage('Classification name must be at least 3 characters long.')
]

// Process Add Classification
async function processAddClassification(req, res, next) {
  const errors = validationResult(req)
  const { classification_name } = req.body

  if (!errors.isEmpty()) {
    return res.render('inventory/add-classification', {
      title: 'Add New Classification',
      errors: errors.array(),
      classification_name,
      currentPage: 'add-classification'
    })
  }

  try {
    const result = await invModel.addClassification(classification_name)
    if (result) {
      req.flash('message', 'Classification added successfully.')
      return res.redirect('/inv')
    } else {
      return res.render('inventory/add-classification', {
        title: 'Add New Classification',
        errors: null,
        message: 'Failed to add classification.',
        classification_name,
        currentPage: 'add-classification'
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  buildManagementView,
  buildAddClassificationView,
  validateClassification,
  processAddClassification,
  buildAddInventoryView,
  validateInventory,
  processAddInventory
}
