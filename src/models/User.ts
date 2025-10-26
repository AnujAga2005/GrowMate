import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXP: number;
  streak: number;
  longestStreak: number;
  badges: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    reminderTime?: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't return password by default in queries
    },
    avatar: {
      type: String,
      default: null
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0
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
    badges: [{
      type: Schema.Types.ObjectId,
      ref: 'Badge'
    }],
    lastLoginAt: {
      type: Date,
      default: null
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      reminderTime: {
        type: String,
        default: '09:00'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for habits count
UserSchema.virtual('habits', {
  ref: 'Habit',
  localField: '_id',
  foreignField: 'user'
});

// Method to calculate XP needed for next level
UserSchema.methods.getXPForNextLevel = function(): number {
  return this.level * 500; // Each level requires level * 500 XP
};

// Method to add XP and handle level ups
UserSchema.methods.addXP = function(amount: number): { leveledUp: boolean; newLevel?: number } {
  this.xp += amount;
  this.totalXP += amount;
  
  const xpNeeded = this.getXPForNextLevel();
  
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
    return { leveledUp: true, newLevel: this.level };
  }
  
  return { leveledUp: false };
};

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);
