// frontend/src/App.js

import React, { useState } from 'react';
import './App.css'; 
import Auth from './components/Auth'; 

function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  
  const handleAuthSuccess = (authData) => {
    
    console.log("Authentication successful! Data:", authData);
    
    
    setIsAuthenticated(true);
    setUser(authData.user);
    
    
  };

  const handleLogout = () => {
    
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
          
          <div>
            <h2>Welcome to your Dashboard, {user}!</h2>
            <p>Here you will generate your study plans and review history.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;