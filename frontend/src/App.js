// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Courses from './components/Courses';
import Dashboard from './components/Dashboard';
import AdminDashboard from './Admin/AdminDashboard';
import LandingPage from './components/LandingPage'; // Add this import

// =================================================================
// 1. COMPONENTS
// =================================================================

// --- Login Component ---

// Add this at the top of your App.js
console.log('Frontend Environment Variables:', {
  API_URL: process.env.REACT_APP_API_URL,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  NODE_ENV: process.env.NODE_ENV
});

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                console.warn("Could not parse response as JSON. Treating as non-structured error.");
            }

            console.log('Login response status:', response.status);
            console.log('Login response data:', data);

            if (!response.ok) {
                let errorMessage = `Login failed (Status: ${response.status}).`;
                
                if (response.status === 401) {
                    errorMessage = "Invalid credentials. Please try again.";
                } else if (response.status === 400 && data.non_field_errors) {
                    errorMessage = data.non_field_errors[0];
                } else if (data.email) {
                    errorMessage = data.email[0];
                } else if (data.username) {
                    errorMessage = data.username[0];
                } else if (data.password) {
                    errorMessage = data.password[0];
                } else {
                    errorMessage = data.detail || data.message || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            // SUCCESS PATH
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 shadow-2xl rounded-xl">
                <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
                    StudyFlow Login
                </h1>
                <p className="text-center text-sm text-gray-500 mb-8">
                    Enter your email and password to access the dashboard.
                </p>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="user@example.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-200 ${
                            isLoading 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:bg-indigo-800'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging In...
                            </div>
                        ) : (
                            <span className='flex items-center'>Sign In</span>
                        )}
                    </button>
                    
                    <div className="text-center text-sm mt-4">
                        Don't have an account? 
                        <a 
                            href="/register" 
                            className="text-indigo-600 hover:text-indigo-500 font-medium ml-1"
                        >
                            Sign Up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Register Component ---
function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); 
    const [successMessage, setSuccessMessage] = useState('');
    
    // Initialize useNavigate hook - FIXED
    const navigate = useNavigate();

    const handleRegister = async (e) => { 
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (!email || !password) {
            setError("Please enter both an email and a password.");
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
                console.warn("Could not parse response as JSON. Treating as non-structured error.");
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

            setSuccessMessage("Success! Your account is created. Redirecting to login...");
            
            setTimeout(() => {
                navigate('/login');
            }, 1000); 

        } catch (error) {
            console.error("Registration attempt failed:", error.message);
            setError(error.message);
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 shadow-2xl rounded-xl">
                <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">
                    StudyFlow Register
                </h1>
                <p className="text-center text-sm text-gray-500 mb-8">
                    Create an account to begin using the study planner.
                </p>

                <form onSubmit={handleRegister} className="space-y-6">
                    {(error || successMessage) && (
                        <div className={`p-3 border rounded-lg text-sm ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                            {error || successMessage}
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address (will be used as Username)
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="user@example.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            placeholder="•••••••• (min 8 chars)"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white transition duration-200 ${
                            isLoading 
                                ? 'bg-indigo-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:bg-indigo-800'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </div>
                        ) : (
                            <span className='flex items-center'>Sign Up</span>
                        )}
                    </button>
                    
                    <div className="text-center text-sm">
                        Already have an account? 
                        <a 
                            href="/login" 
                            className="text-indigo-600 hover:text-indigo-500 font-medium ml-1"
                        >
                            Sign In
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =================================================================
// 2. AUTH HOOK & PROTECTED ROUTE
// =================================================================

// --- AUTHENTICATION CONTEXT/HOOK ---
const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && storedToken !== token) {
             setToken(storedToken);
        }
    }, [token]);

    const isLoggedIn = !!token;
    const isAdmin = isLoggedIn; 

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null); 
    };

    return { isLoggedIn, isAdmin, logout, setToken };
};

// --- Component to Protect Routes ---
const ProtectedRoute = ({ children, isAdminRequired }) => {
    const { isLoggedIn, isAdmin } = useAuth(); 

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />; 
    }
    
    if (isAdminRequired && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// =================================================================
// 3. MAIN APP COMPONENT
// =================================================================

function App() {
    const { isLoggedIn, setToken, logout } = useAuth();

    const handleLoginSuccess = (newToken) => {
        setToken(newToken); 
    };

    return (
        <Router>
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route 
                    path="/" 
                    element={<LandingPage />} 
                />
                <Route 
                    path="/login" 
                    element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
                />
                <Route 
                    path="/register" 
                    element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Register />} 
                />
                
                {/* PROTECTED ROUTES */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard logout={logout} /> 
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/courses" 
                    element={
                        <ProtectedRoute>
                            <Courses />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute isAdminRequired={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;