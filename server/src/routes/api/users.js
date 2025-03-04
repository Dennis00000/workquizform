const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } }
        ],
        id: { [Op.ne]: req.user.id } // Exclude current user
      },
      attributes: ['id', 'name', 'email', 'avatar'],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 