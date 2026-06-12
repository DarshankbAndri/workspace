import api from './api';

export const getVendors = (params = {}) => api.get('/vendors', { params }).then((response) => response.data);
export const getVendorById = (id) => api.get(`/vendors/${id}`).then((response) => response.data);
export const createVendor = (data) => api.post('/vendors', data).then((response) => response.data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data).then((response) => response.data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);
