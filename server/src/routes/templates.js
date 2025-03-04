const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const auth = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

/**
 * @route   GET /api/templates
 * @desc    Get all templates
 * @access  Public
 */
router.get('/', templateController.getTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get a template by ID
 * @access  Public
 */
router.get('/:id', templateController.getTemplate);

/**
 * @route   POST /api/templates
 * @desc    Create a new template
 * @access  Private
 */
router.post(
  '/',
  auth,
  validate(schemas.templateCreate),
  templateController.createTemplate
);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update a template
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  validate(schemas.templateUpdate),
  templateController.updateTemplate
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete a template
 * @access  Private
 */
router.delete('/:id', auth, templateController.deleteTemplate);

/**
 * @route   POST /api/templates/:id/like
 * @desc    Toggle like on a template
 * @access  Private
 */
router.post('/:id/like', auth, templateController.toggleLike);

/**
 * @route   GET /api/templates/latest
 * @desc    Get latest templates
 * @access  Public
 */
router.get('/latest', templateController.getLatestTemplates);

/**
 * @route   GET /api/templates/popular
 * @desc    Get popular templates
 * @access  Public
 */
router.get('/popular', templateController.getPopularTemplates);

module.exports = router;