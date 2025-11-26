import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import api from '../api';
import './Dashboard.css';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => { 
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        const { email, password, confirmPassword } = formData;
        
        if (!email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/register/', {
                email, 
                password, 
                username: email 
            });

            console.log('Register response status:', response.status);
            console.log('Register response data:', response.data);

            const data = response.data;

            setSuccessMessage("Success! Your account is created. Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 1000);

        } catch (error) {
            console.error("Registration attempt failed:", error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 400) {
                    const errorDetail = errorData.email?.[0] || errorData.username?.[0] || errorData.password?.[0];
                    if (errorDetail) {
                        setError(errorDetail);
                    } else if (errorData.detail || errorData.message) {
                        setError(errorData.detail || errorData.message);
                    } else if (errorData.non_field_errors) {
                        setError(errorData.non_field_errors[0]);
                    } else {
                        setError(`Registration failed with status: ${status}`);
                    }
                } else {
                    setError(`Registration failed with status: ${status}`);
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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-form-side">
                    <div className="mobile-brand">
                        <div className="mobile-brand-header">
                            <div className="brand-title">Zonlus</div>
                        </div>
                        <h2>Join Zonlus</h2>
                    </div>

                    <div className="form-container">
                        <h2 className="form-title">Create Account</h2>
                        <p className="form-subtitle">Start your journey to academic success</p>

                        <form onSubmit={handleRegister} className="auth-form">
                            {(error || successMessage) && (
                                <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
                                    {error || successMessage}
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
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="student@university.edu"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Minimum 8 characters"
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

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm Password
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Confirm your password"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? 'Hide' : 'Show'}
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
                                        Creating Account...
                                    </>
                                ) : (
                                    "Start Learning with Zonlus"
                                )}
                            </button>
                            
                            <div className="form-footer">
                                Already have an account?{" "}
                                <Link to="/login" className="auth-link">
                                    Sign in
                                </Link>
                            </div>
                        </form>

                        <div className="terms">
                            <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
                        </div>
                    </div>
                </div>

                <div className="auth-branding">
                    <div>
                        <div className="brand-header">
                            <div className="brand-title">Zonlus</div>
                        </div>
                        
                        <h1 className="brand-main-title">Start Your Learning Journey!</h1>
                        <p className="brand-subtitle">
                            Join thousands of students who are achieving academic excellence with AI-powered study assistance and personalized learning paths.
                        </p>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <span>AI-Powered Study Plans</span>
                            </div>
                            <div className="feature-item">
                                <span>Smart Progress Tracking</span>
                            </div>
                            <div className="feature-item">
                                <span>Personalized Learning Paths</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="testimonial">
                        <p className="testimonial-text">
                            "Zonlus helped me organize my study schedule and track my progress like never before. My grades improved dramatically!"
                        </p>
                        <p className="testimonial-author">- Alex, Engineering Student</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;