import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { templateService } from '../services/templateService';
import { handleError } from '../utils/errorHandler';
import TemplateForm from '../components/templates/TemplateForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TemplateEditPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplateById(id);
        
        // Check if the user is the author
        if (data.user_id !== user.id) {
          toast.error(t('templates.notAuthorized'));
          navigate('/templates');
          return;
        }
        
        setTemplate(data);
      } catch (error) {
        handleError(error, { 
          defaultMessage: t('templates.fetchDetailError')
        });
        navigate('/templates');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplate();
  }, [id, navigate, t, user.id]);

  const handleSubmit = async (formData) => {
    try {
      await templateService.updateTemplate(id, formData);
      toast.success(t('templates.updateSuccess'));
      navigate(`/templates/${id}`);
      return true;
    } catch (error) {
      handleError(error, {
        defaultMessage: t('templates.updateError')
      });
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('templates.edit')}
      </h1>
      
      {template && (
        <TemplateForm 
          initialData={template} 
          onSubmit={handleSubmit} 
          isEditing={true}
        />
      )}
    </div>
  );
};

export default TemplateEditPage; 