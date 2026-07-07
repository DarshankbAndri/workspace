import api from '../../../shared/services/api';

export const getEquipments = (siteId) => api.get('/equipment', { params: siteId ? { siteId } : {} }).then((response) => response.data);
export const searchEquipments = (data) => api.post('/equipment/search', data).then((response) => response.data);
export const getEquipmentById = (id) => api.get(`/equipment/${id}`).then((response) => response.data);
export const getEquipmentSummary = (id) => api.get(`/equipment/${id}/summary`).then((response) => response.data);
export const getEquipmentHealth = (id) => api.get(`/equipment/${id}/health`).then((response) => response.data);
export const getEquipmentSpareBom = (id) => api.get(`/equipment/${id}/spare-bom`).then((response) => response.data);
export const createEquipmentSpareBom = (id, data) => api.post(`/equipment/${id}/spare-bom`, data).then((response) => response.data);
export const updateEquipmentSpareBom = (id, bomId, data) => api.put(`/equipment/${id}/spare-bom/${bomId}`, data).then((response) => response.data);
export const deleteEquipmentSpareBom = (id, bomId) => api.delete(`/equipment/${id}/spare-bom/${bomId}`);
export const getEquipmentDocuments = (id) => api.get(`/equipment/${id}/documents`).then((response) => response.data);
export const uploadEquipmentDocument = (id, data) => {
  const formData = new FormData();
  formData.append('documentType', data.documentType);
  if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
  if (data.remarks) formData.append('remarks', data.remarks);
  formData.append('file', data.file);
  return api.post(`/equipment/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data);
};
export const downloadEquipmentDocument = (id, documentId) => (
  api.get(`/equipment/${id}/documents/${documentId}/file`, { responseType: 'blob' })
);
export const deleteEquipmentDocument = (id, documentId) => api.delete(`/equipment/${id}/documents/${documentId}`);
export const createEquipment = (data) => api.post('/equipment', data).then((response) => response.data);
export const updateEquipment = (id, data) => api.put(`/equipment/${id}`, data).then((response) => response.data);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);
