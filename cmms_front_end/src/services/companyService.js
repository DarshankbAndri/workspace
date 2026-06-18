import api, { API_BASE_URL } from './api';

export const resolveCompanyLogoUrl = (logoUrl) => {
  if (!logoUrl) return '';
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return `${API_BASE_URL}${logoUrl}`;
};

export const getCurrentCompany = () => api.get('/company/current').then((response) => response.data || null);
export const getCompanyById = (id) => api.get(`/company/${id}`).then((response) => response.data);
export const createCompany = (data) => api.post('/company/create', data).then((response) => response.data);
export const updateCompany = (id, data) => api.put(`/company/update/${id}`, data).then((response) => response.data);
export const uploadCompanyLogo = (companyId, file) => {
  const formData = new FormData();
  formData.append('companyId', companyId);
  formData.append('file', file);
  return api.post('/company/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data);
};
