const { supabase } = require('../config/supabase');

const homeController = {
  getLatestTemplates: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          user:users(name),
          tags:template_tags(tag:tags(name)),
          _count { likes:template_likes(count) }
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPopularTemplates: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          user:users(name),
          tags:template_tags(tag:tags(name)),
          _count { 
            responses:template_responses(count),
            likes:template_likes(count)
          }
        `)
        .eq('is_public', true)
        .order('responses', { ascending: false })
        .limit(5);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getTagCloud: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('template_count', { ascending: false })
        .limit(30);

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = homeController; 