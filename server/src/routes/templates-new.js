const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * Get all templates
 * Route: GET /
 */
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('templates')
      .select('*, users(display_name, avatar_url)');
    
    // Filter by public templates if not authenticated
    if (!req.user) {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * Get single template by ID
 * Route: GET /:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('templates')
      .select('*, users(display_name, avatar_url), questions(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Check if template is private and user is not the owner
    if (!data.is_public && (!req.user || req.user.id !== data.user_id)) {
      return res.status(403).json({ error: 'Access denied to private template' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * Create a new template
 * Route: POST /
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, is_public = false, questions = [] } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        title,
        description,
        is_public,
        user_id: req.user.id
      })
      .select()
      .single();
    
    if (templateError) throw templateError;
    
    // Create the questions if any
    if (questions.length > 0) {
      const questionsWithTemplateId = questions.map((question, index) => ({
        ...question,
        template_id: template.id,
        order: index
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithTemplateId);
      
      if (questionsError) throw questionsError;
    }
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * Update an existing template
 * Route: PUT /:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_public, questions } = req.body;
    
    // Check if template exists and user owns it
    const { data: template, error: checkError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError) throw checkError;
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this template' });
    }
    
    // Update the template
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('templates')
      .update({
        title,
        description,
        is_public,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    // Handle questions if provided
    if (questions) {
      // First delete existing questions
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('template_id', id);
      
      if (deleteError) throw deleteError;
      
      // Then insert new questions
      if (questions.length > 0) {
        const questionsWithTemplateId = questions.map((question, index) => ({
          ...question,
          id: undefined, // Let Supabase generate new IDs
          template_id: id,
          order: index
        }));
        
        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionsWithTemplateId);
        
        if (insertError) throw insertError;
      }
    }
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * Delete a template
 * Route: DELETE /:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template exists and user owns it
    const { data: template, error: checkError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError) throw checkError;
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this template' });
    }
    
    // Delete template (cascading to questions via DB constraint)
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * Duplicate a template
 * Route: POST /:id/duplicate
 */
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log('Duplicate route called with ID:', id, 'by user:', userId);
    
    // Get the original template with questions
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (templateError || !template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Get the template's questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('template_id', id)
      .order('order', { ascending: true });
    
    if (questionsError) throw questionsError;
    
    // Create a copy of the template
    const newTemplate = {
      title: `${template.title} (Copy)`,
      description: template.description,
      is_public: false, // Make the copy private by default
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert the new template
    const { data: insertedTemplate, error: insertError } = await supabase
      .from('templates')
      .insert([newTemplate])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // Copy the questions if any
    if (questions && questions.length > 0) {
      const newQuestions = questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
        required: q.required,
        order: q.order,
        template_id: insertedTemplate.id
      }));
      
      const { error: insertQuestionsError } = await supabase
        .from('questions')
        .insert(newQuestions);
      
      if (insertQuestionsError) throw insertQuestionsError;
    }
    
    res.status(201).json(insertedTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ error: 'Failed to duplicate template' });
  }
});

/**
 * Toggle like on a template
 * Route: POST /:id/like
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
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