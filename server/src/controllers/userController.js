const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');

const userController = {
  getProfile: async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('id', req.user.id)
        .single();

      if (error) throw error;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;

      // Check if email is already taken
      if (email !== req.user.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      const { data: user, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', req.user.id)
        .select('id, name, email, role')
        .single();

      if (error) throw error;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', req.user.id)
        .single();

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const password_hash = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', req.user.id);

      if (error) throw error;
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserTemplates: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          tags:template_tags(tag:tags(name)),
          _count { 
            responses:template_responses(count),
            likes:template_likes(count)
          }
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserResponses: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('template_responses')
        .select(`
          *,
          template:templates(
            id,
            title,
            user:users(name)
          )
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController; 