import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TagInput = ({ tags = [], onChange, placeholder = 'Add tags...' }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      onChange(newTags);
      setInputValue('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };
  
  return (
    <div className="mt-1">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-primary-400 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 focus:outline-none"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex rounded-md shadow-sm">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className="flex-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add a tag
      </p>
    </div>
  );
};

export default TagInput; 