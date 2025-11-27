import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import './Dashboard.css';

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => { 
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError("Please enter both an email and a password.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/login/', { 
                email: email, 
                password: password 
            });

            console.log('Login response status:', response.status);
            console.log('Login response data:', response.data);

            const data = response.data;
            const authToken = data.token;
            
            if (!authToken) {
                throw new Error("No authentication token received from server");
            }

            // Create complete user data object with role information
            const userData = {
                token: authToken,
                id: data.user_id,
                email: data.email,
                username: data.username,
                is_staff: data.is_staff || false,
                is_superuser: data.is_superuser || false
            };

            // Store token and user data
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Call the success handler with complete user data
            if (onLoginSuccess) {
                onLoginSuccess(userData);
            }

        } catch (error) {
            console.error("Login attempt failed:", error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401) {
                    setError("Invalid credentials. Please try again.");
                } else if (status === 400 && errorData.non_field_errors) {
                    setError(errorData.non_field_errors[0]);
                } else if (status === 400 && errorData.error) {
                    setError(errorData.error);
                } else {
                    setError(errorData.detail || errorData.message || `Login failed (Status: ${status})`);
                }
            } else if (error.request) {
                setError("Cannot connect to server. Please check your connection.");
            } else {
                setError(error.message || "An unexpected error occurred");
            }
        } finally {
            setIsLoading(false); 
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-branding">
                    <div>
                        <div className="brand-header">
                            <div className="brand-title">Zonlus</div>
                        </div>
                        
                        <h1 className="brand-main-title">Welcome Back</h1>
                        <p className="brand-subtitle">
                            Continue your journey to academic excellence with AI-powered study tools and personalized learning paths.
                        </p>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <span>AI-Powered Study Plans</span>
                            </div>
                            <div className="feature-item">
                                <span>Smart Progress Tracking</span>
                            </div>
                            <div className="feature-item">
                                <span>Personalized Learning</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="testimonial">
                        <p className="testimonial-text">
                            "Zonlus transformed how I study! The AI-generated plans helped me improve my grades significantly in just one semester."
                        </p>
                        <p className="testimonial-author">- Sarah, Medical Student</p>
                    </div>
                </div>

                <div className="auth-form-side">
                    {/* ADDED HOME BUTTON */}
                    <div className="auth-header-actions">
                        <button 
                            onClick={handleGoHome}
                            className="home-button"
                        >
                             Back to Home
                        </button>
                    </div>

                    <div className="mobile-brand">
                        <div className="mobile-brand-header">
                            <div className="mobile-brand-title">Zonlus</div>
                        </div>
                        <h2>Welcome Back</h2>
                    </div>

                    <div className="form-container">
                        <h2 className="form-title">Sign In</h2>
                        <p className="form-subtitle">Enter your credentials to continue your learning journey</p>

                        <form onSubmit={handleLogin} className="auth-form">
                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input"
                                        placeholder="student@university.edu"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="form-label-row">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="forgot-link">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="submit-button"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Signing In...
                                    </>
                                ) : (
                                    "Access My Dashboard"
                                )}
                            </button>
                            
                            <div className="form-footer">
                                New to Zonlus?{" "}
                                <Link to="/register" className="auth-link">
                                    Create account
                                </Link>
                            </div>
                        </form>

                        <div className="terms">
                            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;