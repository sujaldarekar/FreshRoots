import axios from 'axios';

const normalizeBaseUrl = (value) => value.replace(/\/$/, '');

const resolveApiBaseUrl = () => {
  // Safety net for Render deploys: map freshroots-web* hosts to matching freshroots-api* host.
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host.endsWith('.onrender.com') && host.startsWith('freshroots-web')) {
      const apiHost = host.replace(/^freshroots-web/, 'freshroots-api');
      return `https://${apiHost}/api`;
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return normalizeBaseUrl(import.meta.env.VITE_API_URL);
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }

  return '/api';
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    const authPages = [
      '/login',
      '/register',
      '/customer/login',
      '/customer/register',
      '/farmer/login',
      '/farmer/register',
    ];
    const isAuthPage = authPages.some((path) => window.location.pathname.startsWith(path));

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth ===
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// === Products ===
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFarmerProducts: (farmerId) => api.get(`/products/farmer/${farmerId}`),
  create: (formData) =>
    api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
};

// === Orders ===
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getFarmerOrders: () => api.get('/orders/farmer-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// === Analytics ===
export const analyticsAPI = {
  create: (data) => api.post('/analytics', data),
  getMyAnalytics: () => api.get('/analytics/my-analytics'),
  update: (id, data) => api.put(`/analytics/${id}`, data),
  delete: (id) => api.delete(`/analytics/${id}`),
};

// === Farmers ===
export const farmerAPI = {
  getAll: () => api.get('/farmers'),
  getNearby: (params) => api.get('/farmers/nearby', { params }),
  getProfile: (id) => api.get(`/farmers/${id}`),
  rate: (id, data) => api.post(`/farmers/${id}/rate`, data),
};

export default api;
