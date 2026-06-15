import api from './api';

export const getRoles = () => api.get('/admin/roles').then((response) => response.data);
export const getRoleById = (id) => api.get(`/admin/roles/${id}`).then((response) => response.data);
export const createRole = (data) => api.post('/admin/roles', data).then((response) => response.data);
export const updateRole = (id, data) => api.put(`/admin/roles/${id}`, data).then((response) => response.data);
export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);
