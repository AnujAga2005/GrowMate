/**
 * Achievement Service
 * Handles achievement-related API calls
 */

import api from './api';

export interface Achievement {
  _id: string;
  user: string;
  type: 'streak' | 'completion' | 'level_up' | 'badge_earned' | 'milestone';
  title: string;
  description: string;
  icon: string;
  xpEarned: number;
  metadata?: {
    habitId?: string;
    badgeId?: string;
    streakCount?: number;
    completionCount?: number;
    level?: number;
  };
  createdAt: string;
}

export interface AchievementStats {
  success: boolean;
  stats: {
    total: number;
    byType: Record<string, number>;
    totalXPEarned: number;
    recentAchievements: number;
  };
}

export const achievementService = {
  /**
   * Get user achievements
   */
  getAchievements: async (params?: {
    type?: string;
    limit?: number;
  }): Promise<{ success: boolean; count: number; achievements: Achievement[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const endpoint = `/achievements${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Get single achievement
   */
  getAchievement: async (id: string): Promise<{ success: boolean; achievement: Achievement }> => {
    return api.get(`/achievements/${id}`);
  },

  /**
   * Delete achievement
   */
  deleteAchievement: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/achievements/${id}`);
  },

  /**
   * Get achievement statistics
   */
  getStats: async (): Promise<AchievementStats> => {
    return api.get('/achievements/stats');
  },
};
