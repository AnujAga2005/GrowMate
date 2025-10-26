const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

/**
 * Validation rules for creating a habit
 */
const createHabitValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Habit name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Habit name must be between 2 and 100 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Health', 'Fitness', 'Learning', 'Wellness', 'Productivity', 'Social', 'Finance', 'Other'])
    .withMessage('Invalid category'),
  
  body('frequency')
    .optional()
    .isIn(['Daily', 'Weekly', 'Custom']).withMessage('Invalid frequency'),
  
  body('emoji')
    .optional()
    .isString(),
  
  body('reminderTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format. Use HH:MM'),
  
  validate
];

/**
 * Validation rules for updating a habit
 */
const updateHabitValidation = [
  param('id')
    .isMongoId().withMessage('Invalid habit ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Habit name must be between 2 and 100 characters'),
  
  body('category')
    .optional()
    .isIn(['Health', 'Fitness', 'Learning', 'Wellness', 'Productivity', 'Social', 'Finance', 'Other'])
    .withMessage('Invalid category'),
  
  body('frequency')
    .optional()
    .isIn(['Daily', 'Weekly', 'Custom']).withMessage('Invalid frequency'),
  
  validate
];

/**
 * Validation rules for MongoDB ObjectId
 */
const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  
  validate
];

/**
 * Validation rules for date queries
 */
const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createHabitValidation,
  updateHabitValidation,
  mongoIdValidation,
  dateRangeValidation
};
