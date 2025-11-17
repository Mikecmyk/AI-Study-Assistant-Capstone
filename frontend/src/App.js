// src/App.js (Fully Updated with Authentication and Dynamic State)

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard"; // The Learner Dashboard
import AdminDashboard from "./Admin/AdminDashboard"; // Corrected path
import Login from "./components/Login"; // Ensure this component is created!
import "./App.css";

// --- AUTHENTICATION CONTEXT/HOOK ---
const useAuth = () => {
    // 1. Get the initial token state from local storage
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // We infer login status from the presence of a token
    const isLoggedIn = !!token;
    
    // Placeholder for Admin check (Needs refinement in a real app)
    const isAdmin = isLoggedIn; // For simple logic: if logged in, you can access admin route

    const logout = () => {
        localStorage.removeItem('token');
        // Force state update to re-render the app, triggering a redirect to /login
        setToken(null); 
    };

    return { isLoggedIn, isAdmin, logout, setToken };
};

// --- Component to Protect Routes ---
// Note: If you have not created 'Login.js' yet, you must do so, or this will fail.
const ProtectedRoute = ({ children, isAdminRequired }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        return <Navigate to="/login" replace />; 
    }
    
    if (isAdminRequired && !isAdmin) {
        // Redirect non-admins to the dashboard
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    const { isLoggedIn, setToken } = useAuth();

    // Handler for successful login: stores the token and redirects to the dashboard
    const handleLoginSuccess = (newToken) => {
        // The Login component handles setting the token in localStorage,
        // we just need to update the state here to trigger a re-render.
        setToken(newToken); 
        window.location.href = '/'; // Redirect to the main dashboard
    };

    return (
        <Router>
            <Routes>
                
                {/* 1. LOGIN ROUTE (Public) */}
                <Route 
                    path="/login" 
                    // If the user is already logged in, redirect them away from the login page
                    element={isLoggedIn ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
                />

                {/* 2. PROTECTED LEARNER DASHBOARD ROUTE (Default) */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Dashboard logout={useAuth().logout} />
                        </ProtectedRoute>
                    } 
                />
                
                {/* 3. PROTECTED ADMIN DASHBOARD ROUTE */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute isAdminRequired={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Fallback route: catch all other paths and redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />


            </Routes>
        </Router>
    );
}

export default App;