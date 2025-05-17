import { defineStore } from 'pinia';
import axios from 'axios';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    unreadCount: 0,
    notifications: [], // 我們可能不再需要這個陣列來計算未讀數量
  }),
  getters: {
    unreadNotificationCount: (state) => state.unreadCount,
  },
  actions: {
    async fetchNotifications(userId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/notifications/unread/${userId}`);
        console.log('Unread Count API Response:', response.data);
        if (response.data.success) {
          this.unreadCount = response.data.data;
        } else {
          console.error('Failed to fetch unread notification count:', response.data.message);
          this.unreadCount = 0;
        }
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
        this.unreadCount = 0;
      }
    },
    async fetchNotificationList(userId) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/notifications/${userId}`);
        console.log('Notification List API Response:', response.data);
        if (response.data.success) {
          this.notifications = response.data.data;
        } else {
          console.error('Failed to fetch notification list:', response.data.message);
          this.notifications = [];
        }
      } catch (error) {
        console.error('Error fetching notification list:', error);
        this.notifications = [];
      }
    },
    markAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount--; // 本地更新未讀數量
      }
    },
    addNotification(newNotification) {
      this.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        this.unreadCount++;
      }
    },
  },
});