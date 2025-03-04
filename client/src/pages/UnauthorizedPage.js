import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <svg 
            className="mx-auto h-16 w-16 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            Access Denied
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {user ? (
            <>
              You don't have permission to access this page. 
              This area requires additional privileges.
            </>
          ) : (
            <>
              Please log in to access this page.
            </>
          )}
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link
            to="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center"
          >
            Return to Home
          </Link>
          
          {!user && (
            <Link
              to="/login"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-center"
            >
              Log In
            </Link>
          )}
          
          {user && user.role !== 'admin' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-200 rounded">
              <p className="text-sm">
                <strong>Current Role:</strong> {user.role || 'user'}
              </p>
              <p className="text-sm mt-1">
                If you believe you should have access to this page, please contact an administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 