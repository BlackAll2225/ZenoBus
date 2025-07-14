const { body, param, validationResult } = require('express-validator');

const validateRoute = [
  body('departureProvinceId')
    .isInt({ min: 1 })
    .withMessage('Departure province ID must be a positive integer'),
  
  body('arrivalProvinceId')
    .isInt({ min: 1 })
    .withMessage('Arrival province ID must be a positive integer')
    .custom((value, { req }) => {
      if (value === req.body.departureProvinceId) {
        throw new Error('Departure and arrival provinces cannot be the same');
      }
      return true;
    }),
  
  body('distanceKm')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Distance must be a positive integer'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated time must be a positive integer (in minutes)'),
];

const validateRouteUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Route ID must be a positive integer'),
  
  body('departureProvinceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Departure province ID must be a positive integer'),
  
  body('arrivalProvinceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Arrival province ID must be a positive integer')
    .custom((value, { req }) => {
      if (value && req.body.departureProvinceId && value === req.body.departureProvinceId) {
        throw new Error('Departure and arrival provinces cannot be the same');
      }
      return true;
    }),
  
  body('distanceKm')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Distance must be a positive integer'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated time must be a positive integer (in minutes)'),
];

const validateRouteId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Route ID must be a positive integer'),
];

const validateProvinceId = [
  param('provinceId')
    .isInt({ min: 1 })
    .withMessage('Province ID must be a positive integer'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.error(errors.array()[0].msg, 400);
  }
  next();
};

module.exports = {
  validateRoute,
  validateRouteUpdate,
  validateRouteId,
  validateProvinceId,
  handleValidationErrors
}; 