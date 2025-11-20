import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
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
            const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username: email }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (jsonError) {
                console.warn("Could not parse response as JSON.");
            }

            console.log('Register response status:', response.status);
            console.log('Register response data:', data);

            if (!response.ok) {
                let errorMessage = 'Registration failed due to server error.';
                
                if (response.status === 400) {
                    const errorDetail = data.email?.[0] || data.username?.[0] || data.password?.[0];
                    if (errorDetail) {
                        errorMessage = errorDetail;
                    } else if (data.detail || data.message) {
                        errorMessage = data.detail || data.message;
                    } else if (data.non_field_errors) {
                        errorMessage = data.non_field_errors[0];
                    } else {
                        errorMessage = `Registration failed with status: ${response.status}`;
                    }
                } else {
                     errorMessage = `Registration failed with status: ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }

            setSuccessMessage("🎉 Success! Your account has been created. Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 2000); 

        } catch (error) {
            console.error("Registration attempt failed:", error.message);
            setError(error.message);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Form Side */}
                <div className="auth-form-side">
                    {/* Mobile Branding */}
                    <div className="mobile-brand">
                        <div className="mobile-brand-header">
                            <div className="brand-icon">🎓</div>
                            <div className="mobile-brand-title">Zonlus</div>
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
                                    <div className="input-icon">📧</div>
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
                                    <div className="input-icon">🔒</div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="•••••••• (min 8 characters)"
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

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm Password
                                </label>
                                <div className="input-wrapper">
                                    <div className="input-icon">🔒</div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
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

                {/* Branding Side */}
                <div className="auth-branding">
                    <div>
                        <div className="brand-header">
                            <div className="brand-icon">🎓</div>
                            <div className="brand-title">Zonlus</div>
                        </div>
                        
                        <h1 className="brand-main-title">Start Your Learning Journey!</h1>
                        <p className="brand-subtitle">
                            Join thousands of students who are achieving academic excellence with AI-powered study assistance and personalized learning paths.
                        </p>
                        
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🚀</div>
                                <span>AI-Powered Study Plans</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📊</div>
                                <span>Smart Progress Tracking</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🎯</div>
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