import api from './api';

export const searchSpareParts = (data) => api.post('/spare-parts/search', data).then((response) => response.data);
export const getSparePartById = (stockId) => api.get(`/spare-parts/${stockId}`).then((response) => response.data);
export const getSparePartsBySite = (siteId) => api.get(`/spare-parts/site/${siteId}`).then((response) => response.data);
export const createSparePart = (data) => api.post('/spare-parts', data).then((response) => response.data);
export const updateSparePart = (stockId, data) => api.put(`/spare-parts/${stockId}`, data).then((response) => response.data);
export const deleteSparePart = (stockId) => api.delete(`/spare-parts/${stockId}`);
export const getSparePartTransactions = (stockId) => api.get(`/spare-parts/${stockId}/transactions`).then((response) => response.data);
export const stockIn = (stockId, data) => api.post(`/spare-parts/${stockId}/stock-in`, data).then((response) => response.data);
export const adjustStock = (stockId, data) => api.post(`/spare-parts/${stockId}/adjust`, data).then((response) => response.data);

export const getAssignmentSpares = (assignmentId) => api.get(`/maintenance/assignments/${assignmentId}/spares`).then((response) => response.data);
export const addAssignmentSpare = (assignmentId, data) => api.post(`/maintenance/assignments/${assignmentId}/spares`, data).then((response) => response.data);
export const updateAssignmentSpare = (assignmentId, usageId, data) => api.put(`/maintenance/assignments/${assignmentId}/spares/${usageId}`, data).then((response) => response.data);
export const deleteAssignmentSpare = (assignmentId, usageId) => api.delete(`/maintenance/assignments/${assignmentId}/spares/${usageId}`);
