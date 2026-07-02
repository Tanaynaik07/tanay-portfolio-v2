// src/pages/AdminLogin.jsx
import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Admin.css';


const AdminLogin = () => {
  const { login, isAdmin, user } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      await login();
      navigate('/admin');
    } catch (err) {
      setError('Sign-in failed. Try again.');
    }
  };

 useEffect(() => {
  if (isAdmin) {
    navigate('/admin');
  }
}, [isAdmin, navigate]);

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <span className="eyebrow">Restricted</span>
        <h2>Admin Login</h2>
        <button onClick={handleLogin} className="btn-primary admin-google-btn">
          Sign in with Google
        </button>
        {user && !isAdmin && (
          <p className="admin-error">Signed in as {user.email}, but this account isn't authorized.</p>
        )}
        {error && <p className="admin-error">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
