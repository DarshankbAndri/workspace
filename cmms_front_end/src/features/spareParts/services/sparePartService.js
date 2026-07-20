import api from '../../../shared/services/api';

export const searchSpareParts = (data) => api.post('/spare-parts/search', data).then((response) => response.data);
export const getSparePartById = (stockId) => api.get(`/spare-parts/${stockId}`).then((response) => response.data);
export const getSparePartsBySite = (siteId) => api.get(`/spare-parts/site/${siteId}`).then((response) => response.data);
export const createSparePart = (data) => api.post('/spare-parts', data).then((response) => response.data);
export const updateSparePart = (stockId, data) => api.put(`/spare-parts/${stockId}`, data).then((response) => response.data);
export const deleteSparePart = (stockId) => api.delete(`/spare-parts/${stockId}`);
export const getSparePartTransactions = (stockId) => api.get(`/spare-parts/${stockId}/transactions`).then((response) => response.data);
export const getSparePartEquipmentBom = (stockId) => api.get(`/spare-parts/${stockId}/equipment-bom`).then((response) => response.data);
export const createSparePartEquipmentBom = (stockId, data) => api.post(`/spare-parts/${stockId}/equipment-bom`, data).then((response) => response.data);
export const updateSparePartEquipmentBom = (stockId, bomId, data) => api.put(`/spare-parts/${stockId}/equipment-bom/${bomId}`, data).then((response) => response.data);
export const deleteSparePartEquipmentBom = (stockId, bomId) => api.delete(`/spare-parts/${stockId}/equipment-bom/${bomId}`);
export const stockIn = (stockId, data) => api.post(`/spare-parts/${stockId}/stock-in`, data).then((response) => response.data);
export const adjustStock = (stockId, data) => api.post(`/spare-parts/${stockId}/adjust`, data).then((response) => response.data);
export const transferStock = (stockId, data) => api.post(`/spare-parts/${stockId}/transfer`, data).then((response) => response.data);
export const importSpareParts = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/spare-parts/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((response) => response.data);
};

export const getReorderRequests = (params = {}) => api.get('/spare-part-reorders', { params }).then((response) => response.data);
export const createReorderRequest = (data) => api.post('/spare-part-reorders', data).then((response) => response.data);
export const updateReorderRequest = (id, data) => api.put(`/spare-part-reorders/${id}`, data).then((response) => response.data);
export const receivePurchaseRequestStock = (id, data = {}) => api.post(`/spare-part-reorders/${id}/receive-stock`, data).then((response) => response.data);

export const createSpareRequest = (assignmentId, data) => api.post(`/assignments/${assignmentId}/spare-requests`, data).then((response) => response.data);
export const getSpareRequests = (params = {}) => api.get('/spare-requests', { params }).then((response) => response.data);
export const getSpareRequestById = (id) => api.get(`/spare-requests/${id}`).then((response) => response.data);
export const managerApproveSpareRequest = (id, data = {}) => api.post(`/spare-requests/${id}/manager-approve`, data).then((response) => response.data);
export const managerRejectSpareRequest = (id, data = {}) => api.post(`/spare-requests/${id}/manager-reject`, data).then((response) => response.data);
export const checkSpareRequestStock = (id, data = {}) => api.post(`/spare-requests/${id}/check-stock`, data).then((response) => response.data);
export const reserveSpareRequest = (id, data = {}) => api.post(`/spare-requests/${id}/reserve`, data).then((response) => response.data);
export const issueSpareRequest = (id, data = {}) => api.post(`/spare-requests/${id}/issue`, data).then((response) => response.data);
export const createPurchaseRequestFromSpare = (id, data = {}) => api.post(`/spare-requests/${id}/create-purchase-request`, data).then((response) => response.data);
export const consumeReturnSpareRequest = (id, data = {}) => api.post(`/spare-requests/${id}/consume-return`, data).then((response) => response.data);

export const getAssignmentSpares = (assignmentId) => api.get(`/maintenance/assignments/${assignmentId}/spares`).then((response) => response.data);
export const addAssignmentSpare = (assignmentId, data) => api.post(`/maintenance/assignments/${assignmentId}/spares`, data).then((response) => response.data);
export const updateAssignmentSpare = (assignmentId, usageId, data) => api.put(`/maintenance/assignments/${assignmentId}/spares/${usageId}`, data).then((response) => response.data);
export const deleteAssignmentSpare = (assignmentId, usageId) => api.delete(`/maintenance/assignments/${assignmentId}/spares/${usageId}`);
export const reserveAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/reserve`, data).then((response) => response.data);
export const issueAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/issue`, data).then((response) => response.data);
export const consumeAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/consume`, data).then((response) => response.data);
export const rejectAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/reject`, data).then((response) => response.data);
export const cancelAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/cancel`, data).then((response) => response.data);
export const returnAssignmentSpare = (assignmentId, usageId, data = {}) => api.post(`/maintenance/assignments/${assignmentId}/spares/${usageId}/return`, data).then((response) => response.data);
