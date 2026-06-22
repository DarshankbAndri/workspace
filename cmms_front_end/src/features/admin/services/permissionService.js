import api from '../../../shared/services/api';

export const getPermissions = () => api.get('/admin/permissions').then((response) => response.data);
export const getGroupedPermissions = () => api.get('/admin/permissions/grouped').then((response) => response.data);
