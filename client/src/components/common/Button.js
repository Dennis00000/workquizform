import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Reusable Button component that can be rendered as a button or link
 * Supports various sizes, variants, states, and icons
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  to = null,
  onClick,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  tooltip = '',
  ariaLabel = '',
  as: Component = null,
  ...rest
}) => {
  // Style classes based on variant
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-900 focus:ring-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400',
    info: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400',
    outline: 'bg-transparent border border-gray-400 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    link: 'bg-transparent text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:underline',
    text: 'bg-transparent text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
    xl: 'px-6 py-3.5 text-base'
  };
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  // Full class set
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  // Loading spinner
  const loadingSpinner = (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Content with icon
  const content = (
    <>
      {loading && loadingSpinner}
      {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );
  
  // If a custom component is provided via the 'as' prop
  if (Component) {
    return (
      <Component
        className={buttonClasses}
        aria-label={ariaLabel || children}
        title={tooltip}
        disabled={disabled || loading}
        onClick={onClick}
        to={to}
        {...rest}
      >
        {content}
      </Component>
    );
  }
  
  // If it's a link
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        aria-label={ariaLabel || children}
        title={tooltip}
        {...rest}
      >
        {content}
      </Link>
    );
  }
  
  // Regular button
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel || children}
      title={tooltip}
      {...rest}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'outline', 'link', 'text']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  to: PropTypes.string,
  onClick: PropTypes.func,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  tooltip: PropTypes.string,
  ariaLabel: PropTypes.string,
  as: PropTypes.elementType
};

export default Button; 