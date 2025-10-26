const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['streak', 'completion', 'level_up', 'badge_earned', 'milestone'],
      required: [true, 'Achievement type is required']
    },
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    icon: {
      type: String,
      default: '🎉'
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    metadata: {
      habitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
      },
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      },
      streakCount: Number,
      completionCount: Number,
      level: Number
    }
  },
  {
    timestamps: true
  }
);

// Indexes
AchievementSchema.index({ user: 1, createdAt: -1 });
AchievementSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Achievement', AchievementSchema);
