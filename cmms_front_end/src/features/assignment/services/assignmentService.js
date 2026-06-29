import api from '../../../shared/services/api';

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

export const getAssignmentWorkLogs = (assignmentId) => api.get(`/maintenance/assignments/${assignmentId}/work-logs`).then((response) => response.data);
export const addAssignmentWorkLog = (assignmentId, data) => api.post(`/maintenance/assignments/${assignmentId}/work-logs`, data).then((response) => response.data);
export const updateAssignmentWorkLog = (assignmentId, workLogId, data) => api.put(`/maintenance/assignments/${assignmentId}/work-logs/${workLogId}`, data).then((response) => response.data);
export const deleteAssignmentWorkLog = (assignmentId, workLogId) => api.delete(`/maintenance/assignments/${assignmentId}/work-logs/${workLogId}`);
export const uploadAssignmentWorkLogAttachment = (assignmentId, workLogId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/maintenance/assignments/${assignmentId}/work-logs/${workLogId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data);
};
export const downloadAssignmentWorkLogAttachment = (assignmentId, workLogId, attachmentId) => (
  api.get(`/maintenance/assignments/${assignmentId}/work-logs/${workLogId}/attachments/${attachmentId}`, { responseType: 'blob' })
);
export const deleteAssignmentWorkLogAttachment = (assignmentId, workLogId, attachmentId) => api.delete(`/maintenance/assignments/${assignmentId}/work-logs/${workLogId}/attachments/${attachmentId}`);
