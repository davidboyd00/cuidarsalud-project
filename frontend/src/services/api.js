import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ==================== SERVICES ====================
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  reorder: (orders) => api.put('/services/reorder', { orders }),
};

// ==================== APPOINTMENTS ====================
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getMy: (params) => api.get('/appointments/my', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  getSlots: (params) => api.get('/appointments/slots', { params }),
  getStats: () => api.get('/appointments/stats'),
  create: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

// ==================== USERS ====================
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, newPassword) => api.put(`/users/${id}/reset-password`, { newPassword }),
  delete: (id) => api.delete(`/users/${id}`),
};

// ==================== CONTENT ====================
export const contentAPI = {
  getAll: (section) => api.get('/content', { params: { section } }),
  getOne: (key) => api.get(`/content/${key}`),
  update: (key, data) => api.put(`/content/${key}`, data),
  delete: (key) => api.delete(`/content/${key}`),
};

// ==================== SETTINGS ====================
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getOne: (key) => api.get(`/settings/${key}`),
  update: (key, data) => api.put(`/settings/${key}`, data),
};

// ==================== TEAM ====================
export const teamAPI = {
  getAll: (params) => api.get('/team', { params }),
  getOne: (id) => api.get(`/team/${id}`),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
};

// ==================== REVIEWS ====================
export const reviewsAPI = {
  getPublic: (params) => api.get('/reviews', { params }),
  getAll: (params) => api.get('/reviews/all', { params }),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ==================== CONTACT ====================
export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export default api;
