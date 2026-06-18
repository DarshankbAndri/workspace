import axios from 'axios';

export const API_BASE_URL = 'http://localhost:4200/api';

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
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('allowedSites');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const login = (username, password) => {
  console.log('Logging in with username:', username);
  return api.post('/auth/login', { username, password })
    .then(response => {
      console.log('Login successful:', response);
      return response;
    })
    .catch(error => {
      console.error('Login API error:', error);
      throw error;
    });
};

export const changePassword = (currentPassword, newPassword, confirmPassword) => {
  return api.post('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
};

export const getCurrentUserAccess = () => api.get('/auth/me');
export const getRoles = () => api.get('/admin/roles');
export const getRoleById = (id) => api.get(`/admin/roles/${id}`);
export const createRole = (role) => api.post('/admin/roles', role);
export const updateRole = (id, role) => api.put(`/admin/roles/${id}`, role);
export const deleteRole = (id) => api.delete(`/admin/roles/${id}`);
export const getPermissions = () => api.get('/admin/permissions');
export const getGroupedPermissions = () => api.get('/admin/permissions/grouped');
export const getUserRoles = (userId) => api.get(`/admin/users/${userId}/roles`);
export const updateUserRoles = (userId, assignments) => api.put(`/admin/users/${userId}/roles`, assignments);

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

export const uploadDocument = (entryType, entryId, sectionId, documentName, file) => {
  const formData = new FormData();
  formData.append('documentName', documentName);
  formData.append('file', file);
  formData.append('sectionId', sectionId);
  return api.post(`/documents/upload/${entryType}/${entryId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

// Document download API - Create separate axios instance for file downloads
const fileApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Longer timeout for file operations
});

// Add JWT token to file API requests
fileApi.interceptors.request.use(
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

// Handle file API response errors
fileApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('allowedSites');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const downloadDocument = (documentId, entryType) => {
  console.log(`Downloading document ${documentId} of type ${entryType}`);
  return fileApi.get(`/documents/download/${documentId}?entryType=${entryType}`, {
    responseType: 'blob',
  }).catch((error) => {
    console.error('Download error:', error);
    throw error;
  });
};

export const viewDocument = (documentId, entryType) => {
  console.log(`Viewing document ${documentId} of type ${entryType}`);
  return fileApi.get(`/documents/view/${documentId}?entryType=${entryType}`, {
    responseType: 'blob',
  }).catch((error) => {
    console.error('View error:', error);
    throw error;
  });
};

export default api;
