import api from './api';

export const getEquipments = (siteId) => api.get('/equipment', { params: siteId ? { siteId } : {} }).then((response) => response.data);
export const getEquipmentById = (id) => api.get(`/equipment/${id}`).then((response) => response.data);
export const createEquipment = (data) => api.post('/equipment', data).then((response) => response.data);
export const updateEquipment = (id, data) => api.put(`/equipment/${id}`, data).then((response) => response.data);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);
