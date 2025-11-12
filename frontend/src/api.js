// frontend/src/api.js

import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
    baseURL: '/', // Uses the proxy setting in package.json
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: This runs BEFORE every API request
api.interceptors.request.use(
    (config) => {
        // Get the token from local storage
        const token = localStorage.getItem('token');
        
        // If a token exists, attach it to the Authorization header
        if (token) {
            // CRITICAL: Ensure 'Token ' includes a space
            config.headers.Authorization = `Token ${token}`;
        }
        
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

export default api;