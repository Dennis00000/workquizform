import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Info */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              QuizForm
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">
                  {t('common.help')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-1 text-sm">
              <li className="text-gray-700 dark:text-gray-300">
                <a href="mailto:dennisopoola@gmail.com" className="hover:text-primary-700 dark:hover:text-primary-400">
                  dennisopoola@gmail.com
                </a>
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <a href="https://www.linkedin.com/in/do24" target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 dark:hover:text-primary-400">
                  LinkedIn
                </a>
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <a href="https://dennisopoola.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 dark:hover:text-primary-400">
                  Portfolio
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-3 border-t border-gray-300 dark:border-gray-700">
          <p className="text-center text-xs text-gray-700 dark:text-gray-400">
            © {currentYear} QuizForm. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 