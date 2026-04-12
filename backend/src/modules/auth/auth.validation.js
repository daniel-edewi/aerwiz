const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = { registerValidation, loginValidation };
