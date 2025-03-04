import { useState, useCallback, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for making API calls with authentication and error handling
 * @param {Function} apiFunc - The API function to call
 * @returns {Object} - The API call state and function
 */
const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get the auth context for tokens
  const { user } = useAuth();
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);
  
  return {
    data,
    error,
    loading,
    execute
  };
};

export default useApi; 