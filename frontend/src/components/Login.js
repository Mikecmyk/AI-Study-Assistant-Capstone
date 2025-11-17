// src/components/Login.js

import React, { useState } from 'react';
import api from '../api';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Adjust the endpoint if your backend uses a different path (e.g., /api/token/)
            const response = await api.post('/login/', { username, password });
            
            // Assuming your Django backend returns a token (e.g., token or access)
            const token = response.data.token || response.data.access; 
            
            if (token) {
                // Store token in local storage
                localStorage.setItem('token', token);
                // Execute the success callback provided by App.js (to re-route)
                onLoginSuccess();
            } else {
                throw new Error("Login failed: No token received.");
            }
        } catch (err) {
            console.error("Login Error:", err.response?.data || err);
            setError(err.response?.data?.detail || "Invalid username or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-header">Welcome Back</h2>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <p className="error-message">{error}</p>}
                
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                <button type="submit" disabled={isLoading} className="action-button">
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
        </div>
    );
};

export default Login;