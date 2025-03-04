import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'ru', name: 'Русский' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <select
      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector; 