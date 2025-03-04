import React from 'react';
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('about.title')}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('about.description')}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            {t('about.mission.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('about.mission.description')}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            {t('about.features.title')}
          </h2>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6">
            <li>{t('about.features.item1')}</li>
            <li>{t('about.features.item2')}</li>
            <li>{t('about.features.item3')}</li>
            <li>{t('about.features.item4')}</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
            {t('about.team.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('about.team.description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 