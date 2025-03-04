const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(checkRole(['admin']));

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Template management
router.get('/templates', adminController.getAllTemplates);
router.put('/templates/:id', adminController.updateTemplate);
router.delete('/templates/:id', adminController.deleteTemplate);

// Response management
router.get('/responses', adminController.getResponses.bind(adminController));
router.delete('/responses/:id', adminController.deleteResponse.bind(adminController));

// Statistics
router.get('/stats', adminController.getStats.bind(adminController));

module.exports = router; 