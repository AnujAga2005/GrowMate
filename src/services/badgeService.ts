/**
 * Badge Service
 * Handles badge-related API calls
 */

import api from './api';

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  category: 'Streak' | 'Completion' | 'Level' | 'Special' | 'Achievement';
  requirement: {
    type: 'streak' | 'completions' | 'level' | 'habits' | 'custom';
    value: number;
    description?: string;
  };
  xpReward: number;
  isActive: boolean;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  createdAt: string;
  updatedAt: string;
}

export const badgeService = {
  /**
   * Get all badges
   */
  getAllBadges: async (params?: {
    category?: string;
    tier?: string;
    rarity?: string;
  }): Promise<{ success: boolean; count: number; badges: Badge[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.tier) queryParams.append('tier', params.tier);
    if (params?.rarity) queryParams.append('rarity', params.rarity);
    
    const endpoint = `/badges${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Get single badge
   */
  getBadge: async (id: string): Promise<{ success: boolean; badge: Badge }> => {
    return api.get(`/badges/${id}`);
  },

  /**
   * Create badge (admin)
   */
  createBadge: async (data: Partial<Badge>): Promise<{ success: boolean; badge: Badge }> => {
    return api.post('/badges', data);
  },

  /**
   * Update badge (admin)
   */
  updateBadge: async (id: string, data: Partial<Badge>): Promise<{ success: boolean; badge: Badge }> => {
    return api.put(`/badges/${id}`, data);
  },

  /**
   * Delete badge (admin)
   */
  deleteBadge: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/badges/${id}`);
  },
};
