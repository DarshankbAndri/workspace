import api, { API_BASE_URL } from '../../../shared/services/api';

export const resolveProfilePhotoUrl = (profilePhotoUrl) => {
  if (!profilePhotoUrl) return '';
  if (/^https?:\/\//i.test(profilePhotoUrl)) return profilePhotoUrl;
  return `${API_BASE_URL}${profilePhotoUrl}`;
};

export const getUserProfile = () => api.get('/auth/profile').then((response) => response.data);

export const uploadProfileAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/auth/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((response) => response.data);
};
