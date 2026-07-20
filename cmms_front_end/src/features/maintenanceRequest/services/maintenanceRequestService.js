import api from '../../../shared/services/api';

export const getMaintenanceRequests = (siteId, status) => api.get('/maintenance/requests', { params: { ...(siteId ? { siteId } : {}), ...(status ? { status } : {}) } }).then((response) => response.data);
export const searchMaintenanceRequests = (data) => api.post('/maintenance/requests/search', data).then((response) => response.data);
export const getRequestsBySite = (siteId) => getMaintenanceRequests(siteId);
export const getRequestContext = (equipmentId) => api.get('/maintenance/requests/context', { params: { equipmentId } }).then((response) => response.data);
export const getRequestQueueSummary = (params = {}) => api.get('/maintenance/requests/queue-summary', { params }).then((response) => response.data);
export const getRequestRelatedRecords = (id) => api.get(`/maintenance/requests/${id}/related-records`).then((response) => response.data);
export const getMaintenanceRequestById = (id) => api.get(`/maintenance/requests/${id}`).then((response) => response.data);
export const createMaintenanceRequest = (data) => api.post('/maintenance/requests', data).then((response) => response.data);
export const updateMaintenanceRequest = (id, data) => api.put(`/maintenance/requests/${id}`, data).then((response) => response.data);
export const transitionMaintenanceRequest = (id, data) => api.post(`/maintenance/requests/${id}/transition`, data).then((response) => response.data);
export const deleteMaintenanceRequest = (id) => api.delete(`/maintenance/requests/${id}`);
