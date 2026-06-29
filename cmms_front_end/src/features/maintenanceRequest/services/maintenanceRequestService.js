import api from '../../../shared/services/api';

export const getMaintenanceRequests = (siteId, status) => api.get('/maintenance/requests', { params: { ...(siteId ? { siteId } : {}), ...(status ? { status } : {}) } }).then((response) => response.data);
export const searchMaintenanceRequests = (data) => api.post('/maintenance/requests/search', data).then((response) => response.data);
export const getRequestsBySite = (siteId) => getMaintenanceRequests(siteId);
export const getMaintenanceRequestById = (id) => api.get(`/maintenance/requests/${id}`).then((response) => response.data);
export const createMaintenanceRequest = (data) => api.post('/maintenance/requests', data).then((response) => response.data);
export const updateMaintenanceRequest = (id, data) => api.put(`/maintenance/requests/${id}`, data).then((response) => response.data);
export const deleteMaintenanceRequest = (id) => api.delete(`/maintenance/requests/${id}`);
