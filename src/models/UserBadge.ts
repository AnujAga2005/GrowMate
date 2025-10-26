import mongoose, { Schema, Document } from 'mongoose';

export interface IUserBadge extends Document {
  user: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  earnedAt: Date;
  progress?: number;
  isDisplayed: boolean;
}

const UserBadgeSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    badge: {
      type: Schema.Types.ObjectId,
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

// Compound index to ensure a user can only earn a badge once
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

// Index for querying displayed badges
UserBadgeSchema.index({ user: 1, isDisplayed: 1 });

export default mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
