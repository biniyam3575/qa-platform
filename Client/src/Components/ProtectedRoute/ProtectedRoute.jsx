import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if the token exists in localStorage
  const token = localStorage.getItem('token');

  // If there is no token, redirect to the login page
  // 'replace' prevents the user from clicking "back" to the protected page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the token exists, render the child routes (the Outlet)
  return <Outlet />;
};

export default ProtectedRoute;