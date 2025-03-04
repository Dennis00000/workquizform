const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const supportedLanguages = ['en', 'lt', 'ru'];
    
    if (!supportedLanguages.includes(lang)) {
      return res.status(400).json({ error: 'Language not supported' });
    }

    const translations = await fs.readFile(
      path.join(__dirname, `../locales/${lang}.json`),
      'utf8'
    );

    res.json(JSON.parse(translations));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 