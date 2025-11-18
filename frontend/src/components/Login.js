import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, BookOpen, Brain, Target, Zap } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side - Branding */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white hidden lg:flex flex-col justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <Brain className="h-8 w-8" />
                            <span className="text-2xl font-bold">StudyFlow</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold mb-6">Welcome Back, Scholar!</h1>
                        <p className="text-indigo-100 text-lg mb-8">
                            Continue your learning journey with personalized study plans, AI-powered tools, and progress tracking.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Target className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">Smart Study Planning</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Zap className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">AI-Powered Tools</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">Progress Tracking</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-100 text-sm">
                            "StudyFlow helped me organize my learning and achieve my goals faster than ever before."
                        </p>
                        <p className="text-indigo-200 text-xs mt-2">- Sarah, Computer Science Student</p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="p-12 flex flex-col justify-center">
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <Brain className="h-8 w-8 text-indigo-600" />
                            <span className="text-2xl font-bold text-gray-800">StudyFlow</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                        <p className="text-gray-600 mb-8">Enter your credentials to access your dashboard</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {error}
                                </div>
                            )}
                            
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                        placeholder="student@university.edu"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In to Your Dashboard"
                                )}
                            </button>
                            
                            <div className="text-center text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link 
                                    to="/register" 
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200"
                                >
                                    Create account
                                </Link>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;