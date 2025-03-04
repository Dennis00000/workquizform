const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { testConnection } = require('../lib/supabase');
const { redis } = require('../services/cacheService');
const os = require('os');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get API health status
 *     description: Returns the health status of the API and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health check passed
 *       503:
 *         description: Service unavailable
 */
router.get('/', asyncHandler(async (req, res) => {
  const services = {
    database: false,
    cache: !redis ? 'disabled' : false
  };
  
  // Check database connection
  try {
    const dbConnected = await testConnection();
    services.database = dbConnected;
  } catch (error) {
    services.database = false;
  }
  
  // Check Redis connection if enabled
  if (redis) {
    try {
      await redis.ping();
      services.cache = true;
    } catch (error) {
      services.cache = false;
    }
  }
  
  // System info
  const systemInfo = {
    uptime: Math.floor(process.uptime()),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    cpu: os.cpus().length
  };
  
  // Determine overall health
  const isHealthy = services.database && (services.cache === true || services.cache === 'disabled');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services,
    system: systemInfo
  });
}));

module.exports = router; 