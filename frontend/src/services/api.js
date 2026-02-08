import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
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

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getMyProducts: (params) => api.get('/products/seller/my-products', { params }),
  create: (formData) => api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/products/${id}`),
  removeImage: (id, imageIndex) => api.delete(`/products/${id}/images/${imageIndex}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
};

// Inquiries API
export const inquiriesAPI = {
  create: (data) => api.post('/inquiries', data),
  getMyInquiries: (params) => api.get('/inquiries/my-inquiries', { params }),
  getSellerInquiries: (params) => api.get('/inquiries/seller-inquiries', { params }),
  getOne: (id) => api.get(`/inquiries/${id}`),
  respond: (id, response) => api.put(`/inquiries/${id}/respond`, { response }),
  markAsRead: (id) => api.put(`/inquiries/${id}/read`),
};

// Sellers API
export const sellersAPI = {
  getFeatured: () => api.get('/sellers/featured'),
  getProfile: (id) => api.get(`/sellers/${id}`),
  getProducts: (id, params) => api.get(`/sellers/${id}/products`, { params }),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  approveSeller: (id, approved) => api.put(`/admin/users/${id}/approve`, { approved }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  getProducts: (params) => api.get('/admin/products', { params }),
  approveProduct: (id, approved) => api.put(`/admin/products/${id}/approve`, { approved }),
  toggleFeatured: (id) => api.put(`/admin/products/${id}/feature`),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export default api;
