// App.js (Updated with Admin and Learner Routing)

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard"; // The Learner Dashboard
import AdminDashboard from "./Admin/AdminDashboard"; // Corrected path // The new Admin Container // The new Admin Container
import "./App.css";

// --- Mock Authentication and Authorization Context/Hooks ---
// In a real application, you would use React Context or Redux/Zustand here.
const useAuth = () => {
    // For now, hardcode these values for testing:
    const isLoggedIn = true; // Assume the user is logged in
    const isAdmin = true;     // Assume the user is an Admin
    return { isLoggedIn, isAdmin };
};

// --- Component to Protect Routes ---
const ProtectedRoute = ({ children, isAdminRequired }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    
    // Check if the user is logged in
    if (!isLoggedIn) {
        // Redirect to login page if not logged in
        return <Navigate to="/login" replace />; 
    }
    
    // Check if admin role is required and if the user has it
    if (isAdminRequired && !isAdmin) {
        // Redirect non-admins to the dashboard or an unauthorized page
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
  return (
    <Router>
      <Routes>
        
        {/* 1. LEARNER DASHBOARD ROUTE (Public/Default) */}
        <Route 
          path="/" 
          element={<Dashboard />} 
        />
        
        {/* 2. ADMIN DASHBOARD ROUTE (Protected) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isAdminRequired={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 3. Placeholder for Login/Auth Routes */}
        <Route path="/login" element={<div>Login Page</div>} />
        {/* You'll add other routes like /register, /profile, etc. here */}

      </Routes>
    </Router>
  );
}

export default App;