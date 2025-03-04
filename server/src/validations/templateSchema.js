const Joi = require('joi');

// Base field schema
const fieldSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid('text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'date').required(),
  label: Joi.string().required(),
  placeholder: Joi.string().allow('', null),
  required: Joi.boolean().default(false),
  options: Joi.when('type', {
    is: Joi.string().valid('select', 'radio', 'checkbox'),
    then: Joi.array().items(
      Joi.object({
        label: Joi.string().required(),
        value: Joi.string().required()
      })
    ).min(1).required(),
    otherwise: Joi.array().items(Joi.any()).optional()
  }),
  validation: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string().optional(),
    errorMessage: Joi.string().optional()
  }).optional()
});

// Create template schema
const createTemplateSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().max(50).allow('', null),
  is_public: Joi.boolean().default(true),
  fields: Joi.array().items(fieldSchema).min(1).required()
});

// Update template schema
const updateTemplateSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).allow('', null).optional(),
  category: Joi.string().max(50).allow('', null).optional(),
  is_public: Joi.boolean().optional(),
  fields: Joi.array().items(fieldSchema).min(1).optional()
});

// Template ID parameter schema
const templateIdSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdSchema
}; 