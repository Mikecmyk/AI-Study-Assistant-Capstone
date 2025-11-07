// frontend/src/components/Auth.js

import React, { useState } from 'react';
import axios from 'axios'; // 1. Import axios

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for error messages
  const [isLoading, setIsLoading] = useState(false); // State for loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // 2. Determine endpoint and action
    const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
    const action = isLogin ? 'Login' : 'Registration';

    try {
        // 3. Make the POST request to Django
        const response = await axios.post(endpoint, {
            username: username,
            password: password,
        });

        // 4. Handle successful response
        const data = response.data;

        if (isLogin) {
            // For login, the API returns { token: "..." }
            const token = data.token;
            // Store the token and update App state
            localStorage.setItem('token', token); // Store token securely
            onAuth({ user: username, token: token }); 

        } else {
            // For registration, automatically log them in or show success message
            // Note: We are just showing a success message for now.
            alert(`Registration successful for ${data.username}! Please log in.`);
            setIsLogin(true); // Switch to login form
        }

    } catch (err) {
        // 5. Handle errors (400, 404, etc.)
        let errorMsg = `${action} failed.`;
        if (err.response && err.response.data) {
            // Try to get a specific error from Django's response body
            errorMsg = JSON.stringify(err.response.data);
        }
        setError(errorMsg);

    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          onClick={() => setIsLogin(!isLogin)}
          style={{ cursor: 'pointer', color: 'blue' }}
        >
          {isLogin ? 'Register' : 'Login'}
        </span>
      </p>
    </div>
  );
}

export default Auth;