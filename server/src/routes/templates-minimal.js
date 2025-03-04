const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
  console.log('Template minimal route:', {
    method: req.method,
    path: req.path
  });
  next();
});

// Get all templates (minimal data)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get a template by ID (minimal data)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('templates')
      .select('id, title, description, created_at')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create a template (minimal version)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newTemplate = {
      title,
      description: description || '',
      user_id: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const { data, error } = await supabase
      .from('templates')
      .insert([newTemplate])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update a template (minimal version)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // Check if template exists and user owns it
    const { data: template, error: checkError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this template' });
    }
    
    const updates = {
      updated_at: new Date()
    };
    
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

module.exports = router; 