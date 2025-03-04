const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const templateController = require('../../controllers/TemplateController');
const { validateTemplate } = require('../../middleware/validation');

router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let templates;
    if (search) {
      templates = await templateController.search(search, {
        limit,
        offset,
        where: req.user.role !== 'admin' ? 
          `(t."isPublic" = true OR t."userId" = '${req.user.id}')` : ''
      });
    } else {
      templates = await templateController.findAll({
        where: req.user.role !== 'admin' ? {
          [Op.or]: [
            { isPublic: true },
            { userId: req.user.id }
          ]
        } : {},
        limit,
        offset,
        include: [
          {
            model: User,
            attributes: ['id', 'name']
          },
          {
            model: Tag,
            through: { attributes: [] }
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, validateTemplate, async (req, res) => {
  try {
    const template = await templateController.createTemplate(req.body, req.user.id);
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add other routes for updating, deleting, etc.

module.exports = router; 