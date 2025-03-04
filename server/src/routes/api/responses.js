const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const responseController = require('../../controllers/ResponseController');
const { validateResponse } = require('../../middleware/validation');

router.post('/', auth, validateResponse, async (req, res) => {
  try {
    const response = await responseController.createResponse(req.body, req.user.id);
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/user', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const responses = await responseController.getUserResponses(req.user.id, {
      limit,
      offset
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 