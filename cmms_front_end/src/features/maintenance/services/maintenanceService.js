import api from '../../../shared/services/api';

export const getDashboardSummary = (siteId) => api.get('/dashboard/summary', { params: siteId ? { siteId } : {} }).then((response) => response.data);

export const getMaintenanceRequests = (siteId, status) => api.get('/maintenance/requests', { params: { ...(siteId ? { siteId } : {}), ...(status ? { status } : {}) } }).then((response) => response.data);
export const searchMaintenanceRequests = (data) => api.post('/maintenance/requests/search', data).then((response) => response.data);
export const getRequestsBySite = (siteId) => getMaintenanceRequests(siteId);
export const getMaintenanceRequestById = (id) => api.get(`/maintenance/requests/${id}`).then((response) => response.data);
export const createMaintenanceRequest = (data) => api.post('/maintenance/requests', data).then((response) => response.data);
export const updateMaintenanceRequest = (id, data) => api.put(`/maintenance/requests/${id}`, data).then((response) => response.data);
export const transitionMaintenanceRequest = (id, data) => api.post(`/maintenance/requests/${id}/transition`, data).then((response) => response.data);
export const deleteMaintenanceRequest = (id) => api.delete(`/maintenance/requests/${id}`);

export const getMaintenanceAssignments = (siteId) => api.get('/maintenance/assignments', { params: siteId ? { siteId } : {} }).then((response) => response.data);
export const searchMaintenanceAssignments = (data) => api.post('/maintenance/assignments/search', data).then((response) => response.data);
export const getMaintenanceAssignmentById = (id) => api.get(`/maintenance/assignments/${id}`).then((response) => response.data);
export const createMaintenanceAssignment = (data) => api.post('/maintenance/assignments', data).then((response) => response.data);
export const updateMaintenanceAssignment = (id, data) => api.put(`/maintenance/assignments/${id}`, data).then((response) => response.data);
export const deleteMaintenanceAssignment = (id) => api.delete(`/maintenance/assignments/${id}`);
export const getAssignmentChecklist = (assignmentId) => api.get(`/maintenance/assignments/${assignmentId}/checklist`).then((response) => response.data);
export const addAssignmentChecklistItem = (assignmentId, data) => api.post(`/maintenance/assignments/${assignmentId}/checklist`, data).then((response) => response.data);
export const updateAssignmentChecklistItem = (assignmentId, itemId, data) => api.put(`/maintenance/assignments/${assignmentId}/checklist/${itemId}`, data).then((response) => response.data);
export const deleteAssignmentChecklistItem = (assignmentId, itemId) => api.delete(`/maintenance/assignments/${assignmentId}/checklist/${itemId}`);
export const uploadAssignmentChecklistProof = (assignmentId, itemId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/maintenance/assignments/${assignmentId}/checklist/${itemId}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data);
};
export const downloadAssignmentChecklistProof = (assignmentId, itemId, proofId) => (
  api.get(`/maintenance/assignments/${assignmentId}/checklist/${itemId}/proof/${proofId}`, { responseType: 'blob' })
);
export const deleteAssignmentChecklistProof = (assignmentId, itemId, proofId) => api.delete(`/maintenance/assignments/${assignmentId}/checklist/${itemId}/proof/${proofId}`);

export const getDowntimeEntries = (params = {}) => api.get('/maintenance/downtime', { params }).then((response) => response.data);
export const searchDowntimeEntries = (data) => api.post('/maintenance/downtime/search', data).then((response) => response.data);
export const getDowntimeEntryById = (id) => api.get(`/maintenance/downtime/${id}`).then((response) => response.data);
export const createDowntimeEntry = (data) => api.post('/maintenance/downtime', data).then((response) => response.data);
export const updateDowntimeEntry = (id, data) => api.put(`/maintenance/downtime/${id}`, data).then((response) => response.data);
export const deleteDowntimeEntry = (id) => api.delete(`/maintenance/downtime/${id}`);
