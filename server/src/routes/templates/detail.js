const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/supabase');
const { authenticateToken } = require('../../middleware/auth');

// Get a single template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the template
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        ),
        questions (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting template:', error);
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Transform the data
    const transformedData = {
      ...data,
      user: data.user ? {
        ...data.user,
        avatar_url: null
      } : null,
      tags: data.tags || [],
      questions: data.questions || []
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

// Update a template
router.put('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_public, tags, questions } = req.body;
    
    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (templateError) throw templateError;
    
    if (!template || template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this template' });
    }
    
    // Update the template
    const { data, error } = await supabase
      .from('templates')
      .update({
        title,
        description,
        is_public,
        tags,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If there are questions, update them
    if (questions && questions.length > 0) {
      // First delete existing questions
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('template_id', id);
      
      if (deleteError) throw deleteError;
      
      // Then add the new questions
      const questionsWithTemplateId = questions.map((question, index) => ({
        ...question,
        template_id: id,
        order_index: index
      }));
      
      const { error: insertError } = await supabase
        .from('questions')
        .insert(questionsWithTemplateId);
      
      if (insertError) throw insertError;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (templateError) throw templateError;
    
    if (!template || template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this template' });
    }
    
    // Delete the template (questions will be deleted by cascade)
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Toggle like on a template
router.post('/templates/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the user has already liked this template
    const { data: existingLike, error: checkError } = await supabase
      .from('template_likes')
      .select('id')
      .eq('template_id', id)
      .eq('user_id', req.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    let isLiked = false;
    
    if (existingLike) {
      // User has already liked this template, so unlike it
      const { error: unlikeError } = await supabase
        .from('template_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (unlikeError) throw unlikeError;
    } else {
      // User hasn't liked this template yet, so like it
      const { error: likeError } = await supabase
        .from('template_likes')
        .insert({
          template_id: id,
          user_id: req.user.id
        });
      
      if (likeError) throw likeError;
      
      isLiked = true;
    }
    
    res.json({ liked: isLiked });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router; 