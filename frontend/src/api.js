// frontend/src/api.js
import axios from 'axios';

// Axios instance
const api = axios.create({
  baseURL: '/', // Proxy will forward /api to Django
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // if you use cookies
});

// Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`; // Note the space after Token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
