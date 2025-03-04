/**
 * Application configuration
 */

const config = {
  // API configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
    timeout: 30000, // 30 seconds
  },
  
  // Authentication configuration
  auth: {
    tokenKey: 'quizform_token',
    userKey: 'quizform_user',
    expiresInDays: 7,
  },
  
  // Feature flags
  features: {
    darkMode: true,
    analytics: process.env.NODE_ENV === 'production',
    fileUploads: true,
    socialLogin: false,
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  // Validation limits
  validation: {
    minPasswordLength: 8,
    maxNameLength: 50,
    maxBioLength: 500,
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    maxQuestions: 50,
    maxOptionsPerQuestion: 20,
  },
  
  // File upload limits
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxImageDimension: 2000, // pixels
  },
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default config; 