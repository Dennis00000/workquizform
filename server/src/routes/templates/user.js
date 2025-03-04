const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/supabase');
const { authenticateToken } = require('../../middleware/auth');

// Get templates created by the current user
router.get('/templates/user', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        ),
        questions (count)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to add missing fields
    const transformedData = data.map(template => ({
      ...template,
      questions_count: template.questions ? template.questions.length : 0,
      user: template.user ? {
        ...template.user,
        avatar_url: null // Add this field since it's expected by the client
      } : null,
      tags: template.tags || []
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({ error: 'Failed to fetch user templates' });
  }
});

module.exports = router; 