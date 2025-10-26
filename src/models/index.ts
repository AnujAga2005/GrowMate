/**
 * Mongoose Models Index
 * 
 * Central export file for all database models.
 * Import models from here to ensure consistency across the application.
 * 
 * Example usage:
 * import { User, Habit, Badge } from './models';
 */

export { default as User } from './User';
export { default as Habit } from './Habit';
export { default as Badge } from './Badge';
export { default as UserBadge } from './UserBadge';
export { default as Achievement } from './Achievement';
export { default as DailyLog } from './DailyLog';
export { default as Notification } from './Notification';

// Export types
export type { IUser } from './User';
export type { IHabit } from './Habit';
export type { IBadge } from './Badge';
export type { IUserBadge } from './UserBadge';
export type { IAchievement } from './Achievement';
export type { IDailyLog } from './DailyLog';
export type { INotification } from './Notification';
