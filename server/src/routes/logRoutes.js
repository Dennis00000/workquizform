const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { apiLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /log/error:
 *   post:
 *     summary: Log client-side errors
 *     description: Endpoint for logging client-side errors
 *     tags: [Logging]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               stack:
 *                 type: string
 *               url:
 *                 type: string
 *               line:
 *                 type: number
 *               column:
 *                 type: number
 *               userAgent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Error logged successfully
 */
router.post('/error', apiLimiter, asyncHandler(async (req, res) => {
  const { message, stack, url, line, column, userAgent } = req.body;
  
  logger.error('Client error:', {
    message,
    stack,
    url,
    line,
    column,
    userAgent: userAgent || req.get('user-agent'),
    ip: req.ip
  });
  
  res.status(200).json({ success: true });
}));

module.exports = router; 