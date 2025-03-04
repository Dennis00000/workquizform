const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/templates/:id/pdf', auth, exportController.exportToPDF);
router.get('/templates/:id/csv', auth, exportController.exportToCSV);

module.exports = router; 