const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      minlength: [2, 'Habit name must be at least 2 characters long'],
      maxlength: [100, 'Habit name cannot exceed 100 characters']
    },
    emoji: {
      type: String,
      default: '⭐'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Health', 'Fitness', 'Learning', 'Wellness', 'Productivity', 'Social', 'Finance', 'Other'],
      default: 'Other'
    },
    color: {
      type: String,
      default: '#8B5CF6'
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Custom'],
      default: 'Daily'
    },
    customDays: {
      type: [Number],
      validate: {
        validator: function(days) {
          return days.every(day => day >= 0 && day <= 6);
        },
        message: 'Custom days must be between 0 (Sunday) and 6 (Saturday)'
      }
    },
    reminderTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
      default: '09:00'
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    streak: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    completedDates: [{
      type: Date,
      index: true
    }],
    totalCompletions: {
      type: Number,
      default: 0,
      min: 0
    },
    xpReward: {
      type: Number,
      default: 50,
      min: 10,
      max: 500
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    goal: {
      type: {
        type: String,
        enum: ['count', 'duration']
      },
      target: {
        type: Number,
        min: 1
      },
      unit: {
        type: String,
        default: 'times'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
HabitSchema.index({ user: 1, isActive: 1 });
HabitSchema.index({ user: 1, category: 1 });
HabitSchema.index({ user: 1, createdAt: -1 });

// Method to mark habit as complete
HabitSchema.methods.markComplete = async function(date = new Date()) {
  const completionDate = new Date(date);
  completionDate.setHours(0, 0, 0, 0);
  
  // Check if already completed
  const alreadyCompleted = this.completedDates.some(d => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() === completionDate.getTime();
  });
  
  if (alreadyCompleted) {
    return { xpEarned: 0, streakIncreased: false };
  }
  
  this.completedDates.push(completionDate);
  this.totalCompletions += 1;
  
  // Update streak
  const yesterday = new Date(completionDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const completedYesterday = this.completedDates.some(d => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() === yesterday.getTime();
  });
  
  if (completedYesterday || this.streak === 0) {
    this.streak += 1;
    if (this.streak > this.longestStreak) {
      this.longestStreak = this.streak;
    }
  }
  
  await this.save();
  
  return { 
    xpEarned: this.xpReward, 
    streakIncreased: true 
  };
};

// Method to mark habit as incomplete
HabitSchema.methods.markIncomplete = async function(date = new Date()) {
  const completionDate = new Date(date);
  completionDate.setHours(0, 0, 0, 0);
  
  this.completedDates = this.completedDates.filter(d => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() !== completionDate.getTime();
  });
  
  this.totalCompletions = Math.max(0, this.totalCompletions - 1);
  this.streak = this.calculateCurrentStreak();
  
  await this.save();
};

// Method to calculate current streak
HabitSchema.methods.calculateCurrentStreak = function() {
  if (this.completedDates.length === 0) return 0;
  
  const sortedDates = this.completedDates
    .map(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const completedDate of sortedDates) {
    if (completedDate.getTime() === currentDate.getTime()) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('Habit', HabitSchema);
