const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// Get questions for a template
router.get('/templates/:templateId/questions', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create a new question
router.post('/questions', authenticateToken, async (req, res) => {
  try {
    const { template_id, text, type, options, required, order_index } = req.body;
    
    // Validate required fields
    if (!template_id || !text || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', template_id)
      .single();
    
    if (templateError) throw templateError;
    
    if (!template || template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this template' });
    }
    
    // Create the question
    const { data, error } = await supabase
      .from('questions')
      .insert({
        template_id,
        text,
        type,
        options: options || [],
        required: required || false,
        order_index: order_index || 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update a question
router.put('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get the question to check ownership
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('template_id')
      .eq('id', id)
      .single();
    
    if (questionError) throw questionError;
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', question.template_id)
      .single();
    
    if (templateError) throw templateError;
    
    if (!template || template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this question' });
    }
    
    // Update the question
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
router.delete('/questions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the question to check ownership
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('template_id')
      .eq('id', id)
      .single();
    
    if (questionError) throw questionError;
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', question.template_id)
      .single();
    
    if (templateError) throw templateError;
    
    if (!template || template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }
    
    // Delete the question
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router; 