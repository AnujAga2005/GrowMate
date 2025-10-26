/**
 * Analytics Service
 * Handles analytics and statistics API calls
 */

import api from './api';

export interface DailyData {
  date: string;
  habitsCompleted: number;
  totalHabits: number;
  completionRate: number;
  xpEarned: number;
}

export interface AnalyticsDashboard {
  success: boolean;
  analytics: {
    period: {
      days: number;
      startDate: string;
      endDate: string;
    };
    overview: {
      totalCompletions: number;
      totalXP: number;
      averageCompletionRate: number;
      activeHabits: number;
    };
    bestDay: {
      date: string;
      completionRate: number;
      habitsCompleted: number;
    } | null;
    dailyData: DailyData[];
    habitsByCategory: Record<string, number>;
  };
}

export interface HabitTrend {
  habitId: string;
  name: string;
  emoji: string;
  last7Days: number;
  previous7Days: number;
  trend: 'up' | 'down';
  trendPercentage: number;
  currentStreak: number;
}

export interface StreakCalendar {
  success: boolean;
  habit: {
    id: string;
    name: string;
    emoji: string;
    streak: number;
  };
  calendar: Record<string, boolean>;
  completedDates: string[];
}

export interface CategoryPerformance {
  category: string;
  habitCount: number;
  totalCompletions: number;
  averageStreak: number;
  totalStreak: number;
  averageCompletions: number;
}

export interface XPHistoryEntry {
  date: string;
  xpEarned: number;
  cumulativeXP: number;
}

export const analyticsService = {
  /**
   * Get analytics dashboard
   */
  getDashboard: async (days: number = 30): Promise<AnalyticsDashboard> => {
    return api.get(`/analytics/dashboard?days=${days}`);
  },

  /**
   * Get habit trends
   */
  getTrends: async (): Promise<{ success: boolean; trends: HabitTrend[] }> => {
    return api.get('/analytics/trends');
  },

  /**
   * Get streak calendar for a habit
   */
  getStreakCalendar: async (habitId: string, year?: number, month?: number): Promise<StreakCalendar> => {
    let endpoint = `/analytics/streak-calendar?habitId=${habitId}`;
    if (year && month) {
      endpoint += `&year=${year}&month=${month}`;
    }
    return api.get(endpoint);
  },

  /**
   * Get category performance
   */
  getCategoryPerformance: async (): Promise<{ success: boolean; performance: CategoryPerformance[] }> => {
    return api.get('/analytics/category-performance');
  },

  /**
   * Get XP history
   */
  getXPHistory: async (days: number = 30): Promise<{ success: boolean; xpHistory: XPHistoryEntry[] }> => {
    return api.get(`/analytics/xp-history?days=${days}`);
  },
};
