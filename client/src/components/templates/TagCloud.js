import React from 'react';
import { useTranslation } from 'react-i18next';

const TagCloud = ({ tags, onTagClick }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagClick(tag)}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {tag.name}
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            {tag.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TagCloud; 