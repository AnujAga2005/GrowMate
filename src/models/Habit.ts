import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  category: string;
  color?: string;
  frequency: 'Daily' | 'Weekly' | 'Custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday
  reminderTime?: string;
  reminderEnabled: boolean;
  streak: number;
  longestStreak: number;
  completedDates: Date[];
  totalCompletions: number;
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  goal?: {
    type: 'count' | 'duration';
    target: number;
    unit?: string;
  };
}

const HabitSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      default: '#8B5CF6' // Purple default
    },
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Custom'],
      default: 'Daily'
    },
    customDays: {
      type: [Number],
      validate: {
        validator: function(days: number[]) {
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

// Compound indexes for better query performance
HabitSchema.index({ user: 1, isActive: 1 });
HabitSchema.index({ user: 1, category: 1 });
HabitSchema.index({ user: 1, createdAt: -1 });

// Virtual for checking if habit is completed today
HabitSchema.virtual('completedToday').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.completedDates.some((date: Date) => {
    const completedDate = new Date(date);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });
});

// Virtual for completion percentage (last 30 days)
HabitSchema.virtual('completionRate').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletions = this.completedDates.filter((date: Date) => 
    new Date(date) >= thirtyDaysAgo
  ).length;
  
  return Math.round((recentCompletions / 30) * 100);
});

// Method to mark habit as complete for a specific date
HabitSchema.methods.markComplete = async function(date: Date = new Date()): Promise<{ xpEarned: number; streakIncreased: boolean }> {
  const completionDate = new Date(date);
  completionDate.setHours(0, 0, 0, 0);
  
  // Check if already completed on this date
  const alreadyCompleted = this.completedDates.some((d: Date) => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() === completionDate.getTime();
  });
  
  if (alreadyCompleted) {
    return { xpEarned: 0, streakIncreased: false };
  }
  
  // Add completion
  this.completedDates.push(completionDate);
  this.totalCompletions += 1;
  
  // Update streak
  const yesterday = new Date(completionDate);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const completedYesterday = this.completedDates.some((d: Date) => {
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

// Method to mark habit as incomplete for a specific date
HabitSchema.methods.markIncomplete = async function(date: Date = new Date()): Promise<void> {
  const completionDate = new Date(date);
  completionDate.setHours(0, 0, 0, 0);
  
  this.completedDates = this.completedDates.filter((d: Date) => {
    const existingDate = new Date(d);
    existingDate.setHours(0, 0, 0, 0);
    return existingDate.getTime() !== completionDate.getTime();
  });
  
  this.totalCompletions = Math.max(0, this.totalCompletions - 1);
  
  // Recalculate streak
  this.streak = this.calculateCurrentStreak();
  
  await this.save();
};

// Method to calculate current streak
HabitSchema.methods.calculateCurrentStreak = function(): number {
  if (this.completedDates.length === 0) return 0;
  
  const sortedDates = this.completedDates
    .map((d: Date) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    })
    .sort((a: Date, b: Date) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const completedDate of sortedDates) {
    if (completedDate.getTime() === currentDate.getTime()) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (completedDate.getTime() < currentDate.getTime()) {
      // Check if it's a weekly or custom frequency habit
      if (this.frequency === 'Daily') {
        break;
      }
    }
  }
  
  return streak;
};

// Pre-save middleware to update longest streak
HabitSchema.pre('save', function(next) {
  if (this.streak > this.longestStreak) {
    this.longestStreak = this.streak;
  }
  next();
});

export default mongoose.model<IHabit>('Habit', HabitSchema);
