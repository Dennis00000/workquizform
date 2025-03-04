import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

/**
 * Standard error handler for component operations
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default message to show if error doesn't have one
 * @param {boolean} showToast - Whether to show a toast notification
 */
export const handleComponentError = (error, defaultMessage = 'An error occurred', showToast = true) => {
  console.error(error);
  const message = error.message || defaultMessage;
  
  if (showToast) {
    toast.error(message);
  }
  
  return message;
};

/**
 * Helper to create standard component prop types
 * Centralizes common prop types used across components
 */
export const propTypes = {
  // Common types
  string: PropTypes.string,
  number: PropTypes.number,
  bool: PropTypes.bool,
  func: PropTypes.func,
  array: PropTypes.array,
  object: PropTypes.object,
  node: PropTypes.node,
  element: PropTypes.element,
  
  // Specific object shapes
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string
  }),
  
  template: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    questions: PropTypes.array,
    user_id: PropTypes.string,
    created_at: PropTypes.string,
    updated_at: PropTypes.string,
    is_public: PropTypes.bool
  })
}; 