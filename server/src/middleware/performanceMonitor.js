const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Middleware to monitor request performance
 */
const performanceMonitor = (req, res, next) => {
  // Skip monitoring for certain paths
  if (req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
    return next();
  }

  const start = process.hrtime();
  
  // Add response finished listener
  res.on('finish', () => {
    const end = process.hrtime(start);
    const duration = Math.round((end[0] * 1000) + (end[1] / 1000000)); // in ms
    
    // Log slow requests
    if (duration > config.performance.slowRequestThreshold) {
      logger.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`, {
        method: req.method,
        path: req.originalUrl,
        duration,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        ip: req.ip
      });
    }
    
    // Add performance header if in development
    if (config.isDev) {
      res.set('X-Response-Time', `${duration}ms`);
    }
    
    // Log performance metrics
    if (config.performance.logAllRequests) {
      logger.debug(`Request performance: ${req.method} ${req.originalUrl} took ${duration}ms`, {
        method: req.method,
        path: req.originalUrl,
        duration,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
};

module.exports = { performanceMonitor }; 