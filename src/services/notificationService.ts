/**
 * Notification Service
 * Handles notification-related API calls
 */

import api from './api';

export interface Notification {
  _id: string;
  user: string;
  type: 'reminder' | 'achievement' | 'streak' | 'level_up' | 'badge' | 'system';
  title: string;
  message: string;
  icon?: string;
  isRead: boolean;
  link?: string;
  metadata?: {
    habitId?: string;
    badgeId?: string;
    achievementId?: string;
  };
  scheduledFor?: string;
  sentAt?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  /**
   * Get user notifications
   */
  getNotifications: async (params?: {
    isRead?: boolean;
    type?: string;
    limit?: number;
  }): Promise<{ success: boolean; count: number; notifications: Notification[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.isRead !== undefined) queryParams.append('isRead', String(params.isRead));
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const endpoint = `/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;
    return api.get(endpoint);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ success: boolean; count: number }> => {
    return api.get('/notifications/unread/count');
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<{ success: boolean; notification: Notification }> => {
    return api.put(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    return api.put('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/notifications/${id}`);
  },

  /**
   * Clear all read notifications
   */
  clearReadNotifications: async (): Promise<{ success: boolean; message: string }> => {
    return api.delete('/notifications/clear-read');
  },

  /**
   * Create notification (internal)
   */
  createNotification: async (data: Partial<Notification>): Promise<{ success: boolean; notification: Notification }> => {
    return api.post('/notifications', data);
  },
};
