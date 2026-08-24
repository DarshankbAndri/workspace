import api from '../../../shared/services/api';

export const getPendingApprovals = () => api.get('/approvals/pending').then((response) => response.data);
export const searchPendingApprovals = (data) => api.post('/approvals/pending/search', data).then((response) => response.data);
export const getApprovalHistory = (params = {}) => api.get('/approvals/history', { params }).then((response) => response.data);
export const searchApprovalHistory = (data) => api.post('/approvals/history/search', data).then((response) => response.data);
export const getApprovalById = (id) => api.get(`/approvals/${id}`).then((response) => response.data);
export const approveApproval = (id, comments) => api.post(`/approvals/${id}/approve`, { comments }).then((response) => response.data);
export const rejectApproval = (id, comments) => api.post(`/approvals/${id}/reject`, { comments }).then((response) => response.data);
