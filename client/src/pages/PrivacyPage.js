import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('privacy.title')}
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('privacy.lastUpdated')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.introduction.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('privacy.introduction.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.dataCollection.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('privacy.dataCollection.description')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>{t('privacy.dataCollection.item1')}</li>
              <li>{t('privacy.dataCollection.item2')}</li>
              <li>{t('privacy.dataCollection.item3')}</li>
              <li>{t('privacy.dataCollection.item4')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.dataUse.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('privacy.dataUse.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.dataSecurity.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('privacy.dataSecurity.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('privacy.contact.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('privacy.contact.content')}
            </p>
            <div className="mt-4">
              <a
                href="mailto:dennisopoola@gmail.com"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                dennisopoola@gmail.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 