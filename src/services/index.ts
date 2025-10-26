/**
 * Services Index
 * Central export for all API services
 */

export { authService } from './authService';
export { habitService } from './habitService';
export { userService } from './userService';
export { analyticsService } from './analyticsService';
export { badgeService } from './badgeService';
export { achievementService } from './achievementService';
export { notificationService } from './notificationService';

export { default as api, setAuthToken, removeAuthToken } from './api';

// Re-export types
export type { User, AuthResponse, RegisterData, LoginData, UpdateProfileData } from './authService';
export type { Habit, CreateHabitData, UpdateHabitData, CompleteHabitResponse, HabitStats } from './habitService';
export type { UserStats, UserBadge, LeaderboardEntry } from './userService';
export type { 
  DailyData, 
  AnalyticsDashboard, 
  HabitTrend, 
  StreakCalendar, 
  CategoryPerformance, 
  XPHistoryEntry 
} from './analyticsService';
export type { Badge } from './badgeService';
export type { Achievement, AchievementStats } from './achievementService';
export type { Notification } from './notificationService';
