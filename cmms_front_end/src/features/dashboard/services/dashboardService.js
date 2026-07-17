import api from '../../../shared/services/api';

export const getDashboardSummary = (siteId) => api.get('/dashboard/summary', { params: siteId ? { siteId } : {} }).then((response) => response.data);

export const getDashboardData = async (siteId) => {
  return api.get('/dashboard/overview', { params: siteId ? { siteId } : {} }).then((response) => response.data);
};
