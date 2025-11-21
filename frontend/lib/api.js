/*
 * API Client for Backend
 */

import axios from 'axios';

// API URL - should NOT include /api suffix as we add it in each endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    // Log error details for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('API Request Error:', {
        message: 'No response received from server',
        url: error.config?.url
      });
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/v1/auth/login', { username, password });
    return response.data;
  },
};

export const treesAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/trees');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/v1/trees/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/v1/trees', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/v1/trees/${id}`, data);
    return response.data;
  },
};

export const alertsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/v1/alerts', { params });
    return response.data;
  },
  acknowledge: async (id) => {
    const response = await api.post(`/api/v1/alerts/${id}/acknowledge`);
    return response.data;
  },
};

export const adminsAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/admins');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/v1/admins/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/v1/admins', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/v1/admins/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/admins/${id}`);
    return response.data;
  },
  getSessions: async () => {
    const response = await api.get('/api/v1/admins/sessions');
    return response.data;
  },
};

export const statsAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/stats');
    return response.data;
  },
};

export const settingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/v1/settings');
    return response.data;
  },
  getByKey: async (key) => {
    const response = await api.get(`/api/v1/settings/${key}`);
    return response.data;
  },
  update: async (key, value) => {
    const response = await api.put(`/api/v1/settings/${key}`, { value });
    return response.data;
  },
  getESP8266Config: async () => {
    const response = await api.get('/api/v1/settings/esp8266/config');
    return response.data;
  },
};

export default api;

