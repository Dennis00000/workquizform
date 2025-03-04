const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/AdminController');
const auth = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/roleCheck');
const { Op } = require('sequelize');

router.use(auth, isAdmin);

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const users = await adminController.getUsers({
      where,
      limit,
      offset
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await adminController.updateUserStatus(id, status);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await adminController.toggleAdminRole(id, req.user);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await adminController.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { templates, total } = await adminController.getTemplates({
      where,
      limit,
      offset
    });

    res.json({ templates, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await adminController.deleteTemplate(id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 