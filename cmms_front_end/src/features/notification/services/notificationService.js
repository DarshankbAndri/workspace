import api from '../../../shared/services/api';
import { API_BASE_URL } from '../../../shared/services/api';
import { fetchEventSource } from '@microsoft/fetch-event-source';

export const getNotifications = (params = {}) => api.get('/notifications', { params }).then((response) => response.data);
export const getNotificationList = (params = {}) => getNotifications(params).then((page) => page?.content || []);
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count').then((response) => response.data?.count || 0);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then((response) => response.data);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const archiveNotification = (id) => api.put(`/notifications/${id}/archive`);

export const subscribeToNotificationStream = ({ onCreated, onUpdated, onCount, onError } = {}) => {
  const controller = new AbortController();
  const token = localStorage.getItem('token');

  fetchEventSource(`${API_BASE_URL}/notifications/stream`, {
    signal: controller.signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    openWhenHidden: true,
    onmessage(event) {
      if (!event.data) {
        return;
      }
      const data = JSON.parse(event.data);
      if (event.event === 'notification.created') {
        onCreated?.(data);
      } else if (event.event === 'notification.updated') {
        onUpdated?.(data);
      } else if (event.event === 'notification.count') {
        onCount?.(data.count || 0);
      }
    },
    onerror(error) {
      onError?.(error);
    },
  }).catch((error) => {
    if (!controller.signal.aborted) {
      onError?.(error);
    }
  });

  return () => controller.abort();
};
