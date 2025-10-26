const express = require('express');
const router = express.Router();
const {
  getAllBadges,
  getBadge,
  createBadge,
  updateBadge,
  deleteBadge
} = require('../controllers/badgeController');
const { mongoIdValidation } = require('../middleware/validator');

// Public routes (for now - would be admin-protected in production)
router.route('/')
  .get(getAllBadges)
  .post(createBadge);

router.route('/:id')
  .get(mongoIdValidation, getBadge)
  .put(mongoIdValidation, updateBadge)
  .delete(mongoIdValidation, deleteBadge);

module.exports = router;
