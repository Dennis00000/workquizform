import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card component for consistent styling
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bodyClassName = '',
  footerClassName = '',
  headerClassName = '',
  noPadding = false,
  ...rest
}) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg ${className}`}
      {...rest}
    >
      {(title || subtitle) && (
        <div className={`px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}>
          {title && <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div className={`${noPadding ? '' : 'px-4 py-5 sm:p-6'} ${bodyClassName}`}>
        {children}
      </div>
      
      {footer && (
        <div className={`px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  noPadding: PropTypes.bool
};

export default Card; 