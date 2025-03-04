import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import TemplateCard from '../templates/TemplateCard';
import SearchBar from './SearchBar';
import SearchFilters from './SearchFilters';
import { toast } from 'react-hot-toast';
import { FunnelIcon } from '@heroicons/react/24/outline';

const SearchResults = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState({ templates: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page')) || 1;
  const topic = searchParams.get('topic');
  const tags = searchParams.get('tags')?.split(',');
  const sort = searchParams.get('sort') || 'relevance';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get('/search/templates', {
          params: {
            q: query,
            page,
            topic,
            tags: tags?.join(','),
            sort
          }
        });
        setResults(response.data);
      } catch (error) {
        toast.error(t('search.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, topic, tags, sort, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {query 
            ? t('search.resultsFor', { query })
            : t('search.allTemplates')}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({results.total} {t('search.results')})
          </span>
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
        >
          <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" />
          {t('search.filters')}
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {showFilters && (
          <aside className="lg:col-span-3">
            <SearchFilters
              currentTopic={topic}
              currentTags={tags}
              currentSort={sort}
            />
          </aside>
        )}

        <main className={`${showFilters ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : results.templates.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t('search.noResults')}
              </p>
            </div>
          )}

          {results.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {[...Array(results.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', i + 1);
                      window.history.pushState({}, '', `?${newParams.toString()}`);
                    }}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i + 1
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults; 