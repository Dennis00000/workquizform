const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const config = require('./config');
const { logger, stream } = require('./utils/logger');
const { initSocket } = require('./services/socketService');
const { connect: connectCache } = require('./services/cacheService');
const { runMigrations } = require('./db/migrations');
const path = require('path');
const fs = require('fs');
const swagger = require('./docs/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { performanceMonitor } = require('./middleware/performanceMonitor');
const { securityHeaders } = require('./middleware/securityHeaders');

// Create Express app
const app = express();

// Security middleware
app.use(securityHeaders());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan(config.isDev ? 'dev' : 'combined', { stream }));

// Add this before your routes
app.use(performanceMonitor);

// API routes
app.use('/api', routes);

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve static files from uploads directory
const uploadsDir = config.uploads.dir;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Add this after your API routes
app.use('/api-docs', swagger.serve, swagger.setup);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services
const initServices = async () => {
  try {
    logger.info('Initializing services...');
    
    // Run database migrations
    await runMigrations();
    
    // Initialize cache if enabled
    if (config.redis.enabled) {
      await connectCache();
      logger.info('Cache service initialized');
    }
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
    throw error;
  }
};

module.exports = { app, initServices, initSocket }; 