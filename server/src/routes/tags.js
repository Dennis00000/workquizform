const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tagController = require('../controllers/tagController');

router.get('/', auth, tagController.getTags);
router.get('/popular', auth, tagController.getPopularTags);
router.get('/search', auth, tagController.searchTags);

module.exports = router; 