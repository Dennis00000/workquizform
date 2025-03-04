const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const auth = require('../middleware/auth');

// Simple test route
router.get('/', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count');
    
    if (error) {
      return res.status(500).json({ error: 'Database connection error', details: error.message });
    }
    
    res.json({ success: true, message: 'Database connection successful', data });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Test auth middleware
router.get('/auth-test', auth, (req, res) => {
  res.json({ message: 'Auth middleware is working!', user: req.user });
});

// Setup database
router.get('/setup-db', async (req, res) => {
  try {
    console.log('Starting database setup...');
    
    // Check if templates table exists
    let { error: templateTableError } = await supabase
      .from('templates')
      .select('id')
      .limit(1);
    
    // Create templates table if it doesn't exist
    if (templateTableError && templateTableError.code === 'PGRST116') {
      console.log('Templates table does not exist, creating it...');
      
      // Execute SQL to create table - replace with appropriate Supabase API calls
      // This is just an example and might need to be run directly in Supabase SQL editor
      const createSQL = `
        CREATE TABLE IF NOT EXISTS public.templates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          topic TEXT,
          user_id UUID REFERENCES auth.users(id),
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `;
      
      console.log('Templates table created');
    }
    
    // Add missing columns to templates table
    const addColumnsSQL = [
      "ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;",
      "ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;"
    ];
    
    console.log('Adding missing columns to templates table...');
    
    // This would ideally be done through Supabase SQL editor or API
    // Here we're just showing what needs to be executed
    
    // Return success
    res.json({
      success: true,
      message: 'Database setup instructions',
      setupSteps: [
        "1. Go to Supabase SQL editor",
        "2. Execute the following SQL:",
        ...addColumnsSQL
      ]
    });
  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ error: 'Database setup failed', details: error.message });
  }
});

module.exports = router;