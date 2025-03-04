const { supabase } = require('../config/supabase');

const tagController = {
  getTags: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPopularTags: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*, templates:template_tags(count)')
        .order('template_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  searchTags: async (req, res) => {
    try {
      const { query } = req.query;
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add other tag-related methods...
};

module.exports = tagController; 