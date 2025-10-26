import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  user: mongoose.Types.ObjectId;
  type: 'streak' | 'completion' | 'level_up' | 'badge_earned' | 'milestone';
  title: string;
  description: string;
  icon: string;
  xpEarned: number;
  metadata?: {
    habitId?: mongoose.Types.ObjectId;
    badgeId?: mongoose.Types.ObjectId;
    streakCount?: number;
    completionCount?: number;
    level?: number;
    [key: string]: any;
  };
  createdAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        ref: 'Habit'
      },
      badgeId: {
        type: Schema.Types.ObjectId,
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

// Indexes for better query performance
AchievementSchema.index({ user: 1, createdAt: -1 });
AchievementSchema.index({ user: 1, type: 1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);
