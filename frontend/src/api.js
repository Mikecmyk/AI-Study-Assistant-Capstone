// frontend/src/api.js
import axios from 'axios';

// Directly connect React to Django backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // 👈 full backend API base
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`; // ✅ DRF Token Auth format
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
