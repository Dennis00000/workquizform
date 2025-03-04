import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { TagInput } from '../common/TagInput';

const TOPICS = ['Education', 'Quiz', 'Other'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'search.sortByRelevance' },
  { value: 'newest', label: 'search.sortByNewest' },
  { value: 'popular', label: 'search.sortByPopular' }
];

const SearchFilters = ({ currentTopic, currentTags, currentSort }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page when filters change
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('search.topic')}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="topic-all"
              name="topic"
              checked={!currentTopic}
              onChange={() => updateFilter('topic', null)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label htmlFor="topic-all" className="ml-2 text-gray-700 dark:text-gray-300">
              {t('search.allTopics')}
            </label>
          </div>
          {TOPICS.map(topic => (
            <div key={topic} className="flex items-center">
              <input
                type="radio"
                id={`topic-${topic}`}
                name="topic"
                checked={currentTopic === topic}
                onChange={() => updateFilter('topic', topic)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor={`topic-${topic}`} className="ml-2 text-gray-700 dark:text-gray-300">
                {t(`templates.topics.${topic.toLowerCase()}`)}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('search.tags')}
        </h3>
        <TagInput
          value={currentTags || []}
          onChange={(tags) => updateFilter('tags', tags.join(','))}
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('search.sortBy')}
        </h3>
        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchFilters; 