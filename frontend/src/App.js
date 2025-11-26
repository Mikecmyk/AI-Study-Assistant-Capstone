import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Courses from './components/Courses';
import Dashboard from './components/Dashboard';
import AdminDashboard from './Admin/AdminDashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';

console.log('Frontend Environment Variables:', {
  API_URL: process.env.REACT_APP_API_URL,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  NODE_ENV: process.env.NODE_ENV
});

// Role checking utility
const getUserRole = () => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.is_staff ? 'admin' : 'user';
  } catch (e) {
    return 'user';
  }
};

const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(getUserRole());
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && storedToken !== token) {
            setToken(storedToken);
        }
        
        // Update user role when token changes
        setUserRole(getUserRole());
    }, [token]);

    const isLoggedIn = !!token;
    const isAdmin = userRole === 'admin';

    const logout = () => {
        const userId = localStorage.getItem('currentUserId') || 'anonymous';
        
        const userKeys = [
            `temporaryTopics_${userId}`,
            `studyHistory_${userId}`,
            `calendarTasks_${userId}`,
            `studyEvents_${userId}`,
            `studyProgress_${userId}`
        ];
        
        userKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('temporaryTopics');
        localStorage.removeItem('currentUserId');
        
        setToken(null);
        setUserRole(null);
    };

    return { isLoggedIn, isAdmin, logout, setToken };
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    if (!adminOnly && isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

// Role-based redirect component
const RoleBasedRedirect = () => {
    const { isLoggedIn, isAdmin } = useAuth();
    
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/dashboard" replace />;
};

function App() {
    const { isLoggedIn, isAdmin, setToken, logout } = useAuth();

    const handleLoginSuccess = (userData) => {
        // Store the complete user data including role information
        localStorage.setItem('user', JSON.stringify(userData));
        
        const authToken = userData.token;
        if (authToken) {
            setToken(authToken);
        }
    };

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={isLoggedIn ? <RoleBasedRedirect /> : <LandingPage />} 
                />
                <Route 
                    path="/login" 
                    element={isLoggedIn ? <RoleBasedRedirect /> : <Login onLoginSuccess={handleLoginSuccess} />} 
                />
                <Route 
                    path="/register" 
                    element={isLoggedIn ? <RoleBasedRedirect /> : <Register />} 
                />
                
                {/* User Routes - Only accessible to regular users */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute adminOnly={false}>
                            <Dashboard logout={logout} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/courses" 
                    element={
                        <ProtectedRoute adminOnly={false}>
                            <Courses />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Admin Routes - Only accessible to admin users */}
                <Route 
                    path="/admin/*" 
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Fallback routes */}
                <Route path="/unauthorized" element={
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                        <h2>Access Denied</h2>
                        <p>You don't have permission to access this page.</p>
                    </div>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;