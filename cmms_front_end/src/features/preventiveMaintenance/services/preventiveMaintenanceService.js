import api from '../../../shared/services/api';

export const getPMSchedules = () => api.get('/preventive-maintenance/schedules').then((response) => response.data);
export const searchPMSchedules = (data) => api.post('/preventive-maintenance/schedules/search', data).then((response) => response.data);
export const getPMScheduleById = (id) => api.get(`/preventive-maintenance/schedules/${id}`).then((response) => response.data);
export const createPMSchedule = (data) => api.post('/preventive-maintenance/schedules', data).then((response) => response.data);
export const updatePMSchedule = (id, data) => api.put(`/preventive-maintenance/schedules/${id}`, data).then((response) => response.data);
export const deletePMSchedule = (id) => api.delete(`/preventive-maintenance/schedules/${id}`);
export const getUpcomingPMSchedules = (days = 30) => api.get(`/preventive-maintenance/schedules/upcoming?days=${days}`).then((response) => response.data);
export const getPMCalendarSchedules = ({ startDate, endDate, siteId, equipmentId }) => api.get('/preventive-maintenance/calendar', {
  params: {
    startDate,
    endDate,
    ...(siteId ? { siteId } : {}),
    ...(equipmentId ? { equipmentId } : {}),
  },
}).then((response) => response.data);
export const generatePMWorkOrder = (id) => api.post(`/preventive-maintenance/schedules/${id}/generate-work-order`).then((response) => response.data);
export const generateDuePMWorkOrders = () => api.post('/preventive-maintenance/schedules/generate-due-work-orders').then((response) => response.data);
