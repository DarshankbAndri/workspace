import api from './api';

export const getDashboardSummary = () => api.get('/dashboard/summary').then((response) => response.data);

export const getMaintenanceRequests = () => api.get('/maintenance/requests').then((response) => response.data);
export const getMaintenanceRequestById = (id) => api.get(`/maintenance/requests/${id}`).then((response) => response.data);
export const createMaintenanceRequest = (data) => api.post('/maintenance/requests', data).then((response) => response.data);
export const updateMaintenanceRequest = (id, data) => api.put(`/maintenance/requests/${id}`, data).then((response) => response.data);
export const deleteMaintenanceRequest = (id) => api.delete(`/maintenance/requests/${id}`);

export const getMaintenanceAssignments = () => api.get('/maintenance/assignments').then((response) => response.data);
export const createMaintenanceAssignment = (data) => api.post('/maintenance/assignments', data).then((response) => response.data);
export const updateMaintenanceAssignment = (id, data) => api.put(`/maintenance/assignments/${id}`, data).then((response) => response.data);
export const deleteMaintenanceAssignment = (id) => api.delete(`/maintenance/assignments/${id}`);

export const getDowntimeEntries = () => api.get('/maintenance/downtime').then((response) => response.data);
export const createDowntimeEntry = (data) => api.post('/maintenance/downtime', data).then((response) => response.data);
export const updateDowntimeEntry = (id, data) => api.put(`/maintenance/downtime/${id}`, data).then((response) => response.data);
export const deleteDowntimeEntry = (id) => api.delete(`/maintenance/downtime/${id}`);
