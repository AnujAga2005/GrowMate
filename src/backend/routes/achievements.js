const express = require('express');
const router = express.Router();
const {
  getAchievements,
  getAchievement,
  deleteAchievement,
  getAchievementStats
} = require('../controllers/achievementController');
const { protect } = require('../middleware/auth');
const { mongoIdValidation } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getAchievements);
router.get('/stats', getAchievementStats);
router.route('/:id')
  .get(mongoIdValidation, getAchievement)
  .delete(mongoIdValidation, deleteAchievement);

module.exports = router;
