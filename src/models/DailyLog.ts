import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyLog extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  habitsCompleted: number;
  totalHabits: number;
  xpEarned: number;
  streakMaintained: boolean;
  mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
  notes?: string;
  achievements: mongoose.Types.ObjectId[];
  completedHabits: mongoose.Types.ObjectId[];
}

const DailyLogSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    }],
    completedHabits: [{
      type: Schema.Types.ObjectId,
      ref: 'Habit'
    }]
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one log per user per day
DailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual for completion percentage
DailyLogSchema.virtual('completionPercentage').get(function() {
  if (this.totalHabits === 0) return 0;
  return Math.round((this.habitsCompleted / this.totalHabits) * 100);
});

// Static method to get or create daily log
DailyLogSchema.statics.getOrCreateLog = async function(userId: mongoose.Types.ObjectId, date: Date = new Date()) {
  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);
  
  let log = await this.findOne({ user: userId, date: logDate });
  
  if (!log) {
    // Count user's active habits
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

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
