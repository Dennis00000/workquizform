import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const variants = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100',
    iconClassName: 'text-green-400 dark:text-green-300'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    iconClassName: 'text-yellow-400 dark:text-yellow-300'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    iconClassName: 'text-blue-400 dark:text-blue-300'
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100',
    iconClassName: 'text-red-400 dark:text-red-300'
  }
};

const Alert = ({
  variant = 'info',
  title,
  children,
  className = '',
  onClose
}) => {
  const { icon: Icon, className: variantClassName, iconClassName } = variants[variant];

  return (
    <div className={`rounded-md p-4 ${variantClassName} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClassName}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {children && (
            <div className="text-sm mt-2">{children}</div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClassName}`}
              onClick={onClose}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert; 