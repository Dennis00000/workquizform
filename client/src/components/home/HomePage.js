import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LatestTemplates from '../templates/LatestTemplates';
import PopularTemplates from '../templates/PopularTemplates';

const HomePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                {t('home.hero.title')}
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-gray-700 dark:text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  {user ? (
                    <Link
                      to="/templates/create"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      {t('home.hero.createButton')}
                    </Link>
                  ) : null}
                </div>
                <div className={user ? "mt-3 sm:mt-0 sm:ml-3" : ""}>
                  <Link
                    to="/templates"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 md:py-4 md:text-lg md:px-10"
                  >
                    {t('home.hero.exploreButton')}
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-1">
              <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-8 flex items-center justify-center h-64">
                  <svg 
                    className="w-32 h-32 text-indigo-600 dark:text-indigo-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Templates Section */}
      <div className="mb-12">
        <PopularTemplates />
      </div>

      {/* Latest Templates Section */}
      <div className="mb-12">
        <LatestTemplates />
      </div>
    </div>
  );
};

export default HomePage; 