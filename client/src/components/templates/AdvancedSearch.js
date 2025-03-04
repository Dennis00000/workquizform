import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '@heroicons/react/outline';

const AdvancedSearch = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateFrom: '',
    dateTo: '',
    tags: [],
    author: ''
  });
  
  const handleSearch = (e) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      ...advancedFilters
    });
  };
  
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setAdvancedFilters(prev => ({
        ...prev,
        tags: [...prev.tags, e.target.value]
      }));
      e.target.value = '';
    }
  };
  
  const removeTag = (tag) => {
    setAdvancedFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch}>
        <div className="flex w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              className="block w-full rounded-l-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <SearchIcon className="h-5 w-5 mr-1" />
            {t('search.button')}
          </button>
        </div>
        
        <div className="mt-2">
          <button
            type="button"
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            {advancedOpen ? t('search.hideAdvanced') : t('search.showAdvanced')}
          </button>
        </div>
        
        {advancedOpen && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('search.dateFrom')}
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={advancedFilters.dateFrom}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('search.dateTo')}
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={advancedFilters.dateTo}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('search.tags')}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                placeholder={t('search.tagsPlaceholder')}
                onKeyDown={handleTagInput}
              />
              {advancedFilters.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {advancedFilters.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:text-primary-500 focus:outline-none focus:text-primary-500"
                        onClick={() => removeTag(tag)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('search.author')}
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700"
                value={advancedFilters.author}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, author: e.target.value }))}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch; 