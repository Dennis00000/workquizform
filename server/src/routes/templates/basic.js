const express = require('express');
const router = express.Router();
const { supabase } = require('../../config/supabase');
const { authenticateToken } = require('../../middleware/auth');

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const { isPublic, limit = 10, offset = 0, sortBy } = req.query;
    
    let query = supabase.from('templates').select(`
      *,
      user:user_id (
        id,
        name,
        email
      ),
      questions (count)
    `);
    
    // Apply filters
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic === 'true');
    }
    
    // Apply sorting
    if (sortBy) {
      try {
        const sort = JSON.parse(sortBy);
        query = query.order(sort.column, { ascending: sort.order === 'asc' });
      } catch (e) {
        console.error('Error parsing sortBy:', e);
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform the data
    const transformedData = data.map(template => ({
      ...template,
      questions_count: template.questions ? template.questions.length : 0,
      user: template.user ? {
        ...template.user,
        avatar_url: null
      } : null,
      tags: template.tags || []
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create a template
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    const { title, description, is_public, tags, questions } = req.body;
    
    // Create the template
    const { data, error } = await supabase
      .from('templates')
      .insert({
        title,
        description,
        is_public: is_public !== undefined ? is_public : true,
        tags: tags || [],
        user_id: req.user.id,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // If there are questions, create them
    if (questions && questions.length > 0) {
      const questionsWithTemplateId = questions.map((question, index) => ({
        ...question,
        template_id: data.id,
        order_index: index
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsWithTemplateId);
      
      if (questionsError) throw questionsError;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

module.exports = router; 