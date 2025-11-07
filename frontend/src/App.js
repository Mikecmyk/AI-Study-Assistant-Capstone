// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import './App.css'; 
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); // Optional, helpful for display
    
    if (token && storedUser) {
        // Here you could make a quick API call to verify the token is still valid
        // For simplicity, we assume the token is valid if it exists.
        setIsAuthenticated(true);
        setUser(storedUser);
    }
  }, []);
  
  const handleAuthSuccess = (authData) => {
    
    console.log("Authentication successful! Data:", authData);
    localStorage.setItem('user', authData.user);
    
    
    setIsAuthenticated(true);
    setUser(authData.user);
    
    
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');


    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Study Assistant</h1>
        {user && (
          <div className="user-info">
            Welcome, {user}! 
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {!isAuthenticated ? (
          
          <Auth onAuth={handleAuthSuccess} />
        ) : (
          
          <Dashboard />
        )}
      </main>
    </div>
  );
}

export default App;