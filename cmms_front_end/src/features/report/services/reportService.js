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

export const getEquipmentMaintenanceCostReport = ({ equipmentId, siteId, page = 0, size = 10 } = {}) => api.get('/reports/equipment-maintenance-cost', {
  params: {
    ...(equipmentId ? { equipmentId } : {}),
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);

export const getEquipmentCostBySiteReport = ({ siteId, page = 0, size = 10 } = {}) => api.get('/reports/equipment-cost-by-site', {
  params: {
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);

export const getEquipmentCostByCategoryReport = ({ siteId, page = 0, size = 10 } = {}) => api.get('/reports/equipment-cost-by-category', {
  params: {
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);

export const getEquipmentCostByCriticalityReport = ({ siteId, page = 0, size = 10 } = {}) => api.get('/reports/equipment-cost-by-criticality', {
  params: {
    ...(siteId ? { siteId } : {}),
    page,
    size,
  },
}).then((response) => response.data);
