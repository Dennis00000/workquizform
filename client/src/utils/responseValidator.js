import { z } from 'zod';

/**
 * Response data validation middleware
 */
class ResponseValidator {
  /**
   * Validate response data against a schema
   * @param {Object} data - Response data to validate
   * @param {z.Schema} schema - Zod schema to validate against
   * @returns {Object} - Validated data
   * @throws {Error} - Validation error
   */
  validate(data, schema) {
    try {
      return schema.parse(data);
    } catch (error) {
      console.error('Response validation failed:', error);
      
      // Format validation errors for better readability
      const formattedErrors = error.errors.map(err => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join(', ');
      
      throw new Error(`Invalid response data: ${formattedErrors}`);
    }
  }
  
  /**
   * Create common schemas for reuse
   */
  schemas = {
    // Template schema
    template: z.object({
      id: z.string().uuid(),
      title: z.string().min(1),
      description: z.string().optional(),
      user_id: z.string().uuid(),
      is_public: z.boolean(),
      created_at: z.string().datetime(),
      updated_at: z.string().datetime().optional()
    }),
    
    // Question schema
    question: z.object({
      id: z.string().uuid(),
      template_id: z.string().uuid(),
      text: z.string().min(1),
      type: z.enum(['text', 'number', 'select', 'radio', 'checkbox']),
      options: z.array(
        z.object({
          value: z.string().or(z.number()),
          label: z.string()
        })
      ).optional(),
      required: z.boolean().default(false),
      order: z.number().int().min(0)
    }),
    
    // User schema
    user: z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      display_name: z.string().optional(),
      avatar_url: z.string().optional(),
      role: z.enum(['admin', 'user', 'premium', 'manager']).optional(),
      created_at: z.string().datetime()
    }),
    
    // Submission schema
    submission: z.object({
      id: z.string().uuid(),
      template_id: z.string().uuid(),
      user_id: z.string().uuid(),
      values: z.record(z.any()),
      created_at: z.string().datetime()
    })
  };
  
  /**
   * Create array schemas from base schemas
   */
  arraySchemas = {
    templates: z.array(this.schemas.template),
    questions: z.array(this.schemas.question),
    users: z.array(this.schemas.user),
    submissions: z.array(this.schemas.submission)
  };
  
  /**
   * Validate response with appropriate schema
   * @param {Object} data - Response data
   * @param {string} type - Type of data ('template', 'templates', etc.)
   * @returns {Object} - Validated data
   */
  validateResponse(data, type) {
    const schema = this.arraySchemas[type] || this.schemas[type];
    
    if (!schema) {
      throw new Error(`Unknown schema type: ${type}`);
    }
    
    return this.validate(data, schema);
  }
}

export const responseValidator = new ResponseValidator(); 