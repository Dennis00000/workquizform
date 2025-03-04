const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const serviceSupabase = require('../config/serviceSupabase');

const authController = {
  async register(req, res) {
    try {
      console.log('Starting registration process...');
      const { email, password, name } = req.body;

      // Basic validation with logging
      if (!email || !password || !name) {
        console.log('Validation failed:', { email, password: !!password, name });
        return res.status(400).json({
          error: { message: 'All fields are required', status: 400 }
        });
      }

      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('Creating user in database...', {
        email,
        name,
        hashedPassword: !!hashedPassword
      });

      // Create user directly in the database
      const { data: user, error } = await serviceSupabase
        .from('users')
        .insert([
          {
            email,
            name,
            password_hash: hashedPassword,
            role: 'user',
            status: 'active'
          }
        ])
        .select('id, email, name, role')
        .single();

      if (error) {
        console.error('Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return res.status(400).json({
          error: { 
            message: error.message === 'duplicate key value violates unique constraint' 
              ? 'Email already exists' 
              : 'Registration failed: ' + error.message,
            status: 400
          }
        });
      }

      console.log('User created successfully:', user);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Return success
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      });

    } catch (error) {
      console.error('Registration error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({
        error: { 
          message: 'Server error: ' + error.message,
          status: 500
        }
      });
    }
  },

  async login(req, res) {
    try {
      console.log('Starting login process...');
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          error: { message: 'Email and password are required', status: 400 }
        });
      }

      // Get user from database
      const { data: user, error: userError } = await serviceSupabase
        .from('users')
        .select('id, email, name, role, status, password_hash')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log('User not found:', email);
        return res.status(401).json({
          error: { message: 'Invalid credentials', status: 401 }
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        console.log('User account not active:', email);
        return res.status(401).json({
          error: { message: 'Account is not active', status: 401 }
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return res.status(401).json({
          error: { message: 'Invalid credentials', status: 401 }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove sensitive data before sending response
      const { password_hash, ...userData } = user;

      console.log('Login successful for user:', email);
      res.json({
        message: 'Login successful',
        user: userData,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: { message: 'Server error', status: 500 }
      });
    }
  }
};

module.exports = authController; 