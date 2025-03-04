const jwt = require('jsonwebtoken');
require('dotenv').config();

// Replace with your actual token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZDE0YWM2My0xYjc5LTQzM2YtOWU3YS1iYWU0MjdjZjQ5ZjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0MDYxODg5NCwiZXhwIjoxNzQwNzA1Mjk0fQ.uU19jtkXH0jelU36uJrh04bdo8AdbitxE_qs5T-hGuU';

try {
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  console.log('Token verified successfully!');
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.name, error.message);
}
