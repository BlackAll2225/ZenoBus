const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// Create stop validation
const validateCreateStop = [
  body('provinceId')
    .isInt({ min: 1 })
    .withMessage('Province ID must be a positive integer'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name is required and must be between 1 and 255 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters'),
  body('type')
    .isIn(['pickup', 'dropoff'])
    .withMessage('Type must be either "pickup" or "dropoff"'),
  validate
];

// Update stop validation
const validateUpdateStop = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Stop ID must be a positive integer'),
  body('provinceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Province ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must be less than 255 characters'),
  body('type')
    .optional()
    .isIn(['pickup', 'dropoff'])
    .withMessage('Type must be either "pickup" or "dropoff"'),
  validate
];

// Get stop by ID validation
const validateGetStopById = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Stop ID must be a positive integer'),
  validate
];

// Delete stop validation
const validateDeleteStop = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Stop ID must be a positive integer'),
  validate
];

// Get stops by province validation
const validateGetStopsByProvince = [
  param('provinceId')
    .isInt({ min: 1 })
    .withMessage('Province ID must be a positive integer'),
  validate
];

// Get stops by type validation
const validateGetStopsByType = [
  param('type')
    .isIn(['pickup', 'dropoff'])
    .withMessage('Type must be either "pickup" or "dropoff"'),
  validate
];

// Query validation for getAllStops
const validateGetAllStops = [
  query('provinceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Province ID must be a positive integer'),
  query('type')
    .optional()
    .isIn(['pickup', 'dropoff'])
    .withMessage('Type must be either "pickup" or "dropoff"'),
  validate
];

module.exports = {
  validateCreateStop,
  validateUpdateStop,
  validateGetStopById,
  validateDeleteStop,
  validateGetStopsByProvince,
  validateGetStopsByType,
  validateGetAllStops
}; 