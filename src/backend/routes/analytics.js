const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getTrends,
  getStreakCalendar,
  getCategoryPerformance,
  getXPHistory
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/trends', getTrends);
router.get('/streak-calendar', getStreakCalendar);
router.get('/category-performance', getCategoryPerformance);
router.get('/xp-history', getXPHistory);

module.exports = router;
