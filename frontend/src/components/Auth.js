import React, { useState } from 'react';
import api from '../api';

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // CRITICAL FIX: We must prepend '/api/' to match Django's URL configuration
    const endpoint = isLogin ? '/api/auth/login/' : '/api/auth/register/';
    const action = isLogin ? 'Login' : 'Registration';

    try {
      // The API call now uses the correct, full path: /api/auth/login/
      const response = await api.post(endpoint, { username, password });
      const data = response.data;

      if (isLogin) {
        const token = data.token;
        localStorage.setItem('token', token);
        onAuth({ user: username, token });
      } else {
        // Use custom alert/modal instead of JS alert
        console.log(`Registration successful for ${data.username}! Please log in.`);
        setIsLogin(true);
      }

    } catch (err) {
      let errorMsg = `${action} failed.`;
      if (err.response && err.response.data) {
        // Attempt to extract a more readable error message
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