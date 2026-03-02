import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

export const flightsAPI = {
  search: (params) => api.get('/flights/search', { params }),
  searchAirports: (keyword) => api.get('/flights/airports', { params: { keyword } })
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByReference: (ref) => api.get(`/bookings/reference/${ref}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`)
};

export const paymentsAPI = {
  initialize: (bookingId) => api.post('/payments/initialize', { bookingId }),
  verify: (reference) => api.get(`/payments/verify/${reference}`)
};

export default api;
