import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../ui/LoadingSpinner';

const TemplateManagement = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        // const response = await api.get('/admin/templates');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockTemplates = Array(10).fill(null).map((_, index) => ({
          id: `template-${index}`,
          title: `Template ${index + 1}`,
          author: {
            id: `user-${index % 5}`,
            name: `User ${index % 5 + 1}`
          },
          status: index % 3 === 0 ? 'draft' : 'published',
          createdAt: new Date(Date.now() - index * 86400000).toISOString(),
          questionsCount: Math.floor(Math.random() * 10) + 1
        }));
        
        setTemplates(mockTemplates);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch templates');
        toast.error(t('admin.error.fetchTemplates'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [t]);

  const handleStatusChange = async (templateId, newStatus) => {
    try {
      // In a real app, you would update via API
      // await api.patch(`/admin/templates/${templateId}`, { status: newStatus });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, status: newStatus } 
          : template
      ));
      
      toast.success(t('admin.success.updateTemplateStatus'));
    } catch (error) {
      toast.error(t('admin.error.updateTemplateStatus'));
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm(t('admin.confirmDeleteTemplate'))) {
      try {
        // In a real app, you would delete via API
        // await api.delete(`/admin/templates/${templateId}`);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setTemplates(templates.filter(template => template.id !== templateId));
        
        toast.success(t('admin.success.deleteTemplate'));
      } catch (error) {
        toast.error(t('admin.error.deleteTemplate'));
      }
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('admin.templates.title')}
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.title')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.author')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.created')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.questions')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('admin.templates.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {template.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {template.author.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    template.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                  }`}>
                    {template.status === 'published' 
                      ? t('admin.templates.statusPublished') 
                      : t('admin.templates.statusDraft')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(template.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {template.questionsCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {template.status === 'draft' ? (
                      <button
                        onClick={() => handleStatusChange(template.id, 'published')}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        {t('admin.templates.publish')}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(template.id, 'draft')}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        {t('admin.templates.unpublish')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t('admin.templates.delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemplateManagement; 