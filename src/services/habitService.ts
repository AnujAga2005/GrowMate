/**
 * Habit Service
 * Handles all habit-related API calls
 */

import api from './api';

export interface Habit {
  _id: string;
  user: string;
  name: string;
  emoji: string;
  category: string;
  color?: string;
  frequency: 'Daily' | 'Weekly' | 'Custom';
  customDays?: number[];
  reminderTime?: string;
  reminderEnabled: boolean;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  totalCompletions: number;
  xpReward: number;
  isActive: boolean;
  notes?: string;
  goal?: {
    type: 'count' | 'duration';
    target: number;
    unit?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitData {
  name: string;
  emoji?: string;
  category: string;
  color?: string;
  frequency?: 'Daily' | 'Weekly' | 'Custom';
  customDays?: number[];
  reminderTime?: string;
  reminderEnabled?: boolean;
  xpReward?: number;
  notes?: string;
  goal?: {
    type: 'count' | 'duration';
    target: number;
    unit?: string;
  };
}

export interface UpdateHabitData extends Partial<CreateHabitData> {
  isActive?: boolean;
}

export interface CompleteHabitResponse {
  success: boolean;
  habit: Habit;
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  userXP: number;
  userLevel: number;
  message?: string;
}

export interface HabitStats {
  success: boolean;
  stats: {
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    completionsLast7Days: number;
    completionsLast30Days: number;
    completionRate7Days: number;
    completionRate30Days: number;
    completedDates: string[];
  };
}

export const habitService = {
  /**
   * Get all user habits
   */
  getHabits: async (params?: {
    category?: string;
    isActive?: boolean;
    frequency?: string;
  }): Promise<{ success: boolean; count: number; habits: Habit[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.frequency) queryParams.append('frequency', params.frequency);
    
    const endpoint = `/habits${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Get single habit
   */
  getHabit: async (id: string): Promise<{ success: boolean; habit: Habit }> => {
    return api.get(`/habits/${id}`);
  },

  /**
   * Create new habit
   */
  createHabit: async (data: CreateHabitData): Promise<{ success: boolean; habit: Habit }> => {
    return api.post('/habits', data);
  },

  /**
   * Update habit
   */
  updateHabit: async (id: string, data: UpdateHabitData): Promise<{ success: boolean; habit: Habit }> => {
    return api.put(`/habits/${id}`, data);
  },

  /**
   * Delete habit
   */
  deleteHabit: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/habits/${id}`);
  },

  /**
   * Mark habit as complete
   */
  completeHabit: async (id: string, date?: Date): Promise<CompleteHabitResponse> => {
    return api.post(`/habits/${id}/complete`, date ? { date } : {});
  },

  /**
   * Mark habit as incomplete
   */
  uncompleteHabit: async (id: string, date?: Date): Promise<{ success: boolean; habit: Habit }> => {
    return api.post(`/habits/${id}/uncomplete`, date ? { date } : {});
  },

  /**
   * Get habit statistics
   */
  getHabitStats: async (id: string): Promise<HabitStats> => {
    return api.get(`/habits/${id}/stats`);
  },
};
