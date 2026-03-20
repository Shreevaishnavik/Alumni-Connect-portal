import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <div>Access denied</div>;
  return children;
};

export default ProtectedRoute;
