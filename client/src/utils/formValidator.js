/**
 * Form validation utility
 */
class FormValidator {
  /**
   * Validate a form field
   * @param {Object} field - Field configuration
   * @param {any} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateField(field, value) {
    // Skip validation if field is not required and value is empty
    if (!field.required && (value === '' || value === null || value === undefined)) {
      return null;
    }

    // Required field validation
    if (field.required && (value === '' || value === null || value === undefined)) {
      return `${field.label || 'This field'} is required`;
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea':
        return this.validateTextInput(field, value);
      case 'email':
        return this.validateEmail(field, value);
      case 'number':
        return this.validateNumber(field, value);
      case 'date':
        return this.validateDate(field, value);
      case 'select':
      case 'radio':
        return this.validateSelect(field, value);
      case 'checkbox':
        return this.validateCheckbox(field, value);
      default:
        return null;
    }
  }

  /**
   * Validate text input
   * @param {Object} field - Field configuration
   * @param {string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateTextInput(field, value) {
    const { validation } = field;
    
    if (!validation) return null;
    
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }
    
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return validation.errorMessage || `${field.label} is not in the correct format`;
      }
    }
    
    return null;
  }

  /**
   * Validate email input
   * @param {Object} field - Field configuration
   * @param {string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateEmail(field, value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${field.label || 'Email'} must be a valid email address`;
    }
    return null;
  }

  /**
   * Validate number input
   * @param {Object} field - Field configuration
   * @param {number|string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateNumber(field, value) {
    const { validation } = field;
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return `${field.label || 'This field'} must be a number`;
    }
    
    if (!validation) return null;
    
    if (validation.min !== undefined && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    
    if (validation.max !== undefined && numValue > validation.max) {
      return `${field.label} must be no more than ${validation.max}`;
    }
    
    return null;
  }

  /**
   * Validate date input
   * @param {Object} field - Field configuration
   * @param {string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateDate(field, value) {
    const { validation } = field;
    const dateValue = new Date(value);
    
    if (isNaN(dateValue.getTime())) {
      return `${field.label || 'Date'} is not valid`;
    }
    
    if (!validation) return null;
    
    if (validation.minDate) {
      const minDate = new Date(validation.minDate);
      if (dateValue < minDate) {
        return `${field.label} must be after ${minDate.toLocaleDateString()}`;
      }
    }
    
    if (validation.maxDate) {
      const maxDate = new Date(validation.maxDate);
      if (dateValue > maxDate) {
        return `${field.label} must be before ${maxDate.toLocaleDateString()}`;
      }
    }
    
    return null;
  }

  /**
   * Validate select/radio input
   * @param {Object} field - Field configuration
   * @param {string} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateSelect(field, value) {
    if (!value && field.required) {
      return `Please select a ${field.label.toLowerCase()}`;
    }
    return null;
  }

  /**
   * Validate checkbox input
   * @param {Object} field - Field configuration
   * @param {boolean|Array} value - Field value
   * @returns {string|null} Error message or null if valid
   */
  validateCheckbox(field, value) {
    if (field.required) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `Please select at least one ${field.label.toLowerCase()}`;
        }
      } else if (!value) {
        return `${field.label} is required`;
      }
    }
    return null;
  }

  /**
   * Validate an entire form
   * @param {Array} fields - Form fields configuration
   * @param {Object} values - Form values
   * @returns {Object} Validation errors
   */
  validateForm(fields, values) {
    const errors = {};
    
    fields.forEach(field => {
      const value = values[field.id];
      const error = this.validateField(field, value);
      
      if (error) {
        errors[field.id] = error;
      }
    });
    
    return errors;
  }

  /**
   * Check if a form is valid
   * @param {Array} fields - Form fields configuration
   * @param {Object} values - Form values
   * @returns {boolean} Whether the form is valid
   */
  isFormValid(fields, values) {
    const errors = this.validateForm(fields, values);
    return Object.keys(errors).length === 0;
  }
}

export const formValidator = new FormValidator();
export default formValidator; 