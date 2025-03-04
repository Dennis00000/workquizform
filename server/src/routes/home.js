const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const homeController = require('../controllers/homeController');

router.get('/latest', auth, homeController.getLatestTemplates);
router.get('/popular', auth, homeController.getPopularTemplates);
router.get('/tag-cloud', auth, homeController.getTagCloud);

module.exports = router; 