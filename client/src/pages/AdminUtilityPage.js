import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminUtilityPage = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    // Set the current user ID as default
    if (user) {
      setUserId(user.id);
      setUserRole(user.role || 'user');
      console.log('Current user:', user);
    }
    
    // Check if current user is admin
    const checkAdmin = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Checking admin status...');
        const adminStatus = await adminService.checkAdminStatus();
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to check admin status: ' + (err.message || 'Unknown error'));
        toast.error('Failed to check admin status');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [user]);
  
  const handleMakeAdmin = async () => {
    if (!userId) {
      toast.error('Please enter a user ID');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    try {
      console.log('Updating user role to admin for:', userId);
      const updatedUser = await adminService.updateUserRole(userId, 'admin');
      console.log('User role updated:', updatedUser);
      toast.success(`User ${updatedUser.id} is now an admin!`);
      
      // If the current user was updated, refresh the page to update the UI
      if (user && userId === user.id) {
        toast.success('Your role has been updated. Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Error making user admin:', err);
      setError('Failed to update user role: ' + (err.message || 'Unknown error'));
      toast.error(err.message || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Utility</h1>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <p className="text-center">Loading admin status...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Utility</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
        <div className="mb-4">
          <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
          <p>
            <strong>Role:</strong>{' '}
            <span className={userRole === 'admin' ? 'text-green-600 font-bold' : ''}>
              {userRole || 'N/A'}
            </span>
          </p>
          <p>
            <strong>Admin Status:</strong>{' '}
            <span className={isAdmin ? 'text-green-600 font-bold' : 'text-red-600'}>
              {isAdmin ? 'Is Admin' : 'Not Admin'}
            </span>
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Make User Admin</h2>
        <div className="mb-4">
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            User ID
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter user ID"
            disabled={actionLoading}
          />
        </div>
        
        <button
          onClick={handleMakeAdmin}
          disabled={actionLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {actionLoading ? 'Processing...' : 'Make Admin'}
        </button>
      </div>
      
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-700 dark:text-yellow-200">
          <strong>Note:</strong> This utility page is for testing purposes only. In a production environment, 
          you would want to implement proper role management with additional security measures.
        </p>
      </div>
    </div>
  );
};

export default AdminUtilityPage; 