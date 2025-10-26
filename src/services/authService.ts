/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import api, { setAuthToken, removeAuthToken } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXP: number;
  streak: number;
  longestStreak: number;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    reminderTime: string;
  };
  badges?: any[];
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    reminderTime?: string;
  };
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  /**
   * Login user
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      setAuthToken(response.token);
    }
    return response;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    removeAuthToken();
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<{ success: boolean; user: User }> => {
    return api.get('/auth/me');
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<{ success: boolean; user: User }> => {
    return api.put('/auth/profile', data);
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return api.put('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Delete account
   */
  deleteAccount: async (password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/auth/account');
    removeAuthToken();
    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
