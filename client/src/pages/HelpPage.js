import React from 'react';
import { useTranslation } from 'react-i18next';

const HelpPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {t('help.title')}
        </h1>

        <div className="space-y-8">
          {/* Getting Started */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('help.gettingStarted.title')}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                {t('help.gettingStarted.description')}
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>{t('help.gettingStarted.step1')}</li>
                <li>{t('help.gettingStarted.step2')}</li>
                <li>{t('help.gettingStarted.step3')}</li>
              </ul>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('help.faq.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('help.faq.q1')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('help.faq.a1')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('help.faq.q2')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('help.faq.a2')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('help.faq.q3')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('help.faq.a3')}
                </p>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('help.support.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('help.support.description')}
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

export default HelpPage; 