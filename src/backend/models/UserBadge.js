const mongoose = require('mongoose');

const UserBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: [true, 'Badge is required'],
      index: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    isDisplayed: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });
UserBadgeSchema.index({ user: 1, isDisplayed: 1 });

module.exports = mongoose.model('UserBadge', UserBadgeSchema);
