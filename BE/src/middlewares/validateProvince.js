const { body, validationResult } = require('express-validator');

const validateProvince = [
  body('name')
    .notEmpty().withMessage('Province name is required')
    .isLength({ max: 100 }).withMessage('Name too long'),

  body('code')
    .notEmpty().withMessage('Province code is required')
    .isLength({ max: 20 }).withMessage('Code too long')
    .matches(/^[A-Z0-9]+$/).withMessage('Code must be uppercase letters/numbers'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateProvince;
