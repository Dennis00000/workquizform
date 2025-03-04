import { toast } from 'react-hot-toast';
import { EventBus } from './performance';

/**
 * Handles errors in a consistent way across the application
 * 
 * @param {Error} error - The error object
 * @param {Object} options - Options for error handling
 * @param {string} options.defaultMessage - Default message to show if error doesn't have a message
 * @param {boolean} options.showToast - Whether to show a toast notification (default: true)
 * @param {Function} options.callback - Optional callback to execute after handling the error
 * @returns {Error} - Returns the error for further handling if needed
 */
export const handleError = (error, options = {}) => {
  const {
    defaultMessage = 'An error occurred',
    showToast = true,
    callback
  } = options;

  // Get the error message
  const errorMessage = error?.response?.data?.message || 
                       error?.message || 
                       defaultMessage;
  
  // Log the error to console
  console.error(errorMessage, error);
  
  // Show toast notification if enabled
  if (showToast) {
    toast.error(errorMessage);
  }
  
  // Execute callback if provided
  if (typeof callback === 'function') {
    callback(error);
  }
  
  // Return the error for further handling
  return error;
};

/**
 * Transforms API errors into a consistent format
 * @param {Error} error - Error object from API
 * @returns {Object} - Formatted error object
 */
export function formatApiError(error) {
  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST301':
        return {
          message: 'Resource not found',
          status: 404,
          code: error.code,
          originalError: error
        };
      case 'PGRST302':
        return {
          message: 'Permission denied',
          status: 403,
          code: error.code,
          originalError: error
        };
      case '23505':
        return {
          message: 'Duplicate record',
          status: 409,
          code: error.code,
          originalError: error
        };
      case '23503':
        return {
          message: 'Foreign key violation',
          status: 400,
          code: error.code,
          originalError: error
        };
      default:
        return {
          message: error.message || 'An unknown error occurred',
          status: error.status || 500,
          code: error.code,
          originalError: error
        };
    }
  }
  
  // Handle authentication errors
  if (error?.name === 'AuthError') {
    return {
      message: error.message || 'Authentication error',
      status: 401,
      code: 'AUTH_ERROR',
      originalError: error
    };
  }
  
  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      code: 'NETWORK_ERROR',
      originalError: error
    };
  }
  
  // Handle validation errors
  if (error?.validationErrors) {
    return {
      message: 'Validation error',
      status: 400,
      code: 'VALIDATION_ERROR',
      validationErrors: error.validationErrors,
      originalError: error
    };
  }
  
  // Default error format
  return {
    message: error?.message || 'An unknown error occurred',
    status: error?.status || 500,
    code: error?.code || 'UNKNOWN_ERROR',
    originalError: error
  };
}

/**
 * Handle Supabase errors
 * @param {Error} error - The error object from Supabase
 * @returns {string} Formatted error message
 */
export const handleSupabaseError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Log the error for debugging
  console.error('Supabase error:', error);
  
  // Notify about the error
  EventBus.emit('error', { 
    source: 'supabase', 
    message: error.message,
    code: error.code
  });
  
  // Return user-friendly message based on error code
  if (error.code === 'auth/invalid-email') {
    return 'The email address is invalid.';
  }
  
  if (error.code === 'auth/user-disabled') {
    return 'This user account has been disabled.';
  }
  
  if (error.code === 'auth/user-not-found') {
    return 'No user found with this email address.';
  }
  
  if (error.code === 'auth/wrong-password') {
    return 'Incorrect password.';
  }
  
  if (error.code === 'auth/email-already-in-use' || error.code === '23505') {
    return 'This email is already registered.';
  }
  
  if (error.message && error.message.includes('duplicate key')) {
    return 'This email is already registered.';
  }
  
  if (error.message && error.message.includes('User already registered')) {
    return 'This email is already registered.';
  }
  
  if (error.message && error.message.includes('weak password')) {
    return 'Please use a stronger password. It should be at least 6 characters long.';
  }
  
  if (error.message && error.message.includes('Database error')) {
    return 'There was a problem with our database. Please try again later.';
  }
  
  // Supabase specific errors
  if (error.status === 400) {
    if (error.message.includes('email')) {
      return 'Please provide a valid email address.';
    }
    if (error.message.includes('password')) {
      return 'Please provide a valid password (minimum 6 characters).';
    }
    return 'Invalid request. Please check your information and try again.';
  }
  
  if (error.status === 422) {
    return 'The provided information is invalid. Please check and try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred';
};

/**
 * Handle API errors
 * @param {Error} error - The error object from API call
 * @param {Function} dispatch - Optional Redux dispatch function
 */
export const handleApiError = (error, dispatch = null) => {
  if (!error) {
    toast.error('An unknown error occurred');
    return;
  }
  
  // Log the error for debugging
  console.error('API error:', error);
  
  // Notify about the error
  EventBus.emit('error', { 
    source: 'api', 
    message: error.message,
    status: error.response?.status
  });
  
  // Handle network errors
  if (error.message === 'Network Error') {
    toast.error('Network error. Please check your connection.');
    return;
  }
  
  // Handle server errors
  if (error.response) {
    // Authentication errors
    if (error.response.status === 401) {
      toast.error('Authentication required. Please log in again.');
      // If Redux dispatch provided, logout the user
      if (dispatch) {
        // dispatch(logout());
      }
      return;
    }
    
    // Forbidden errors
    if (error.response.status === 403) {
      toast.error('You do not have permission to perform this action.');
      return;
    }
    
    // Not found errors
    if (error.response.status === 404) {
      toast.error('The requested resource was not found.');
      return;
    }
    
    // Validation errors
    if (error.response.status === 422 && error.response.data.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat();
      errorMessages.forEach(message => toast.error(message));
      return;
    }
    
    // Server errors
    if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
      return;
    }
    
    // Other errors with messages
    if (error.response.data.message) {
      toast.error(error.response.data.message);
      return;
    }
  }
  
  // Fallback error message
  toast.error(error.message || 'An unexpected error occurred');
};

/**
 * Format validation errors into readable messages
 * @param {Object} errors - Validation errors object
 * @returns {Array} Array of error messages
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return [];
  
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    if (Array.isArray(messages)) {
      return [...acc, ...messages.map(msg => `${field}: ${msg}`)];
    }
    return [...acc, `${field}: ${messages}`];
  }, []);
};

/**
 * Check if error is a network error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's a network error
 */
export const isNetworkError = (error) => {
  return error && error.message === 'Network Error';
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's an auth error
 */
export const isAuthError = (error) => {
  return error && error.response && error.response.status === 401;
};

/**
 * Handle error and return user-friendly message
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Supabase specific errors
  if (error.code && error.code.startsWith('auth/')) {
    return handleSupabaseError(error);
  }
  
  // Network errors
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  
  // API response errors
  if (error.response) {
    if (error.response.status === 401) return 'Authentication required. Please log in again.';
    if (error.response.status === 403) return 'You do not have permission to perform this action.';
    if (error.response.status === 404) return 'The requested resource was not found.';
    
    if (error.response.status === 422 && error.response.data.errors) {
      return formatValidationErrors(error.response.data.errors).join('. ');
    }
    
    if (error.response.status >= 500) return 'Server error. Please try again later.';
    
    if (error.response.data.message) return error.response.data.message;
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred';
};

const errorHandler = {
  handleSupabaseError,
  handleApiError,
  getErrorMessage,
  formatValidationErrors,
  isNetworkError,
  isAuthError
};

export default errorHandler; 