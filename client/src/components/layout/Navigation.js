import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                {t('appName')}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('common.home')}
              </Link>
              <Link to="/templates" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('common.templates')}
              </Link>
              <Link to="/search" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('common.search')}
              </Link>
              <Link to="/about" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {t('common.about')}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <LanguageSelector />
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    {t('common.admin')}
                  </Link>
                )}
                <Link to="/profile" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  {user?.name || t('common.profile')}
                </Link>
                <button
                  onClick={logout}
                  className="border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md text-sm font-medium">
                  {t('common.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 