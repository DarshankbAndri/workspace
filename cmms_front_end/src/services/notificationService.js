import api from './api';

export const getNotifications = () => api.get('/notifications').then((response) => response.data);
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count').then((response) => response.data?.count || 0);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`).then((response) => response.data);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const archiveNotification = (id) => api.put(`/notifications/${id}/archive`);
