const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    key: 'csrf',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to generate CSRF token
const generateCsrfToken = (req, res, next) => {
  // Generate a new CSRF token if one doesn't exist
  if (!req.csrfToken) {
    req.csrfToken = uuidv4();
  }
  
  // Set the token in the response header
  res.setHeader('X-CSRF-Token', req.csrfToken);
  next();
};

module.exports = {
  csrfProtection,
  generateCsrfToken
}; 