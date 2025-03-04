/**
 * Form validation utilities
 */

import * as yup from 'yup';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(String(email).toLowerCase());
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password is valid
 */
export const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Checks if a value has a minimum length
 * @param {string} value - The value to check
 * @param {number} minLength - The minimum length
 * @returns {boolean} - Whether the value has the minimum length
 */
export const hasMinLength = (value, minLength) => {
  return String(value).length >= minLength;
};

/**
 * Checks if a value has a maximum length
 * @param {string} value - The value to check
 * @param {number} maxLength - The maximum length
 * @returns {boolean} - Whether the value has the maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  return String(value).length <= maxLength;
};

/**
 * Common validation schemas for forms
 */
export const validationSchemas = {
  /**
   * Login form validation schema
   */
  login: yup.object().shape({
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email is required'),
    password: yup
      .string()
      .required('Password is required')
  }),
  
  /**
   * Registration form validation schema
   */
  register: yup.object().shape({
    name: yup
      .string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: yup
      .string()
      .email('Please enter a valid email')
      .required('Email is required'),
    password: yup
      .string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password')
  }),
  
  /**
   * Profile update form validation schema
   */
  profileUpdate: yup.object().shape({
    name: yup
      .string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    bio: yup
      .string()
      .max(500, 'Bio must be less than 500 characters')
  }),
  
  /**
   * Password change form validation schema
   */
  passwordChange: yup.object().shape({
    currentPassword: yup
      .string()
      .required('Current password is required'),
    newPassword: yup
      .string()
      .required('New password is required')
      .min(6, 'Password must be at least 6 characters')
      .notOneOf([yup.ref('currentPassword')], 'New password must be different from current password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
      .required('Please confirm your new password')
  }),
  
  /**
   * Template form validation schema
   */
  template: yup.object().shape({
    title: yup
      .string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: yup
      .string()
      .max(500, 'Description must be less than 500 characters'),
    topic: yup
      .string()
      .required('Topic is required'),
    is_public: yup
      .boolean(),
    questions: yup
      .array()
      .of(
        yup.object().shape({
          text: yup
            .string()
            .required('Question text is required')
            .min(3, 'Question text must be at least 3 characters'),
          type: yup
            .string()
            .required('Question type is required')
            .oneOf(['text', 'number', 'choice', 'multiple', 'date', 'email', 'phone', 'url'], 'Invalid question type'),
          required: yup
            .boolean(),
          options: yup
            .array()
            .when('type', {
              is: (type) => ['choice', 'multiple'].includes(type),
              then: yup.array()
                .of(yup.string().required('Option text is required'))
                .min(2, 'At least 2 options are required')
                .required('Options are required for choice questions')
            })
        })
      )
      .min(1, 'At least one question is required')
  }),
  
  /**
   * Submission form validation schema (dynamic based on template questions)
   */
  createSubmissionSchema: (questions) => {
    const shape = {};
    
    questions.forEach((question, index) => {
      const fieldName = `question_${index}`;
      
      let validator;
      
      switch (question.type) {
        case 'text':
          validator = yup.string();
          break;
        case 'number':
          validator = yup.number().typeError('Please enter a valid number');
          break;
        case 'choice':
          validator = yup.string();
          break;
        case 'multiple':
          validator = yup.array().of(yup.string());
          break;
        case 'date':
          validator = yup.date().typeError('Please enter a valid date');
          break;
        case 'email':
          validator = yup.string().email('Please enter a valid email');
          break;
        case 'phone':
          validator = yup.string().matches(/^[0-9+\-() ]+$/, 'Please enter a valid phone number');
          break;
        case 'url':
          validator = yup.string().url('Please enter a valid URL');
          break;
        default:
          validator = yup.string();
      }
      
      if (question.required) {
        validator = validator.required('This field is required');
      }
      
      shape[fieldName] = validator;
    });
    
    return yup.object().shape(shape);
  }
};

/**
 * Validate a form against a schema
 * @param {Object} values - Form values
 * @param {Object} schema - Validation schema
 * @returns {Promise<Object>} - Validation result
 */
export const validateForm = async (values, schema) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    
    return { isValid: false, errors };
  }
};

export default validationSchemas; 