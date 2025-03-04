const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/supabase');

// Search templates
router.get('/templates/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }
    
    // Search templates by title, description, or tags
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to add missing fields
    const transformedData = data.map(template => ({
      ...template,
      user: template.user ? {
        ...template.user,
        avatar_url: null // Add this field since it's expected by the client
      } : null,
      tags: template.tags || [],
      questions_count: 0 // Add a default value
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ error: 'Failed to search templates' });
  }
});

module.exports = router; 