const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authLimiter } = require('../middleware/security');
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log('Auth route hit:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (authError) throw authError;
    
    // Create the profile record
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email
        });
      
      if (profileError) throw profileError;
    }
    
    res.json({ message: 'Registration successful', user: authData.user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Verify token
router.get('/verify', auth, (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side only, just for completeness)
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

// Add this to your auth.js routes file
router.post('/register-test', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create a simple user object
    const user = {
      id: '12345',
      email,
      name,
      role: 'admin'
    };
    
    // Create a token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Test user created',
      token,
      user
    });
  } catch (error) {
    console.error('Register test error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 