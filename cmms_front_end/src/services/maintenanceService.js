import api from './api';

export const getDashboardSummary = (siteId) => api.get('/dashboard/summary', { params: siteId ? { siteId } : {} }).then((response) => response.data);

export const getMaintenanceRequests = (siteId, status) => api.get('/maintenance/requests', { params: { ...(siteId ? { siteId } : {}), ...(status ? { status } : {}) } }).then((response) => response.data);
export const searchMaintenanceRequests = (data) => api.post('/maintenance/requests/search', data).then((response) => response.data);
export const getRequestsBySite = (siteId) => getMaintenanceRequests(siteId);
export const getMaintenanceRequestById = (id) => api.get(`/maintenance/requests/${id}`).then((response) => response.data);
export const createMaintenanceRequest = (data) => api.post('/maintenance/requests', data).then((response) => response.data);
export const updateMaintenanceRequest = (id, data) => api.put(`/maintenance/requests/${id}`, data).then((response) => response.data);
export const deleteMaintenanceRequest = (id) => api.delete(`/maintenance/requests/${id}`);

export const getMaintenanceAssignments = (siteId) => api.get('/maintenance/assignments', { params: siteId ? { siteId } : {} }).then((response) => response.data);
export const searchMaintenanceAssignments = (data) => api.post('/maintenance/assignments/search', data).then((response) => response.data);
export const getMaintenanceAssignmentById = (id) => api.get(`/maintenance/assignments/${id}`).then((response) => response.data);
export const createMaintenanceAssignment = (data) => api.post('/maintenance/assignments', data).then((response) => response.data);
export const updateMaintenanceAssignment = (id, data) => api.put(`/maintenance/assignments/${id}`, data).then((response) => response.data);
export const deleteMaintenanceAssignment = (id) => api.delete(`/maintenance/assignments/${id}`);

export const getDowntimeEntries = (params = {}) => api.get('/maintenance/downtime', { params }).then((response) => response.data);
export const searchDowntimeEntries = (data) => api.post('/maintenance/downtime/search', data).then((response) => response.data);
export const getDowntimeEntryById = (id) => api.get(`/maintenance/downtime/${id}`).then((response) => response.data);
export const createDowntimeEntry = (data) => api.post('/maintenance/downtime', data).then((response) => response.data);
export const updateDowntimeEntry = (id, data) => api.put(`/maintenance/downtime/${id}`, data).then((response) => response.data);
export const deleteDowntimeEntry = (id) => api.delete(`/maintenance/downtime/${id}`);
