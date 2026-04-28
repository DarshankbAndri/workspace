import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 responses (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const changePassword = (currentPassword, newPassword, confirmPassword) => {
  return api.post('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

// User API
export const getUserById = (userId) => {
  return api.get(`/users/${userId}`);
};

export const getAllUsers = () => {
  return api.get('/users');
};

export const createUser = (userData) => {
  return api.post('/users', userData);
};

export const createUserByHR = (hrId, userData) => {
  return api.post(`/users?hrId=${hrId}`, userData);
};

// Claims API
export const createClaim = (userId, claimData) => {
  return api.post(`/claims?userId=${userId}`, claimData);
};

export const submitClaim = (claimId, userId) => {
  return api.post(`/claims/${claimId}/submit?userId=${userId}`);
};

export const getMyClaimsById = (userId) => {
  return api.get(`/claims/my?userId=${userId}`);
};

export const getClaimById = (claimId) => {
  return api.get(`/claims/${claimId}`);
};

export const getPendingClaimsByManager = (managerId) => {
  return api.get(`/claims/pending?managerId=${managerId}`);
};

export const approveClaim = (claimId, managerId, approvalData) => {
  return api.put(`/claims/${claimId}/approve?managerId=${managerId}`, approvalData);
};

export const rejectClaim = (claimId, managerId, approvalData) => {
  return api.put(`/claims/${claimId}/reject?managerId=${managerId}`, approvalData);
};

export const approveClaimByHR = (claimId, hrId, approvalData) => {
  return api.put(`/claims/${claimId}/hr-approve?hrId=${hrId}`, approvalData);
};

export const markClaimAsPaid = (claimId, hrId) => {
  return api.put(`/claims/${claimId}/pay?hrId=${hrId}`);
};

export default api;
