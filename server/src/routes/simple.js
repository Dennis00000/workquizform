const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple middleware that doesn't use the auth middleware
router.get('/protected', (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth header in simple route:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      message: 'Simple protected route works!',
      user: decoded
    });
  } catch (error) {
    console.error('Simple route error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 