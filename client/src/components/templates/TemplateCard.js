import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';

const TemplateCard = ({ template }) => {
  const { t } = useTranslation();
  
  // Add null checks
  if (!template) return null;
  
  // Destructure with default values for all properties
  const {
    id,
    title = 'Untitled Template',
    description = '',
    user = null,
    created_at = new Date().toISOString(),
    likes_count = 0,
    view_count = 0,
    tags = []
  } = template;
  
  // Format the date for display
  const formattedDate = new Date(created_at).toLocaleDateString();
  
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      <div className="p-5">
        <Link to={`/templates/${id}`} className="block">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white hover:text-primary-700 dark:hover:text-primary-400">
            {title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-gray-800 dark:text-gray-400 line-clamp-2">
          {description || t('templates.noDescription', 'No description provided')}
        </p>
        
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-700 px-5 py-3 flex items-center justify-between border-t border-gray-300 dark:border-gray-700">
        <div className="flex items-center">
          {user && (
            <>
              <div className="flex-shrink-0">
                <img 
                  className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-600"
                  src={user.avatar_url || 'https://via.placeholder.com/40'} 
                  alt={user.name || 'User'}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || t('common.anonymous', 'Anonymous')}
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-400">
                  {formattedDate}
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex space-x-4 text-sm">
          <span className="flex items-center text-gray-700 dark:text-gray-300">
            <EyeIcon className="h-4 w-4 mr-1" />
            {view_count || 0}
          </span>
          <span className="flex items-center text-gray-700 dark:text-gray-300">
            <HandThumbUpIcon className="h-4 w-4 mr-1" />
            {likes_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard; 