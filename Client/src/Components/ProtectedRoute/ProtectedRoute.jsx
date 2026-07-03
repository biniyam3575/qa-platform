import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If there is no valid token, redirect to login page
  // We pass 'state: { from: location }' to remember where they came from
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children outlets seamlessly
  return <Outlet />;
};

export default ProtectedRoute;