import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { templateService } from '../services/templateService';
import TemplateCard from '../components/templates/TemplateCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PlusIcon, DocumentPlusIcon, FireIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TemplatesPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let options = {
          limit,
          page,
          sort_by: 'created_at',
          sort_order: 'desc'
        };

        // Apply filters based on active tab
        if (activeTab === 'all') {
          options.is_public = true;
        } else if (activeTab === 'popular') {
          options.is_public = true;
          options.sort_by = 'likes_count';
        } else if (activeTab === 'search' && searchQuery) {
          options.is_public = true;
          options.search = searchQuery;
        } else if (activeTab === 'my' && isAuthenticated && user) {
          options.user_id = user.id;
        }

        const result = await templateService.getTemplates(options);
        
        if (page === 1) {
          setTemplates(result.templates);
        } else {
          setTemplates(prev => [...prev, ...result.templates]);
        }
        
        setTotalPages(result.totalPages);
        setHasMore(page < result.totalPages);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [activeTab, searchQuery, page, isAuthenticated, user, limit]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    
    if (!query) {
      return;
    }
    
    setSearchQuery(query);
    setActiveTab('search');
    setPage(1);
  };
  
  const loadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl">
            {t('templates.title', 'Form Templates')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('templates.description', 'Browse and use our collection of form templates or create your own.')}
          </p>
        </div>
        
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {isAuthenticated && (
            <Link
              to="/templates/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              {t('templates.createNew', 'Create Template')}
            </Link>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleSearch} className="max-w-lg">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder={t('templates.searchPlaceholder', 'Search templates...')}
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" />
              {t('common.search', 'Search')}
            </button>
          </div>
        </form>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            {t('templates.allTemplates', 'All Templates')}
          </button>
          <button
            onClick={() => { setActiveTab('popular'); setPage(1); }}
            className={`${
              activeTab === 'popular'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
          >
            <FireIcon className="mr-2 h-5 w-5" />
            {t('templates.popularTemplates', 'Popular Templates')}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => { setActiveTab('my'); setPage(1); }}
              className={`${
                activeTab === 'my'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
            >
              <UserIcon className="mr-2 h-5 w-5" />
              {t('templates.myTemplates', 'My Templates')}
            </button>
          )}
          {activeTab === 'search' && searchQuery && (
            <button
              className="border-primary-500 text-primary-600 dark:text-primary-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center"
            >
              <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
              {t('templates.searchResults', 'Search Results')}
            </button>
          )}
        </nav>
      </div>
      
      {loading && page === 1 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400">
            {error}
          </p>
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
          >
            {t('common.retry', 'Try Again')}
          </button>
        </div>
      ) : templates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  t('common.loadMore', 'Load More Templates')
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'search' && searchQuery 
              ? t('templates.noSearchResults', 'No templates found matching your search.') 
              : activeTab === 'my'
                ? t('templates.noMyTemplates', 'You haven\'t created any templates yet.')
                : t('templates.noTemplatesAvailable', 'No templates available at the moment.')}
          </p>
          
          {activeTab === 'my' && (
            <Link
              to="/templates/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              {t('templates.createFirst', 'Create Your First Template')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplatesPage; 