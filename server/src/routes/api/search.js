const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/searchController');
const auth = require('../../middleware/auth');

router.get('/templates', auth, async (req, res) => {
  try {
    const { q: query, page, limit, topic, tags, userId } = req.query;
    
    const filters = {
      topic,
      tags: tags ? tags.split(',') : undefined,
      userId
    };

    const results = await searchController.searchTemplates({
      query,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      filters
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/popular', auth, async (req, res) => {
  try {
    const templates = await searchController.getPopularTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tags', auth, async (req, res) => {
  try {
    const tags = await searchController.getTagCloud();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 