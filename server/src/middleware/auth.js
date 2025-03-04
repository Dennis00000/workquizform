const { supabase } = require('../lib/supabase');
const { AppError } = require('./errorHandler');

/**
 * Authentication middleware to protect routes
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required', 401));
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Verify token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return next(new AppError('Invalid or expired token', 401));
    }
    
    if (!data.user) {
      return next(new AppError('User not found', 401));
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      return next(new AppError('User profile not found', 401));
    }
    
    // Add user to request
    req.user = {
      ...data.user,
      ...profile
    };
    
    next();
  } catch (error) {
    next(new AppError('Authentication failed', 401));
  }
};

module.exports = auth; 