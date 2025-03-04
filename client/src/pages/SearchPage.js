import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, you would call your API
        // For now, we'll simulate a search
        // const response = await api.get(`/templates/search?q=${encodeURIComponent(query)}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock results
        const mockResults = Array(5).fill(null).map((_, index) => ({
          id: `template-${index}`,
          title: `${query} Template ${index + 1}`,
          description: `This is a sample template matching "${query}"`,
          author: {
            name: `User ${index + 1}`,
            id: `user-${index + 1}`
          },
          createdAt: new Date().toISOString(),
          tags: ['sample', query.toLowerCase(), 'template']
        }));
        
        setResults(mockResults);
      } catch (error) {
        setError(error.message || 'Failed to search templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t('search.title')}
        </h1>
        <SearchBar initialValue={query} />
      </div>
      
      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('search.resultsCount', { count: results.length })}
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {template.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>By: {template.author.name}</span>
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('search.noResults', { query })}
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('search.enterQuery')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 