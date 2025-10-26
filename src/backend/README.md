# HabitFlow Backend API

Complete Node.js/Express backend with MongoDB, Passport authentication, and comprehensive habit tracking features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Edit `.env` file with your configuration:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habitflow
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

5. **Start MongoDB** (if running locally):
```bash
# macOS/Linux with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Or use MongoDB Atlas (cloud) - just update MONGODB_URI in .env
```

6. **Seed the database with badges:**
```bash
npm run seed
```

7. **Start the development server:**
```bash
npm run dev
```

The API will be running at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   └── passport.js          # Passport JWT & Local strategies
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── habitController.js   # Habit CRUD operations
│   ├── userController.js    # User stats & badges
│   ├── badgeController.js   # Badge management
│   ├── achievementController.js
│   ├── notificationController.js
│   └── analyticsController.js
├── middleware/
│   ├── auth.js              # JWT protection & token generation
│   ├── errorHandler.js      # Global error handling & asyncHandler
│   └── validator.js         # Request validation rules
├── models/
│   ├── User.js              # User schema with XP/leveling
│   ├── Habit.js             # Habit schema with streaks
│   ├── Badge.js             # Badge definitions
│   ├── UserBadge.js         # User-earned badges
│   ├── Achievement.js       # User achievements
│   ├── DailyLog.js          # Daily activity logs
│   └── Notification.js      # User notifications
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── habits.js            # Habit endpoints
│   ├── users.js             # User endpoints
│   ├── badges.js            # Badge endpoints
│   ├── achievements.js
│   ├── notifications.js
│   └── analytics.js
├── utils/
│   ├── constants.js         # App constants
│   └── seedBadges.js        # Database seeding script
├── .env.example             # Environment variables template
├── package.json
└── server.js                # Entry point
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication with Passport.js.

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "level": 1,
    "xp": 0,
    "streak": 0
  }
}
```

### Protected Requests

Include the JWT token in the `Authorization` header:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| DELETE | `/account` | Delete account | Yes |

### Habits (`/api/habits`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user habits | Yes |
| POST | `/` | Create new habit | Yes |
| GET | `/:id` | Get single habit | Yes |
| PUT | `/:id` | Update habit | Yes |
| DELETE | `/:id` | Delete habit | Yes |
| POST | `/:id/complete` | Mark habit complete | Yes |
| POST | `/:id/uncomplete` | Mark habit incomplete | Yes |
| GET | `/:id/stats` | Get habit statistics | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get user dashboard stats | Yes |
| GET | `/badges` | Get user badges | Yes |
| POST | `/check-badges` | Check & award eligible badges | Yes |
| GET | `/leaderboard` | Get leaderboard | Yes |
| PUT | `/badges/:badgeId/toggle-display` | Toggle badge display | Yes |

### Badges (`/api/badges`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all badges | No |
| POST | `/` | Create badge | No* |
| GET | `/:id` | Get single badge | No |
| PUT | `/:id` | Update badge | No* |
| DELETE | `/:id` | Delete badge | No* |

*In production, these should be admin-only

### Achievements (`/api/achievements`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user achievements | Yes |
| GET | `/stats` | Get achievement stats | Yes |
| GET | `/:id` | Get single achievement | Yes |
| DELETE | `/:id` | Delete achievement | Yes |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get notifications | Yes |
| POST | `/` | Create notification | Yes |
| GET | `/unread/count` | Get unread count | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| DELETE | `/clear-read` | Clear read notifications | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |

### Analytics (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get analytics dashboard | Yes |
| GET | `/trends` | Get habit trends | Yes |
| GET | `/streak-calendar` | Get streak calendar | Yes |
| GET | `/category-performance` | Get category performance | Yes |
| GET | `/xp-history` | Get XP history | Yes |

## 💡 Example Requests

### Create a Habit
```bash
POST /api/habits
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Morning Meditation",
  "emoji": "🧘",
  "category": "Wellness",
  "frequency": "Daily",
  "reminderTime": "07:00",
  "xpReward": 50
}
```

### Complete a Habit
```bash
POST /api/habits/:habitId/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "date": "2025-10-22T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "habit": { ... },
  "xpEarned": 50,
  "leveledUp": false,
  "userXP": 150,
  "userLevel": 1
}
```

### Get Analytics Dashboard
```bash
GET /api/analytics/dashboard?days=30
Authorization: Bearer YOUR_TOKEN
```

## 🎮 Gamification System

### XP & Leveling
- Complete habits to earn XP
- XP required for next level = `current_level * 500`
- Automatic level-up when XP threshold reached

### Badges
- Automatically awarded based on achievements
- Categories: Streak, Completion, Level, Achievement, Special
- Tiers: Bronze, Silver, Gold, Platinum, Diamond
- Run `/check-badges` endpoint to check eligibility

### Streaks
- Maintained by completing habits daily
- Streak breaks if habit not completed for 1+ days
- Bonus XP for streak milestones (7, 14, 30, 60, 100 days)

## 🛠️ Middleware & Error Handling

### asyncHandler
All async route handlers are wrapped with `asyncHandler` to catch errors:

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

exports.getHabits = asyncHandler(async (req, res, next) => {
  // Your async code here
  // Errors are automatically caught and passed to error handler
});
```

### Global Error Handler
Automatically handles:
- Mongoose validation errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- JWT errors
- Custom AppError instances

### Request Validation
Using `express-validator` for input validation:
- Email format validation
- Password strength requirements
- Field length limits
- Custom validation rules

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Expiration**: Configurable (default 7 days)
- **Input Validation**: All inputs validated
- **NoSQL Injection Protection**: Mongoose schema validation

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get habits (replace TOKEN)
curl http://localhost:5000/api/habits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import collection or create new requests
2. Set base URL: `http://localhost:5000/api`
3. For protected routes: Add header `Authorization: Bearer YOUR_TOKEN`
4. Test all endpoints

## 📊 Database Seeding

### Seed Badges

```bash
npm run seed
```

This creates 18 default badges across all categories and tiers.

### Custom Seeding

Create your own seed scripts in `/utils/` directory:

```javascript
const mongoose = require('mongoose');
const Model = require('../models/Model');

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  await Model.deleteMany({});
  await Model.insertMany([/* your data */]);
  process.exit(0);
};

seedData();
```

## 🚨 Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# macOS
brew services start mongodb-community

# Check status
brew services list
```

### JWT Secret Warning
```
Error: JWT_SECRET is not defined
```
**Solution:** Create `.env` file and set `JWT_SECRET`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change `PORT` in `.env` or kill process on port 5000
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### CORS Error from Frontend
```
Access to fetch blocked by CORS policy
```
**Solution:** Update `FRONTEND_URL` in `.env` to match your frontend URL

## 📈 Production Deployment

### Environment Variables
Set these in your production environment:
- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `FRONTEND_URL` - Your production frontend URL

### Recommended Services
- **Hosting**: Railway, Render, Heroku, DigitalOcean
- **Database**: MongoDB Atlas (free tier available)
- **Monitoring**: New Relic, Datadog, LogRocket

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable HTTPS
- [ ] Set appropriate CORS origins
- [ ] Configure rate limiting
- [ ] Set up logging (Morgan, Winston)
- [ ] Add monitoring/error tracking
- [ ] Set up backups
- [ ] Add admin authentication for badge/badge routes
- [ ] Review and tighten security settings

## 🤝 Contributing

When adding new features:

1. Create model in `/models/`
2. Create controller in `/controllers/`
3. Create routes in `/routes/`
4. Add validation in `/middleware/validator.js`
5. Update this README
6. Test all endpoints

## 📝 License

MIT

---

**Built with ❤️ for HabitFlow**

For frontend integration, see the `/services` directory in the React app.
