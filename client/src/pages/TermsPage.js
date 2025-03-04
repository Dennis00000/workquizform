import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('terms.title')}
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('terms.lastUpdated')}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.acceptance.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terms.acceptance.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.services.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('terms.services.description')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>{t('terms.services.item1')}</li>
              <li>{t('terms.services.item2')}</li>
              <li>{t('terms.services.item3')}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.userObligations.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terms.userObligations.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.intellectualProperty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terms.intellectualProperty.content')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('terms.contact.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('terms.contact.content')}
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

export default TermsPage; 