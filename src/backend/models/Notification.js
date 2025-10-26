const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
      },
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      },
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
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

// Indexes
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

module.exports = mongoose.model('Notification', NotificationSchema);
