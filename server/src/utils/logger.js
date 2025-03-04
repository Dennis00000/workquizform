const winston = require('winston');
const { format, createLogger, transports } = winston;
const path = require('path');
const config = require('../config');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Define console format (more readable for development)
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Create the logger
const logger = createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'quizform-api' },
  transports: [
    // Write logs to files in production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({ 
        filename: path.join(config.logging.dir, 'error.log'), 
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 5
      }),
      new transports.File({ 
        filename: path.join(config.logging.dir, 'combined.log'),
        maxsize: 10485760, // 10MB
        maxFiles: 5
      })
    ] : []),
    
    // Always log to console
    new transports.Console({
      format: consoleFormat
    })
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false
});

// Create a stream object for Morgan
const stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Give logger time to log the error before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = {
  logger,
  stream
}; 