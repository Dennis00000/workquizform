require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { connect: connectCache } = require('./services/cacheService');
const setupDatabase = require('./config/setupDatabase');
const { initializeDatabase } = require('./db/init');
const { testConnection } = require('./lib/supabase');
const { supabase } = require('./config/supabase');
const http = require('http');
const { logger } = require('./utils/logger');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Comment out compression if you don't want to install it
// app.use(compression());

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Comment out morgan if you don't want to install it
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// Debug logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Basic test routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the QuizForm API' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add this before your routes
app.get('/api/bypass-test', (req, res) => {
  logger.debug('Headers:', req.headers);
  res.json({ 
    message: 'Bypass test successful',
    authHeader: req.header('Authorization')
  });
});

// Add this before the API routes section
app.get('/direct-test', (req, res) => {
  res.json({ message: 'Direct test route works!' });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Supabase connection error:', error);
      return false;
    }
    
    logger.info('Supabase service connection test successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
    return false;
  }
}

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket (if needed)
// initSocket(server);

// Start the server
async function startServer() {
  try {
    // Test Supabase connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      logger.error('Failed to connect to Supabase. Exiting...');
      process.exit(1);
    }
    
    // Initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      logger.error('Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server running in ${config.env || 'development'} mode on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string'
        ? 'Pipe ' + PORT
        : 'Port ' + PORT;
        
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

// Start the server
startServer();