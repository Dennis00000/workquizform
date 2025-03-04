const serviceSupabase = require('../config/serviceSupabase');

const adminController = {
  // User management
  async getAllUsers(req, res) {
    try {
      const { data, error } = await serviceSupabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        error: { message: 'Failed to get users', status: 500 }
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, role, status } = req.body;

      const { data, error } = await serviceSupabase
        .from('users')
        .update({ name, role, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        error: { message: 'Failed to update user', status: 500 }
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const { error } = await serviceSupabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        error: { message: 'Failed to delete user', status: 500 }
      });
    }
  },

  // Template management
  async getAllTemplates(req, res) {
    try {
      const { data, error } = await serviceSupabase
        .from('templates')
        .select('*, user:users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        error: { message: 'Failed to get templates', status: 500 }
      });
    }
  },

  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const { title, description, topic, questions, status } = req.body;

      const { data, error } = await serviceSupabase
        .from('templates')
        .update({ title, description, topic, questions, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        error: { message: 'Failed to update template', status: 500 }
      });
    }
  },

  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      const { error } = await serviceSupabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        error: { message: 'Failed to delete template', status: 500 }
      });
    }
  },

  // Response management
  async getResponses(req, res) {
    try {
      const { data, error } = await serviceSupabase
        .from('responses')
        .select('*, template:templates(title), user:users(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Error getting responses:', error);
      res.status(500).json({
        error: { message: 'Failed to get responses', status: 500 }
      });
    }
  },

  async deleteResponse(req, res) {
    try {
      const { id } = req.params;

      const { error } = await serviceSupabase
        .from('responses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting response:', error);
      res.status(500).json({
        error: { message: 'Failed to delete response', status: 500 }
      });
    }
  },

  // Statistics
  async getStats(req, res) {
    try {
      // Get user count
      const { count: userCount, error: userError } = await serviceSupabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Get template count
      const { count: templateCount, error: templateError } = await serviceSupabase
        .from('templates')
        .select('*', { count: 'exact', head: true });

      if (templateError) throw templateError;

      // Get response count
      const { count: responseCount, error: responseError } = await serviceSupabase
        .from('responses')
        .select('*', { count: 'exact', head: true });

      if (responseError) throw responseError;

      res.json({
        users: userCount,
        templates: templateCount,
        responses: responseCount
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({
        error: { message: 'Failed to get stats', status: 500 }
      });
    }
  }
};

module.exports = adminController; 