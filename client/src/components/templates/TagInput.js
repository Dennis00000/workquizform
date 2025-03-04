import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const TagInput = ({ label, tags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
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

  // Convert string to array if needed
  const tagsArray = typeof tags === 'string' 
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : tags;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div className="flex flex-wrap gap-2 mb-2">
        {tagsArray.map((tag, index) => (
          <div 
            key={index}
            className="flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-md text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={addTag}
          placeholder="Add tags..."
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add a tag
      </p>
    </div>
  );
};

export default TagInput; 