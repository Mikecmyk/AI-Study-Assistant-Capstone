import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, BookOpen, Brain, Target, Zap } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Left Side - Form */}
                <div className="p-12 flex flex-col justify-center order-2 lg:order-1">
                    <div className="lg:hidden mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <Brain className="h-8 w-8 text-indigo-600" />
                            <span className="text-2xl font-bold text-gray-800">StudyFlow</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Join StudyFlow</h2>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-gray-600 mb-8">Start your personalized learning journey today</p>

                        <form onSubmit={handleRegister} className="space-y-6">
                            {(error || successMessage) && (
                                <div className={`p-4 rounded-xl text-sm ${
                                    error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
                                }`}>
                                    {error || successMessage}
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
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                        placeholder="student@university.edu"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                        placeholder="•••••••• (min 8 characters)"
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

                            {/* Confirm Password Input */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                                        Creating Account...
                                    </div>
                                ) : (
                                    "Create Your StudyFlow Account"
                                )}
                            </button>
                            
                            <div className="text-center text-sm text-gray-600">
                                Already have an account?{" "}
                                <Link 
                                    to="/login" 
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                By creating an account, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Branding */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white hidden lg:flex flex-col justify-between order-1 lg:order-2">
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <Brain className="h-8 w-8" />
                            <span className="text-2xl font-bold">StudyFlow</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold mb-6">Start Your Learning Journey!</h1>
                        <p className="text-indigo-100 text-lg mb-8">
                            Join thousands of students who are achieving their academic goals with AI-powered study assistance.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Target className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">Personalized Study Plans</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Zap className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">Smart Progress Tracking</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-5 w-5 text-indigo-200" />
                                <span className="text-indigo-100">AI Study Tools</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-indigo-100 text-sm">
                            "The AI study planner helped me improve my grades by 30% in just one semester!"
                        </p>
                        <p className="text-indigo-200 text-xs mt-2">- Alex, Engineering Student</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;