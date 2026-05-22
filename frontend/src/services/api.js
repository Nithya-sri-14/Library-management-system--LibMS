import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};

export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/books/${id}`),
  bulkImport: (data) => api.post('/books/bulk-import', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  export: (format) => api.get(`/books/export?format=${format}`, { responseType: 'blob' }),
  getGenres: () => api.get('/books/genres'),
  suggestions: (q) => api.get(`/books/suggestions?q=${q}`),
};

export const authorsAPI = {
  getAll: (params) => api.get('/authors', { params }),
  getById: (id) => api.get(`/authors/${id}`),
  create: (data) => api.post('/authors', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/authors/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/authors/${id}`),
};

export const borrowersAPI = {
  getAll: (params) => api.get('/borrowers', { params }),
  getById: (id) => api.get(`/borrowers/${id}`),
  create: (data) => api.post('/borrowers', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/borrowers/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/borrowers/${id}`),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  issue: (data) => api.post('/transactions/issue', data),
  return: (id) => api.put(`/transactions/${id}/return`),
  getOverdue: () => api.get('/transactions/overdue'),
};

export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  trends: () => api.get('/reports/trends'),
  popularAuthors: () => api.get('/reports/popular-authors'),
  activeBorrowers: () => api.get('/reports/active-borrowers'),
  overdueReport: () => api.get('/reports/overdue-report', { responseType: 'blob' }),
  inventory: () => api.get('/reports/inventory'),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
