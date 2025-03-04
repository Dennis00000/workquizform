const { supabase } = require('../config/supabase');

const searchController = {
  searchTemplates: async (req, res) => {
    try {
      const { query, topic, tags } = req.query;
      
      let searchQuery = supabase
        .from('templates')
        .select(`
          *,
          user:users(name),
          tags:template_tags(tag:tags(name)),
          _count { responses:template_responses(count) }
        `);

      // Full-text search on title and description
      if (query) {
        searchQuery = searchQuery.textSearch('fts', query, {
          type: 'websearch',
          config: 'english'
        });
      }

      // Apply filters
      if (topic) {
        searchQuery = searchQuery.eq('topic', topic);
      }

      if (tags) {
        const tagArray = tags.split(',');
        searchQuery = searchQuery.contains('tags', tagArray);
      }

      // Handle visibility
      if (req.user.role !== 'admin') {
        searchQuery = searchQuery.or(`is_public.eq.true,user_id.eq.${req.user.id}`);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  searchUsers: async (req, res) => {
    try {
      const { query } = req.query;

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, status')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

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
        .order('template_count', { ascending: false })
        .limit(10);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = searchController; 