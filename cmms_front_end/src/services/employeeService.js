import api from './api';

export const getEmployees = () => api.get('/hr/employees').then((response) => response.data);
export const getEmployeeById = (id) => api.get(`/hr/employees/${id}`).then((response) => response.data);
export const createEmployee = (data) => api.post('/hr/employees', data).then((response) => response.data);
export const updateEmployee = (id, data) => api.put(`/hr/employees/${id}`, data).then((response) => response.data);
export const deleteEmployee = (id) => api.delete(`/hr/employees/${id}`);
