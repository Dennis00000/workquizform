import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PencilIcon, TrashIcon, ArrowLeftIcon, DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { templateService } from '../services/templateService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { handleError } from '../utils/errorHandler';
import { formatDistanceToNow } from 'date-fns';

const TemplateDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await templateService.getTemplate(id);
        
        if (!data) {
          setError(new Error('Template not found'));
          return;
        }
        
        setTemplate(data);
        setLikesCount(data.likes_count || 0);
        setViewCount(data.view_count || 0);
        
        // Check if user has liked this template
        if (isAuthenticated && user) {
          const hasLiked = await templateService.hasUserLiked(id, user.uid);
          setLiked(hasLiked);
        }
      } catch (err) {
        handleError(err, {
          defaultMessage: t('templates.fetchError')
        });
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplate();
  }, [id, isAuthenticated, user, t]);
  
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired'));
      return;
    }
    
    try {
      const isNowLiked = await templateService.toggleLike(id);
      setLiked(isNowLiked);
      setLikesCount(prev => isNowLiked ? prev + 1 : prev - 1);
      
      toast.success(isNowLiked ? t('templates.liked') : t('templates.unliked'));
    } catch (err) {
      handleError(err, {
        defaultMessage: t('templates.likeError')
      });
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      setLoading(true);
      
      await templateService.deleteTemplate(id);
      
      toast.success(t('templates.deleteSuccess'));
      navigate('/templates');
    } catch (err) {
      handleError(err, {
        defaultMessage: t('templates.deleteError')
      });
      setLoading(false);
    }
  };
  
  const handleDuplicate = async () => {
    if (!isAuthenticated) {
      toast.error(t('auth.loginRequired'));
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the template with a new title
      const { id: templateId, created_at, updated_at, user_id, ...templateData } = template;
      
      const newTemplate = {
        ...templateData,
        title: `${template.title} (${t('templates.copy')})`,
        user_id: user.uid,
        is_public: false // Make the copy private by default
      };
      
      const createdTemplate = await templateService.createTemplate(newTemplate);
      
      toast.success(t('templates.duplicateSuccess'));
      navigate(`/templates/${createdTemplate.id}`);
    } catch (err) {
      handleError(err, {
        defaultMessage: t('templates.duplicateError')
      });
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          {t('templates.notFound')}
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {t('templates.notFoundDescription')}
        </p>
        <Link
          to="/templates"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {t('templates.backToTemplates')}
        </Link>
      </div>
    );
  }
  
  const isOwner = isAuthenticated && user && template.user_id === user.uid;
  const formattedDate = template.created_at 
    ? formatDistanceToNow(new Date(template.created_at), { addSuffix: true })
    : '';
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/templates"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          {t('templates.backToTemplates')}
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {template.title}
            </h1>
            
            <div className="mt-1 flex items-center">
              {template.user && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <img
                    src={template.user.avatar_url || 'https://via.placeholder.com/40'}
                    alt={template.user.name || 'User'}
                    className="h-6 w-6 rounded-full mr-2"
                  />
                  <span>{template.user.name || t('common.anonymous')}</span>
                  <span className="mx-2">•</span>
                </div>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
              {template.is_public ? (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {t('templates.public')}
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {t('templates.private')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLikeToggle}
              className={`inline-flex items-center p-1.5 border border-transparent rounded-full ${
                liked
                  ? 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400'
                  : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              aria-label={liked ? t('templates.unlike') : t('templates.like')}
            >
              {liked ? (
                <HeartSolid className="h-6 w-6" />
              ) : (
                <HeartOutline className="h-6 w-6" />
              )}
              <span className="ml-1 text-sm">{likesCount}</span>
            </button>
            
            <div className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500">
              <EyeIcon className="h-6 w-6" />
              <span className="ml-1 text-sm">{viewCount}</span>
            </div>
            
            {isOwner && (
              <>
                <Link
                  to={`/templates/${id}/edit`}
                  className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label={t('templates.edit')}
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  className={`inline-flex items-center p-1.5 border border-transparent rounded-md ${
                    deleteConfirm
                      ? 'text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400'
                      : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  aria-label={t('templates.delete')}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </>
            )}
            
            <button
              onClick={handleDuplicate}
              className="inline-flex items-center p-1.5 border border-transparent rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label={t('templates.duplicate')}
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          {template.description && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('templates.description')}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {template.description}
              </p>
            </div>
          )}
          
          {template.tags && template.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('templates.tags')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('templates.questions')}
            </h2>
            
            {template.questions && template.questions.length > 0 ? (
              <div className="space-y-6">
                {template.questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        {index + 1}.
                      </span>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {question.text}
                        {question.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </h3>
                    </div>
                    
                    <div className="ml-6">
                      {question.type === 'text' && (
                        <input
                          type="text"
                          disabled
                          placeholder={t('questions.textAnswer')}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm opacity-75"
                        />
                      )}
                      
                      {question.type === 'paragraph' && (
                        <textarea
                          disabled
                          rows={3}
                          placeholder={t('questions.paragraphAnswer')}
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm opacity-75"
                        />
                      )}
                      
                      {question.type === 'multiple_choice' && (
                        <div className="mt-2 space-y-2">
                          {(question.options || []).map((option, optIndex) => (
                            <div key={option.id || optIndex} className="flex items-center">
                              <input
                                type="radio"
                                disabled
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                              />
                              <label className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                {option.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'checkbox' && (
                        <div className="mt-2 space-y-2">
                          {(question.options || []).map((option, optIndex) => (
                            <div key={option.id || optIndex} className="flex items-center">
                              <input
                                type="checkbox"
                                disabled
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                              />
                              <label className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                {option.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'dropdown' && (
                        <select
                          disabled
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm opacity-75"
                        >
                          <option value="">{t('questions.selectOption')}</option>
                          {(question.options || []).map((option, optIndex) => (
                            <option key={option.id || optIndex} value={option.id || optIndex}>
                              {option.text}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {question.type === 'scale' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between max-w-md">
                            <span className="text-sm text-gray-500 dark:text-gray-400">1</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            disabled
                            className="mt-1 w-full max-w-md"
                          />
                        </div>
                      )}
                      
                      {question.type === 'date' && (
                        <input
                          type="date"
                          disabled
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm opacity-75"
                        />
                      )}
                      
                      {question.type === 'time' && (
                        <input
                          type="time"
                          disabled
                          className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm opacity-75"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                {t('templates.noQuestions')}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Link
          to="/templates"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t('templates.backToTemplates')}
        </Link>
        
        <div className="flex space-x-3">
          {isOwner && (
            <Link
              to={`/templates/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              {t('templates.edit')}
            </Link>
          )}
          
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
            {t('templates.duplicate')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage; 