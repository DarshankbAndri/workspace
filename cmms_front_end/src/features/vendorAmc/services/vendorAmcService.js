import api from '../../../shared/services/api';

export const searchVendorAmcContracts = (data) => api.post('/vendor-amc/search', data).then((response) => response.data);
export const getVendorAmcContract = (id) => api.get(`/vendor-amc/${id}`).then((response) => response.data);
export const createVendorAmcContract = (data) => api.post('/vendor-amc', data).then((response) => response.data);
export const updateVendorAmcContract = (id, data) => api.put(`/vendor-amc/${id}`, data).then((response) => response.data);
export const deleteVendorAmcContract = (id) => api.delete(`/vendor-amc/${id}`);
export const getVendorAmcContracts = (vendorId) => api.get(`/vendors/${vendorId}/amc-contracts`).then((response) => response.data);
export const getEquipmentActiveAmc = (equipmentId) => api.get(`/equipment/${equipmentId}/active-amc`).then((response) => response.data);
export const getVendorAmcEquipment = (id) => api.get(`/vendor-amc/${id}/equipment`).then((response) => response.data);
export const mapVendorAmcEquipment = (id, data) => api.post(`/vendor-amc/${id}/equipment`, data).then((response) => response.data);
export const removeVendorAmcEquipment = (id, equipmentId) => api.delete(`/vendor-amc/${id}/equipment/${equipmentId}`);
export const renewVendorAmcContract = (id, data) => api.post(`/vendor-amc/${id}/renew`, data).then((response) => response.data);
export const getVendorAmcDashboard = () => api.get('/vendor-amc/dashboard').then((response) => response.data);
