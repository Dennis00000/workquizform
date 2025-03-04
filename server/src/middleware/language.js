const supportedLanguages = ['en', 'lt', 'ru'];

const language = (req, res, next) => {
  const lang = req.headers['accept-language']?.split(',')[0] || 'en';
  req.language = supportedLanguages.includes(lang) ? lang : 'en';
  next();
};

module.exports = language; 