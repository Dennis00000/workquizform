import React from 'react';
import PropTypes from 'prop-types';
import { Button } from './index';

/**
 * Standardized Form component with consistent styling and behavior
 */
const Form = ({
  children,
  onSubmit,
  submitText = 'Submit',
  submitLoading = false,
  submitDisabled = false,
  error = null,
  className = '',
  ...rest
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} {...rest}>
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
      
      {children}
      
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={submitLoading}
          disabled={submitDisabled || submitLoading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
};

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string,
  submitLoading: PropTypes.bool,
  submitDisabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string
};

export default Form; 