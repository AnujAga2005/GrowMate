const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
  uncompleteHabit,
  getHabitStats
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');
const {
  createHabitValidation,
  updateHabitValidation,
  mongoIdValidation
} = require('../middleware/validator');

// All routes are protected
router.use(protect);

// Habit CRUD
router.route('/')
  .get(getHabits)
  .post(createHabitValidation, createHabit);

router.route('/:id')
  .get(mongoIdValidation, getHabit)
  .put(updateHabitValidation, updateHabit)
  .delete(mongoIdValidation, deleteHabit);

// Habit completion
router.post('/:id/complete', mongoIdValidation, completeHabit);
router.post('/:id/uncomplete', mongoIdValidation, uncompleteHabit);

// Habit statistics
router.get('/:id/stats', mongoIdValidation, getHabitStats);

module.exports = router;
