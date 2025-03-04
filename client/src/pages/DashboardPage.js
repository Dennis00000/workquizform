import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('dashboard.welcome', { name: user?.name || t('common.user') })}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-200">
              {t('dashboard.templates')}
            </h3>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-100">0</p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-200">
              {t('dashboard.submissions')}
            </h3>
            <p className="text-3xl font-bold text-green-800 dark:text-green-100">0</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-purple-700 dark:text-purple-200">
              {t('dashboard.responses')}
            </h3>
            <p className="text-3xl font-bold text-purple-800 dark:text-purple-100">0</p>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('dashboard.recentActivity')}
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-300">
              {t('dashboard.noRecentActivity')}
            </p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
              {t('dashboard.createTemplate')}
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
              {t('dashboard.viewSubmissions')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 