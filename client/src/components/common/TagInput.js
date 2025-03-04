import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const TagInput = ({ value = [], onChange }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/tags/suggest?q=${input}`);
        setSuggestions(response.data.filter(tag => !value.includes(tag)));
      } catch (error) {
        console.error('Failed to fetch tag suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [input, value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onChange([...value, input.trim()]);
        setInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('common.tags')}
      </label>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('common.addTag')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
        />
        {loading && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
          </div>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => {
                  onChange([...value, suggestion]);
                  setInput('');
                  setSuggestions([]);
                }}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-800 py-0.5 pl-2.5 pr-1 text-sm font-medium text-primary-700 dark:text-primary-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:bg-primary-500 focus:text-white focus:outline-none dark:hover:bg-primary-700"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}; 