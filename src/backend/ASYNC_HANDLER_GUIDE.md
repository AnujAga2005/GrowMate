# Async Handler (wrapAsync) Guide

## What is asyncHandler?

`asyncHandler` is a utility function that wraps async route handlers to automatically catch errors and pass them to Express error handling middleware. It's the same concept as `wrapAsync`.

## Location

File: `/backend/middleware/errorHandler.js`

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Why Use It?

### Without asyncHandler ❌

```javascript
// Manual try-catch in every route
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.json({ success: true, habits });
  } catch (error) {
    next(error); // Must remember to call next(error)
  }
};
```

### With asyncHandler ✅

```javascript
// Clean code - errors automatically caught
exports.getHabits = asyncHandler(async (req, res, next) => {
  const habits = await Habit.find({ user: req.user.id });
  res.json({ success: true, habits });
  // Errors automatically passed to error handler!
});
```

## How It Works

1. **Wraps your async function** in a Promise
2. **Catches any errors** automatically
3. **Passes errors to `next()`** which triggers error middleware
4. **No manual try-catch needed** in controllers

## Usage Examples

### Basic Usage

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

exports.createHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.create({
    user: req.user.id,
    ...req.body
  });
  
  res.status(201).json({
    success: true,
    habit
  });
});
```

### With Multiple Async Operations

```javascript
exports.completeHabit = asyncHandler(async (req, res, next) => {
  // All these await calls are protected
  const habit = await Habit.findById(req.params.id);
  const result = await habit.markComplete();
  const user = await User.findById(req.user.id);
  
  user.addXP(result.xpEarned);
  await user.save();
  
  res.json({ success: true, habit, xpEarned: result.xpEarned });
});
```

### Throwing Custom Errors

```javascript
const { asyncHandler, AppError } = require('../middleware/errorHandler');

exports.getHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  if (!habit) {
    // Throw AppError - will be caught by asyncHandler
    throw new AppError('Habit not found', 404);
  }
  
  // Check authorization
  if (habit.user.toString() !== req.user.id) {
    throw new AppError('Not authorized', 403);
  }
  
  res.json({ success: true, habit });
});
```

## All Controllers Use asyncHandler

Every controller in the backend uses `asyncHandler`:

### Auth Controller
```javascript
// /backend/controllers/authController.js
const { asyncHandler } = require('../middleware/errorHandler');

exports.register = asyncHandler(async (req, res, next) => { ... });
exports.login = asyncHandler(async (req, res, next) => { ... });
exports.getMe = asyncHandler(async (req, res, next) => { ... });
```

### Habit Controller
```javascript
// /backend/controllers/habitController.js
const { asyncHandler } = require('../middleware/errorHandler');

exports.getHabits = asyncHandler(async (req, res, next) => { ... });
exports.createHabit = asyncHandler(async (req, res, next) => { ... });
exports.completeHabit = asyncHandler(async (req, res, next) => { ... });
```

### User Controller
```javascript
// /backend/controllers/userController.js
const { asyncHandler } = require('../middleware/errorHandler');

exports.getUserStats = asyncHandler(async (req, res, next) => { ... });
exports.getUserBadges = asyncHandler(async (req, res, next) => { ... });
```

And so on for all other controllers...

## Error Handling Flow

```
1. Route handler throws error or Promise rejects
         ↓
2. asyncHandler catches the error
         ↓
3. asyncHandler calls next(error)
         ↓
4. Error middleware (errorHandler) processes error
         ↓
5. Formatted error response sent to client
```

## Global Error Handler

File: `/backend/middleware/errorHandler.js`

```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
  
  // Handle different error types
  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }
  
  if (err.code === 11000) {
    error = new AppError('Duplicate field value', 400);
  }
  
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }
  
  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

## Custom AppError Class

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Using AppError

```javascript
// 404 Not Found
throw new AppError('Habit not found', 404);

// 400 Bad Request
throw new AppError('Invalid input data', 400);

// 401 Unauthorized
throw new AppError('Please log in to access this route', 401);

// 403 Forbidden
throw new AppError('You do not have permission', 403);

// 500 Internal Server Error
throw new AppError('Something went wrong', 500);
```

## Error Response Format

```json
{
  "success": false,
  "error": "Habit not found"
}
```

In development mode, also includes stack trace:
```json
{
  "success": false,
  "error": "Habit not found",
  "stack": "Error: Habit not found\n    at ..."
}
```

## Comparison: wrapAsync vs asyncHandler

They're **the same thing**, just different names:

| Feature | wrapAsync | asyncHandler | HabitFlow Backend |
|---------|-----------|--------------|-------------------|
| Wraps async functions | ✅ | ✅ | ✅ |
| Catches errors | ✅ | ✅ | ✅ |
| Passes to error middleware | ✅ | ✅ | ✅ |
| Used in this project | ❌ | ✅ | ✅ |

## Benefits

✅ **Cleaner Code** - No try-catch blocks everywhere
✅ **Consistent Error Handling** - All errors go through same middleware
✅ **Less Boilerplate** - Write less code
✅ **Easy to Maintain** - Centralized error logic
✅ **Automatic Error Catching** - Never forget to handle errors

## Complete Example

```javascript
// Import dependencies
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Habit = require('../models/Habit');

/**
 * @desc    Get all user habits
 * @route   GET /api/habits
 * @access  Private
 */
exports.getHabits = asyncHandler(async (req, res, next) => {
  // All async operations protected by asyncHandler
  const habits = await Habit.find({ user: req.user.id, isActive: true });
  
  res.json({
    success: true,
    count: habits.length,
    habits
  });
});

/**
 * @desc    Get single habit
 * @route   GET /api/habits/:id
 * @access  Private
 */
exports.getHabit = asyncHandler(async (req, res, next) => {
  const habit = await Habit.findById(req.params.id);
  
  // Custom error - automatically caught
  if (!habit) {
    throw new AppError('Habit not found', 404);
  }
  
  // Authorization check
  if (habit.user.toString() !== req.user.id) {
    throw new AppError('Not authorized to access this habit', 403);
  }
  
  res.json({
    success: true,
    habit
  });
});

/**
 * @desc    Create new habit
 * @route   POST /api/habits
 * @access  Private
 */
exports.createHabit = asyncHandler(async (req, res, next) => {
  // Mongoose validation errors automatically caught
  const habit = await Habit.create({
    user: req.user.id,
    ...req.body
  });
  
  res.status(201).json({
    success: true,
    habit
  });
});
```

## Summary

✨ **asyncHandler is already implemented** in `/backend/middleware/errorHandler.js`

✨ **All controllers use it** - check any file in `/backend/controllers/`

✨ **No manual try-catch needed** - errors are automatically caught and handled

✨ **Same as wrapAsync** - just a different name for the same pattern

---

**The backend is production-ready with comprehensive error handling! 🚀**
