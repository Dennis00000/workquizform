import React, { useId } from 'react';

/**
 * Accessible form field wrapper
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.type - Field type
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.helpText - Help text
 * @param {React.ReactNode} props.children - Field input component
 */
const AccessibleFormField = ({
  label,
  type = 'text',
  error,
  required = false,
  helpText,
  children
}) => {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <label 
          htmlFor={id}
          className={`block text-sm font-medium ${error ? 'text-red-700' : 'text-gray-700'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        
        {required && (
          <span className="text-sm text-gray-500" id={`${id}-required`}>
            Required
          </span>
        )}
      </div>
      
      <div className="mt-1 relative">
        {React.cloneElement(children, {
          id,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required,
          'aria-describedby': [
            helpText ? helpId : null,
            error ? errorId : null
          ].filter(Boolean).join(' ') || undefined,
          className: `block w-full rounded-md shadow-sm ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`
        })}
      </div>
      
      {helpText && (
        <p className="mt-1 text-sm text-gray-500" id={helpId}>
          {helpText}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default AccessibleFormField; 