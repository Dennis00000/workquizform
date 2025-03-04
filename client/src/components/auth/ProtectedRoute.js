import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../ui/LoadingSpinner';

// Consolidated from multiple route protection components
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, // Optional role requirement
  redirectTo = '/login' 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('ProtectedRoute - Current path:', location.pathname);
    console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading });
    console.log('ProtectedRoute - User:', user);
    
    if (requiredRole) {
      console.log('ProtectedRoute - Required role:', requiredRole);
      console.log('ProtectedRoute - User role:', user?.role);
    }
  }, [location.pathname, isAuthenticated, loading, user, requiredRole]);

  if (loading) {
    console.log('ProtectedRoute - Still loading auth state');
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text={t('common.loading') || 'Loading...'} />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - User not authenticated, redirecting to login');
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user && user.role !== requiredRole) {
    console.log(`ProtectedRoute - User does not have required role: ${requiredRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute; 