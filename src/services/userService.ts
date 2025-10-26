/**
 * User Service
 * Handles user stats, badges, and leaderboard
 */

import api from './api';

export interface UserStats {
  success: boolean;
  stats: {
    level: number;
    xp: number;
    totalXP: number;
    xpForNextLevel: number;
    streak: number;
    longestStreak: number;
    totalHabits: number;
    completedToday: number;
    totalCompletions: number;
    badgesEarned: number;
  };
}

export interface UserBadge {
  _id: string;
  user: string;
  badge: {
    _id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    tier: string;
    category: string;
    rarity: string;
  };
  earnedAt: string;
  progress: number;
  isDisplayed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXP: number;
  streak: number;
  isCurrentUser: boolean;
}

export const userService = {
  /**
   * Get user statistics
   */
  getStats: async (): Promise<UserStats> => {
    return api.get('/users/stats');
  },

  /**
   * Get user badges
   */
  getBadges: async (): Promise<{ success: boolean; count: number; badges: UserBadge[] }> => {
    return api.get('/users/badges');
  },

  /**
   * Check and award eligible badges
   */
  checkAndAwardBadges: async (): Promise<{ success: boolean; newBadgesCount: number; newBadges: UserBadge[] }> => {
    return api.post('/users/check-badges');
  },

  /**
   * Get leaderboard
   */
  getLeaderboard: async (params?: {
    type?: 'xp' | 'level' | 'streak';
    limit?: number;
  }): Promise<{ success: boolean; leaderboard: LeaderboardEntry[]; currentUserRank: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const endpoint = `/users/leaderboard${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Toggle badge display
   */
  toggleBadgeDisplay: async (badgeId: string): Promise<{ success: boolean; userBadge: UserBadge }> => {
    return api.put(`/users/badges/${badgeId}/toggle-display`);
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    return api.delete('/users/account');
  },

  /**
   * Export user data
   */
  exportData: async (): Promise<{ success: boolean; data: any }> => {
    return api.get('/users/export');
  },
};