const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const config = require('../config');
const { logger } = require('../utils/logger');
const { redis } = require('../services/cacheService');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
    skip: (req) => {
      // Skip rate limiting for internal requests or specific paths
      return req.ip === '127.0.0.1' || req.path.startsWith('/health');
    }
  };

  const limiterOptions = { ...defaultOptions, ...options };

  // Use Redis store if Redis is enabled
  if (config.redis.enabled && redis) {
    try {
      limiterOptions.store = new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'ratelimit:'
      });
      logger.info('Using Redis store for rate limiting');
    } catch (error) {
      logger.error('Failed to use Redis store for rate limiting:', error);
    }
  }

  return rateLimit(limiterOptions);
};

// API rate limiter
const apiLimiter = createRateLimiter();

// More strict limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: 'Too many authentication attempts, please try again later.'
});

// Limiter for user creation
const createUserLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 accounts per day
  message: 'Too many accounts created from this IP, please try again after 24 hours.'
});

module.exports = {
  apiLimiter,
  authLimiter,
  createUserLimiter
}; 