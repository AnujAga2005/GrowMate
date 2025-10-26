# HabitFlow - Mongoose Models

This directory contains all the Mongoose schemas and models for the HabitFlow habit tracker application.

## 📋 Models Overview

### User Model (`User.ts`)
The central user model with authentication and gamification features.

**Key Features:**
- Email/password authentication with bcrypt hashing
- XP and leveling system
- Streak tracking (current & longest)
- Badge collection
- User preferences (theme, notifications)
- Password comparison method
- XP calculation and level-up logic

**Fields:**
- `name`, `email`, `password` - Basic auth info
- `level`, `xp`, `totalXP` - Gamification stats
- `streak`, `longestStreak` - Habit tracking stats
- `badges` - Array of earned badge references
- `preferences` - User settings object

---

### Habit Model (`Habit.ts`)
Individual habit tracking with completion history and streaks.

**Key Features:**
- Flexible frequency (Daily, Weekly, Custom days)
- Completion tracking with date history
- Streak calculation
- Reminder system
- Category organization
- XP rewards per completion
- Goal tracking (count/duration based)

**Fields:**
- `name`, `emoji`, `category`, `color` - Display info
- `frequency`, `customDays` - Scheduling
- `streak`, `longestStreak` - Progress tracking
- `completedDates` - Array of completion timestamps
- `reminderTime`, `reminderEnabled` - Notifications
- `xpReward` - Points earned per completion

**Methods:**
- `markComplete(date)` - Mark habit as done
- `markIncomplete(date)` - Undo completion
- `calculateCurrentStreak()` - Recalculate streak

---

### Badge Model (`Badge.ts`)
Achievement badges users can earn.

**Key Features:**
- Tiered system (Bronze → Diamond)
- Category-based organization
- Requirement tracking
- XP rewards
- Rarity levels

**Fields:**
- `name`, `description`, `icon`, `color` - Display info
- `tier` - Bronze, Silver, Gold, Platinum, Diamond
- `category` - Streak, Completion, Level, Special, Achievement
- `requirement` - Type and value needed to earn
- `xpReward` - Bonus XP for earning badge
- `rarity` - Common, Rare, Epic, Legendary

---

### UserBadge Model (`UserBadge.ts`)
Junction table linking users to their earned badges.

**Key Features:**
- Prevents duplicate badge earning
- Tracks when badge was earned
- Display preferences
- Progress tracking

**Fields:**
- `user`, `badge` - References
- `earnedAt` - Timestamp
- `progress` - 0-100 completion percentage
- `isDisplayed` - Show/hide on profile

---

### Achievement Model (`Achievement.ts`)
Activity feed of user accomplishments.

**Key Features:**
- Multiple achievement types
- Rich metadata storage
- XP tracking
- Historical record

**Fields:**
- `user` - Reference
- `type` - streak, completion, level_up, badge_earned, milestone
- `title`, `description`, `icon` - Display info
- `xpEarned` - Points earned
- `metadata` - Flexible object for extra data

---

### DailyLog Model (`DailyLog.ts`)
Daily activity summary and analytics.

**Key Features:**
- One log per user per day
- Habit completion tracking
- Mood logging
- XP summary
- Achievement references

**Fields:**
- `user`, `date` - Identifier (unique compound index)
- `habitsCompleted`, `totalHabits` - Daily stats
- `xpEarned` - Daily XP total
- `streakMaintained` - Boolean flag
- `mood` - Optional mood tracking
- `notes` - Daily reflection
- `completedHabits`, `achievements` - References

**Methods:**
- `getOrCreateLog(userId, date)` - Static method to fetch or create log

---

### Notification Model (`Notification.ts`)
User notifications and reminders.

**Key Features:**
- Multiple notification types
- Scheduled delivery
- Read/unread tracking
- Metadata for context
- Bulk operations

**Fields:**
- `user` - Reference
- `type` - reminder, achievement, streak, level_up, badge, system
- `title`, `message`, `icon` - Content
- `isRead`, `readAt` - Read status
- `scheduledFor`, `sentAt` - Timing
- `metadata` - Context data
- `link` - Optional navigation URL

**Methods:**
- `markAsRead()` - Mark single notification as read
- `markManyAsRead(userId, ids)` - Bulk read operation
- `cleanupOldNotifications(days)` - Delete old notifications

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install mongoose bcryptjs
npm install -D @types/mongoose @types/bcryptjs
```

### 2. Database Connection

Create a `config/database.ts` file:

```typescript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitflow', {
      // Options are no longer needed in Mongoose 6+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### 3. Environment Variables

Add to your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/habitflow
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitflow?retryWrites=true&w=majority
```

### 4. Initialize in Your App

In your `server.ts` or `app.ts`:

```typescript
import connectDB from './config/database';
import { User, Habit, Badge } from './models';

// Connect to database
connectDB();

// Use models in your routes
app.post('/api/habits', async (req, res) => {
  try {
    const habit = await Habit.create({
      user: req.user.id,
      ...req.body
    });
    res.json(habit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 📊 Database Indexes

All models have optimized indexes for common queries:

- **User**: email (unique), createdAt
- **Habit**: user + isActive, user + category, user + createdAt
- **Badge**: category + isActive, tier, rarity
- **UserBadge**: user + badge (unique), user + isDisplayed
- **Achievement**: user + createdAt, user + type
- **DailyLog**: user + date (unique)
- **Notification**: user + isRead + createdAt, user + type, scheduledFor

---

## 🔐 Security Notes

- User passwords are automatically hashed using bcrypt (10 salt rounds)
- Passwords are excluded from queries by default (`select: false`)
- Use `comparePassword()` method for login validation
- Never store plain text passwords

---

## 🎯 Common Queries

### Create a new habit
```typescript
const habit = await Habit.create({
  user: userId,
  name: 'Drink Water',
  emoji: '💧',
  category: 'Health',
  frequency: 'Daily'
});
```

### Mark habit complete
```typescript
const result = await habit.markComplete();
// Returns: { xpEarned: 50, streakIncreased: true }
```

### Get user's active habits
```typescript
const habits = await Habit.find({ 
  user: userId, 
  isActive: true 
}).sort({ createdAt: -1 });
```

### Award XP and check for level up
```typescript
const user = await User.findById(userId);
const result = user.addXP(50);
if (result.leveledUp) {
  console.log(`Level up! Now level ${result.newLevel}`);
}
await user.save();
```

### Get user's badges with details
```typescript
const userBadges = await UserBadge.find({ user: userId })
  .populate('badge')
  .sort({ earnedAt: -1 });
```

### Create daily log
```typescript
const log = await DailyLog.getOrCreateLog(userId, new Date());
log.habitsCompleted += 1;
log.xpEarned += 50;
await log.save();
```

---

## 🧪 Seed Data

Create initial badges:

```typescript
const badges = [
  {
    name: 'First Step',
    description: 'Complete your first habit',
    icon: '🎯',
    tier: 'Bronze',
    category: 'Completion',
    requirement: { type: 'completions', value: 1 },
    rarity: 'Common'
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    tier: 'Silver',
    category: 'Streak',
    requirement: { type: 'streak', value: 7 },
    rarity: 'Rare'
  },
  {
    name: 'Century Club',
    description: 'Complete 100 habits',
    icon: '💯',
    tier: 'Gold',
    category: 'Completion',
    requirement: { type: 'completions', value: 100 },
    rarity: 'Epic'
  }
];

await Badge.insertMany(badges);
```

---

## 📝 Migration Scripts

If you need to migrate existing data or update schemas:

```typescript
// Update all habits to have default color
await Habit.updateMany(
  { color: { $exists: false } },
  { $set: { color: '#8B5CF6' } }
);

// Recalculate all user streaks
const users = await User.find();
for (const user of users) {
  const habits = await Habit.find({ user: user._id });
  let maxStreak = 0;
  habits.forEach(habit => {
    if (habit.streak > maxStreak) maxStreak = habit.streak;
  });
  user.streak = maxStreak;
  await user.save();
}
```

---

## 🤝 Contributing

When adding new models:
1. Create the model file in `/models`
2. Add proper TypeScript interfaces
3. Include comprehensive JSDoc comments
4. Add indexes for frequently queried fields
5. Export from `index.ts`
6. Update this README

---

## 📚 Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [TypeScript with Mongoose](https://mongoosejs.com/docs/typescript.html)

---

**Built with ❤️ for HabitFlow**
