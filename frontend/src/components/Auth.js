// frontend/src/components/Auth.js
import React, { useState } from 'react';

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Actual API call logic will go here

    const endpoint = isLogin ? 'api/auth/login/' : 'api/auth/register/';
    const data = { username, password };

    console.log(`Submitting to ${endpoint} with data:`, data);

    // Simulating success for now:
    onAuth({ success: true, user: username, token: 'fake_token_xyz' });
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
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