// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text)' }}>Loading...</div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default ProtectedRoute;
