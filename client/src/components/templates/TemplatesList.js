import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { templateService } from '../../services/templateService';
import TemplateCard from './TemplateCard';
import LoadingSpinner from '../ui/LoadingSpinner';

const TemplatesList = ({ isPublic = true }) => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  
  const fetchTemplates = async (pageNum) => {
    try {
      setLoading(true);
      const offset = (pageNum - 1) * limit;
      const data = await templateService.getTemplates({
        isPublic,
        limit,
        offset,
        sortBy: JSON.stringify({ column: 'created_at', order: 'desc' })
      });
      
      if (pageNum === 1) {
        setTemplates(data);
      } else {
        setTemplates(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(t('templates.fetchError'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates(1);
  }, [isPublic]);
  
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(nextPage);
  };
  
  return (
    <div className="space-y-6">
      {templates.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {isPublic ? t('templates.noPublicTemplates') : t('templates.noUserTemplates')}
          </p>
          {!isPublic && (
            <Link
              to="/templates/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('templates.createNew')}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          
          {loading && (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="lg" />
            </div>
          )}
          
          {hasMore && !loading && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {t('common.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplatesList; 