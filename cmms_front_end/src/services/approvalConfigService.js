import api from './api';

export const getApprovalConfigs = () => api.get('/admin/approval-config').then((response) => response.data);
export const createApprovalConfig = (data) => api.post('/admin/approval-config', data).then((response) => response.data);
export const updateApprovalConfig = (id, data) => api.put(`/admin/approval-config/${id}`, data).then((response) => response.data);
