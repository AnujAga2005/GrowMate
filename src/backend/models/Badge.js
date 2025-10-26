const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Badge name cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    icon: {
      type: String,
      required: [true, 'Badge icon is required'],
      default: '🏆'
    },
    color: {
      type: String,
      default: '#FFD700'
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    },
    category: {
      type: String,
      enum: ['Streak', 'Completion', 'Level', 'Special', 'Achievement'],
      required: [true, 'Category is required']
    },
    requirement: {
      type: {
        type: String,
        enum: ['streak', 'completions', 'level', 'habits', 'custom'],
        required: true
      },
      value: {
        type: Number,
        required: true,
        min: 1
      },
      description: {
        type: String,
        maxlength: [100, 'Requirement description cannot exceed 100 characters']
      }
    },
    xpReward: {
      type: Number,
      default: 100,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
BadgeSchema.index({ category: 1, isActive: 1 });
BadgeSchema.index({ tier: 1 });
BadgeSchema.index({ rarity: 1 });

module.exports = mongoose.model('Badge', BadgeSchema);
