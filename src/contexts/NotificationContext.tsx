import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { http } from '@/lib/http';

export interface Notification {
  id: string;
  _id?: string;
  type: 'assignment' | 'test' | 'submission' | 'general' | 'grade' | 'meeting' | 'announcement';
  title: string;
  message: string;
  timestamp: Date;
  createdAt?: string;
  read: boolean;
  relatedId?: string;
  related_id?: string;
  relatedName?: string;
  related_name?: string;
  studentName?: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user?._id) {
      console.log('NotificationContext: No user ID, skipping fetch');
      return;
    }
    
    try {
      console.log('NotificationContext: Fetching notifications for user:', user._id);
      const response = await http.get('/api/v1/notifications');
      console.log('NotificationContext: Raw response:', response);
      const data = response.data?.data;
      
      if (data?.notifications) {
        console.log('NotificationContext: Received', data.notifications.length, 'notifications');
        const formatted = data.notifications.map((n: any) => ({
          id: n._id,
          _id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt || n.timestamp),
          read: n.read,
          relatedId: n.related_id,
          relatedName: n.related_name,
          metadata: n.metadata
        }));
        setNotifications(formatted);
        setUnreadCount(data.unreadCount || 0);
        console.log('NotificationContext: Updated state with', formatted.length, 'notifications, unread:', data.unreadCount);
      } else {
        console.log('NotificationContext: No notifications in response data');
      }
    } catch (error: any) {
      console.error('NotificationContext: Failed to fetch notifications:', error);
      console.error('NotificationContext: Error details:', error.response?.data || error.message);
    }
  };

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50 notifications
  };

  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update backend
      await http.patch(`/api/v1/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Refresh to sync with backend
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      // Update backend
      await http.patch('/api/v1/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Refresh to sync with backend
      fetchNotifications();
    }
  };

  const clearNotification = async (id: string) => {
    try {
      // Optimistic update
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Update backend
      await http.delete(`/api/v1/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Refresh to sync with backend
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    try {
      // Optimistic update
      setNotifications([]);
      setUnreadCount(0);

      // Update backend
      await http.delete('/api/v1/notifications');
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      // Refresh to sync with backend
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
