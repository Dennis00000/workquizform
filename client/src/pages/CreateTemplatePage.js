import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { templateService } from '../services/templateService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import QuestionBuilder from '../components/templates/QuestionBuilder';
import TagInput from '../components/ui/TagInput';
import { handleError } from '../utils/errorHandler';

const CreateTemplatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    is_public: true,
    tags: [],
    questions: []
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleTagsChange = (tags) => {
    setTemplate(prev => ({ ...prev, tags }));
  };
  
  const handleQuestionsChange = (questions) => {
    setTemplate(prev => ({ ...prev, questions }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!template.title.trim()) {
      toast.error(t('templates.titleRequired'));
      return;
    }
    
    if (template.questions.length === 0) {
      toast.error(t('templates.questionsRequired'));
      return;
    }
    
    try {
      setLoading(true);
      
      const templateData = {
        ...template,
        user_id: user.uid
      };
      
      const createdTemplate = await templateService.createTemplate(templateData);
      
      toast.success(t('templates.createSuccess'));
      navigate(`/templates/${createdTemplate.id}`);
    } catch (err) {
      handleError(err, {
        defaultMessage: t('templates.createError')
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl">
            {t('templates.createNew')}
          </h1>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('templates.title')} *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={template.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('templates.titlePlaceholder')}
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('templates.description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={template.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={t('templates.descriptionPlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('templates.tags')}
              </label>
              <TagInput
                tags={template.tags}
                onChange={handleTagsChange}
                placeholder={t('templates.tagsPlaceholder')}
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_public"
                name="is_public"
                type="checkbox"
                checked={template.is_public}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded"
              />
              <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('templates.makePublic')}
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('templates.questions')} *
          </h2>
          
          <QuestionBuilder
            questions={template.questions}
            onChange={handleQuestionsChange}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              t('templates.create')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplatePage; 