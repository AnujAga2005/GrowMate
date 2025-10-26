import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'reminder' | 'achievement' | 'streak' | 'level_up' | 'badge' | 'system';
  title: string;
  message: string;
  icon?: string;
  isRead: boolean;
  link?: string;
  metadata?: {
    habitId?: mongoose.Types.ObjectId;
    badgeId?: mongoose.Types.ObjectId;
    achievementId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['reminder', 'achievement', 'streak', 'level_up', 'badge', 'system'],
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    icon: {
      type: String,
      default: '🔔'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String
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
      achievementId: {
        type: Schema.Types.ObjectId,
        ref: 'Achievement'
      }
    },
    scheduledFor: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, type: 1 });
NotificationSchema.index({ scheduledFor: 1 });

// Method to mark as read
NotificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Static method to mark multiple notifications as read
NotificationSchema.statics.markManyAsRead = async function(userId: mongoose.Types.ObjectId, notificationIds: mongoose.Types.ObjectId[]) {
  return this.updateMany(
    { _id: { $in: notificationIds }, user: userId },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to delete old read notifications
NotificationSchema.statics.cleanupOldNotifications = async function(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate }
  });
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
