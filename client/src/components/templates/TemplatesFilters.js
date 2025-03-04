import React from 'react';
import { useTranslation } from 'react-i18next';

const TemplatesFilters = ({ filters, onChange }) => {
  const { t } = useTranslation();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('templates.topic')}
          </label>
          <select
            id="topic"
            name="topic"
            value={filters.topic || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">{t('common.all')}</option>
            <option value="Education">{t('templates.topics.education')}</option>
            <option value="Quiz">{t('templates.topics.quiz')}</option>
            <option value="Other">{t('templates.topics.other')}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.sortBy')}
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy || 'created_at:desc'}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="created_at:desc">{t('templates.sortOptions.newest')}</option>
            <option value="created_at:asc">{t('templates.sortOptions.oldest')}</option>
            <option value="title:asc">{t('templates.sortOptions.titleAZ')}</option>
            <option value="title:desc">{t('templates.sortOptions.titleZA')}</option>
            <option value="likes_count:desc">{t('templates.sortOptions.mostLiked')}</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => onChange({ topic: '', sortBy: 'created_at:desc' })}
            className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {t('common.resetFilters')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesFilters; 