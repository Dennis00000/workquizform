const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.post('/image', auth, upload.single('image'), uploadController.uploadImage);

module.exports = router; 