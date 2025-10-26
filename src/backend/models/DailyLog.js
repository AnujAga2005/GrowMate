const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true
    },
    habitsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    totalHabits: {
      type: Number,
      default: 0,
      min: 0
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    streakMaintained: {
      type: Boolean,
      default: false
    },
    mood: {
      type: String,
      enum: ['excellent', 'good', 'neutral', 'bad', 'terrible']
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }],
    completedHabits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit'
    }]
  },
  {
    timestamps: true
  }
);

// Compound index
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Static method to get or create daily log
DailyLogSchema.statics.getOrCreateLog = async function(userId, date = new Date()) {
  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);
  
  let log = await this.findOne({ user: userId, date: logDate });
  
  if (!log) {
    const Habit = mongoose.model('Habit');
    const totalHabits = await Habit.countDocuments({ user: userId, isActive: true });
    
    log = await this.create({
      user: userId,
      date: logDate,
      totalHabits,
      habitsCompleted: 0,
      xpEarned: 0,
      streakMaintained: false,
      completedHabits: []
    });
  }
  
  return log;
};

module.exports = mongoose.model('DailyLog', DailyLogSchema);
