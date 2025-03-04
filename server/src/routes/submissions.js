const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

/**
 * Get all submissions for a template
 * GET /api/submissions/template/:templateId
 */
router.get('/template/:templateId', auth, async (req, res) => {
  try {
    const { templateId } = req.params;
    const { data, error } = await supabase
      .from('template_responses')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

/**
 * Get a specific submission
 * GET /api/submissions/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('template_responses')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

/**
 * Create a new submission
 * POST /api/submissions
 */
router.post('/', async (req, res) => {
  try {
    const { template_id, responses, respondent_email } = req.body;
    
    if (!template_id || !responses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data, error } = await supabase
      .from('template_responses')
      .insert({
        template_id,
        responses,
        respondent_email,
        status: 'completed'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

/**
 * Delete a submission
 * DELETE /api/submissions/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('template_responses')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

module.exports = router; 