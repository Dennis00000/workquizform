/**
 * Centralized error handling middleware
 */
const config = require('../config');
const { logger } = require('../utils/logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || `ERR_${statusCode}`;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'ERR_VALIDATION', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'ERR_AUTHENTICATION');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'ERR_AUTHORIZATION');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'ERR_NOT_FOUND');
  }
}

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value: ${value} for field ${field}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      errorCode: err.errorCode
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error
    console.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// Handle 404 errors
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Not found - ${req.originalUrl}`));
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorCode = err.errorCode || 'ERR_INTERNAL';
  let details = err.details || null;
  let stack = err.stack;
  
  // Log the error
  if (statusCode >= 500) {
    logger.error(`${errorCode}: ${message}`, { 
      path: req.path,
      method: req.method,
      statusCode,
      stack,
      details
    });
  } else {
    logger.warn(`${errorCode}: ${message}`, { 
      path: req.path,
      method: req.method,
      statusCode
    });
  }
  
  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'production') {
    stack = undefined;
  }
  
  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      details,
      ...(process.env.NODE_ENV !== 'production' && { stack })
    }
  });
};

// Async handler to catch errors in async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  notFoundHandler,
  errorHandler,
  asyncHandler
}; 