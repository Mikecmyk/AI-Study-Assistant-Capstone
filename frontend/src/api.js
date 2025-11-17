// src/api.js (Update this file)

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Your Django API base URL
});

// --- ADD: Request Interceptor for Authentication ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the Authorization header for every request
            config.headers.Authorization = `Token ${token}`;
            // NOTE: If you are using JWT, the format might be: `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// ----------------------------------------------------

export default api;