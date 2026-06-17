import api from './api';

export const getNotificationSettings = () => api.get('/admin/notification-settings').then((response) => response.data);
export const updateNotificationSettings = (data) => api.put('/admin/notification-settings', data).then((response) => response.data);
