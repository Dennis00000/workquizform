import React from 'react';
import { useTranslation } from 'react-i18next';

const Loading = ({ size = 'medium', text, fullScreen = false }) => {
  const { t } = useTranslation();
  const loadingText = text || t('common.loading');
  
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  
  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <svg 
        className={`animate-spin ${spinnerSize} text-blue-600`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
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
      {loadingText && <p className="mt-2 text-gray-600 dark:text-gray-300">{loadingText}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default Loading; 