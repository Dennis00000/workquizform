const express = require('express');
const router = express.Router();
const supabase = require('../../config/supabase');

router.get('/auth-test', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Supabase connection successful', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to Supabase' });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = router; 