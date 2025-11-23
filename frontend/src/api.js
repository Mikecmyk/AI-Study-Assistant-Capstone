// src/api.js (ENHANCED VERSION)
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Your Django API base URL
    timeout: 30000, // 30 second timeout for file uploads
});

// Request Interceptor for Authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Set the Authorization header for every request
            config.headers.Authorization = `Token ${token}`;
        }
        
        // Important: Don't set Content-Type for FormData (browser will set it with boundary)
        if (config.data instanceof FormData) {
            console.log('📤 File upload detected, removing Content-Type header');
            delete config.headers['Content-Type'];
        } else {
            // For regular JSON requests, ensure Content-Type is set
            config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        }
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor for Error Handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        
        // Handle specific error cases
        if (error.response?.status === 401) {
            console.warn('⚠️ Authentication failed, redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // You might want to redirect to login page here
            // window.location.href = '/login';
        }
        
        if (error.response?.status === 500) {
            console.error('🔥 Server error occurred');
        }
        
        return Promise.reject(error);
    }
);

export default api;