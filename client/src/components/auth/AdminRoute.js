import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * A wrapper for routes that require admin privileges
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('AdminRoute - Current path:', location.pathname);
    console.log('AdminRoute - Auth state:', { user, loading });
    console.log('AdminRoute - User role:', user?.role);
  }, [location.pathname, user, loading]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    console.log('AdminRoute - Still loading auth state');
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!user) {
    console.log('AdminRoute - No user found, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  if (user.role !== 'admin') {
    console.log('AdminRoute - User is not an admin, redirecting to home');
    console.log('AdminRoute - User role:', user.role);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render children if authenticated and admin
  console.log('AdminRoute - Access granted for admin');
  return children;
};

export default AdminRoute; 