import React, { useState } from 'react';
import { Link } from "react-router-dom";
import './auth.css'; // IMPORT THE NEW CSS

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); 

    const handleLogin = async (e) => { 
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError("Please enter both an email and a password.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/login/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn("Could not parse response as JSON.");
            }

            console.log('Login response status:', response.status);
            console.log('Login response data:', data);

            if (!response.ok) {
                let errorMessage = `Login failed (Status: ${response.status}).`;
                
                if (response.status === 401) {
                    errorMessage = "Invalid credentials. Please try again.";
                } else if (response.status === 400 && data.non_field_errors) {
                    errorMessage = data.non_field_errors[0];
                } else {
                    errorMessage = data.detail || data.message || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            const authToken = data.token || data.key;

            if (!authToken) {
                throw new Error("No authentication token received from server");
            }

            localStorage.setItem('token', authToken);
            if (onLoginSuccess) {
                onLoginSuccess(authToken);
            }

        } catch (error) {
            console.error("Login attempt failed:", error.message);
            setError(error.message);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Branding Side */}
                <div className="auth-branding">
                    <div>
                        <div className="brand-header">
                            <div className="brand-icon">🧠</div>
                            <div className="brand-title">StudyFlow</div>
                        </div>
                        
                        <h1 className="brand-main-title">Welcome Back, Scholar!</h1>
                        <p className="brand-subtitle">
                            Continue your learning journey with personalized study plans, AI-powered tools, and progress tracking.
                        </p>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🎯</div>
                                <span>Smart Study Planning</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">⚡</div>
                                <span>AI-Powered Tools</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📚</div>
                                <span>Progress Tracking</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="testimonial">
                        <p className="testimonial-text">
                            "StudyFlow helped me organize my learning and achieve my goals faster than ever before."
                        </p>
                        <p className="testimonial-author">- Sarah, Computer Science Student</p>
                    </div>
                </div>

                {/* Form Side */}
                <div className="auth-form-side">
                    {/* Mobile Branding */}
                    <div className="mobile-brand">
                        <div className="mobile-brand-header">
                            <div className="brand-icon">🧠</div>
                            <div className="mobile-brand-title">StudyFlow</div>
                        </div>
                        <h2>Welcome Back!</h2>
                    </div>

                    <div className="form-container">
                        <h2 className="form-title">Sign In</h2>
                        <p className="form-subtitle">Enter your credentials to access your dashboard</p>

                        <form onSubmit={handleLogin} className="auth-form">
                            {error && (
                                <div className="alert alert-error">
                                    {error}
                                </div>
                            )}
                            
                            {/* Email Input */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address
                                </label>
                                <div className="input-wrapper">
                                    <div className="input-icon">📧</div>
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

                            {/* Password Input */}
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
                                    <div className="input-icon">🔒</div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
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
                                    "Sign In to Your Dashboard"
                                )}
                            </button>
                            
                            <div className="form-footer">
                                Don't have an account?{" "}
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