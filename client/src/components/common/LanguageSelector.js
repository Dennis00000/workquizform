import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'lt', name: 'Lietuvių' },
    { code: 'ru', name: 'Русский' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        <span className="sr-only">{t('common.changeLanguage')}</span>
        <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
        {languages.map((language) => (
          <Menu.Item key={language.code}>
            {({ active }) => (
              <button
                onClick={() => changeLanguage(language.code)}
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } ${
                  i18n.language === language.code ? 'font-medium text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'
                } block w-full text-left px-4 py-2 text-sm`}
              >
                {language.name}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

export default LanguageSelector; 