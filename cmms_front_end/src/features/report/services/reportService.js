import api from '../../../shared/services/api';

export const getEquipmentHistoryReport = ({ equipmentId, siteId, page = 0, size = 10 } = {}) => api.get('/reports/equipment-history', {
  params: {
    ...(equipmentId ? { equipmentId } : {}),
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);

export const getDowntimeAnalysisReport = ({ equipmentId, siteId, page = 0, size = 10 } = {}) => api.get('/reports/downtime-analysis', {
  params: {
    ...(equipmentId ? { equipmentId } : {}),
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);
