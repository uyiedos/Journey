'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { communityService } from '@/services/communityService';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'points_awarded' | 'points_spent' | 'achievement_unlocked' | 'post_like' | 'post_comment';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { communityService } = await import('@/services/communityService');
      const data = await communityService.getNotifications(user.id);

      const mapped = (data || []).map((n: any): Notification => ({
        id: n.id,
        user_id: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data,
        read: typeof n.read === 'boolean' ? n.read : !!n.is_read,
        created_at: n.created_at,
      }));

      setNotifications(mapped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { communityService } = await import('@/services/communityService');
      await communityService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { communityService } = await import('@/services/communityService');
      await communityService.markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
