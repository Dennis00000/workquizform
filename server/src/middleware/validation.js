const { body, validationResult } = require('express-validator');
const Joi = require('joi');
const { AppError } = require('./errorHandler');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateTemplate = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('topic')
    .isIn(['Education', 'Quiz', 'Other'])
    .withMessage('Invalid topic'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Question title is required'),
  body('questions.*.type')
    .isIn(['string', 'text', 'number', 'checkbox', 'radio', 'select', 'date', 'email', 'phone', 'url'])
    .withMessage('Invalid question type'),
  handleValidationErrors
];

const validateResponse = [
  body('templateId')
    .isUUID()
    .withMessage('Invalid template ID'),
  body('answers')
    .isObject()
    .withMessage('Answers must be provided'),
  body('emailCopy')
    .optional()
    .isBoolean()
    .withMessage('emailCopy must be a boolean'),
  body('email')
    .if(body('emailCopy').equals('true'))
    .isEmail()
    .withMessage('Valid email is required when requesting email copy'),
  handleValidationErrors
];

// Validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  // Template schemas
  createTemplate: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).allow(''),
    topic: Joi.string().required(),
    is_public: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string()).default([]),
    questions: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(''),
        type: Joi.string().valid('string', 'text', 'number', 'checkbox', 'radio', 'select', 'date', 'email', 'phone', 'url').required(),
        options: Joi.array().items(Joi.string()),
        required: Joi.boolean().default(false),
        validation: Joi.object().default({})
      })
    ).default([])
  }),
  
  // User schemas
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    bio: Joi.string().max(500).allow(''),
    avatar_url: Joi.string().uri().allow('')
  }),
  
  changePassword: Joi.object({
    oldPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(6).required()
  }),

  // Template validation
  templateCreate: [
    body('title')
      .notEmpty().withMessage('Title is required')
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isString().withMessage('Description must be a string'),
    body('is_public')
      .optional()
      .isBoolean().withMessage('is_public must be a boolean'),
    body('topic')
      .optional()
      .isString().withMessage('Topic must be a string'),
    body('questions')
      .optional()
      .isArray().withMessage('Questions must be an array'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array')
  ],
  
  templateUpdate: [
    body('title')
      .optional()
      .isString().withMessage('Title must be a string')
      .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isString().withMessage('Description must be a string'),
    body('is_public')
      .optional()
      .isBoolean().withMessage('is_public must be a boolean'),
    body('topic')
      .optional()
      .isString().withMessage('Topic must be a string'),
    body('questions')
      .optional()
      .isArray().withMessage('Questions must be an array'),
    body('tags')
      .optional()
      .isArray().withMessage('Tags must be an array')
  ],
  
  // User validation
  userRegister: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name')
      .notEmpty().withMessage('Name is required')
      .isString().withMessage('Name must be a string')
  ],
  
  userLogin: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  
  userUpdate: [
    body('name')
      .optional()
      .isString().withMessage('Name must be a string'),
    body('bio')
      .optional()
      .isString().withMessage('Bio must be a string')
  ],
  
  // Password validation
  passwordReset: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
  ],
  
  passwordUpdate: [
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('token')
      .notEmpty().withMessage('Reset token is required')
  ]
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors));
    }
    
    next();
  };
};

module.exports = {
  validateTemplate,
  validateResponse,
  validate,
  schemas
}; 