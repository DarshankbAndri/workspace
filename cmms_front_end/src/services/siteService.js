import api from './api';

export const getSites = () => api.get('/hr/sites').then((response) => response.data);
export const getSiteById = (id) => api.get(`/hr/sites/${id}`).then((response) => response.data);
export const createSite = (data) => api.post('/hr/sites', data).then((response) => response.data);
export const updateSite = (id, data) => api.put(`/hr/sites/${id}`, data).then((response) => response.data);
export const deleteSite = (id) => api.delete(`/hr/sites/${id}`);
