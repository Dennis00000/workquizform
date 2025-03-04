import React from 'react';
import PropTypes from 'prop-types';

/**
 * Spinner Component
 * Displays a loading spinner with customizable size and color
 */
const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  label = 'Loading...'
}) => {
  // Size classes
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  // Color classes
  const colorMap = {
    primary: 'text-indigo-600 dark:text-indigo-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
    black: 'text-black dark:text-white',
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  };
  
  return (
    <div className={`inline-flex items-center ${className}`} role="status" aria-label={label}>
      <svg 
        className={`animate-spin ${sizeMap[size]} ${colorMap[color]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

Spinner.propTypes = {
  /** Size of the spinner */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  /** Color of the spinner */
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'black', 'success', 'danger', 'warning', 'info']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessible label for screen readers */
  label: PropTypes.string
};

export default Spinner; 