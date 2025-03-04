const express = require('express');
const router = express.Router();
const { Template } = require('../models');
const { Op } = require('sequelize');

router.get('/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const tags = await Template.findAll({
      attributes: ['tags'],
      where: {
        tags: {
          [Op.overlap]: [q]
        }
      },
      raw: true
    });

    // Extract unique tags that match the query
    const uniqueTags = [...new Set(
      tags.flatMap(t => t.tags)
        .filter(tag => tag.toLowerCase().includes(q.toLowerCase()))
    )];

    res.json(uniqueTags.slice(0, 10)); // Limit to 10 suggestions
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 