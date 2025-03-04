const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const searchController = require('../controllers/searchController');

router.get('/templates', auth, searchController.searchTemplates);
router.get('/users', auth, searchController.searchUsers);
router.get('/tags', auth, searchController.searchTags);

module.exports = router; 