import api from '../../../shared/services/api';

export const getUserRoleUsers = () => api.get('/users').then((response) => response.data || []);

export const getUserRoleAssignments = (userId) => (
  api.get(`/admin/users/${userId}/roles`).then((response) => response.data || [])
);

export const replaceUserRoleAssignments = (userId, assignments) => (
  api.put(`/admin/users/${userId}/roles`, assignments).then((response) => response.data || [])
);
