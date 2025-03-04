import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplateById, updateTemplate, deleteTemplate } from '../store/templateSlice';
import { useAuth } from '../contexts/AuthContext';
import { performanceMonitor } from '../utils/performance';
import interactionService from '../services/interactionService';
import { templateService } from '../services/templateService';
import { handleApiError } from '../utils/errorHandler';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FormRenderer from '../components/forms/FormRenderer';
import Button from '../components/common/Button';

/**
 * Custom hook for template page functionality
 * @returns {Object} Template page state and handlers
 */
const useTemplatePage = () => {
  const { t } = useTranslation();
  const { templateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    fields: []
  });
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Get template from Redux store
  const { currentTemplate, isLoading, error } = useSelector(state => state.templates);
  
  // Fetch template data
  useEffect(() => {
    const perfKey = performanceMonitor.startPageLoad('TemplatePage');
    
    dispatch(fetchTemplateById(templateId))
      .unwrap()
      .then(() => {
        // Track page view
        interactionService.trackPageView(`/templates/${templateId}`, {
          templateId,
          source: document.referrer
        });
        
        performanceMonitor.endPageLoad(perfKey, true);
      })
      .catch((error) => {
        console.error('Error fetching template:', error);
        performanceMonitor.endPageLoad(perfKey, false);
      });
      
    return () => {
      // Cleanup if needed
    };
  }, [templateId, dispatch]);
  
  // Update form data when template changes
  useEffect(() => {
    if (currentTemplate) {
      setFormData({
        title: currentTemplate.title || '',
        description: currentTemplate.description || '',
        category: currentTemplate.category || '',
        isPublic: currentTemplate.is_public ?? true,
        fields: currentTemplate.fields || []
      });
    }
  }, [currentTemplate]);
  
  // Check if user is the owner of the template
  const isOwner = currentTemplate && user && currentTemplate.user_id === user.id;
  
  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);
  
  // Handle field changes
  const handleFieldChange = useCallback((index, field) => {
    setFormData(prev => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = field;
      return { ...prev, fields: updatedFields };
    });
  }, []);
  
  // Add a new field
  const addField = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: `field_${Date.now()}`,
          type: 'text',
          label: '',
          placeholder: '',
          required: false,
          options: []
        }
      ]
    }));
  }, []);
  
  // Remove a field
  const removeField = useCallback((index) => {
    setFormData(prev => {
      const updatedFields = [...prev.fields];
      updatedFields.splice(index, 1);
      return { ...prev, fields: updatedFields };
    });
  }, []);
  
  // Move field up or down
  const moveField = useCallback((index, direction) => {
    setFormData(prev => {
      const updatedFields = [...prev.fields];
      if (direction === 'up' && index > 0) {
        [updatedFields[index], updatedFields[index - 1]] = [updatedFields[index - 1], updatedFields[index]];
      } else if (direction === 'down' && index < updatedFields.length - 1) {
        [updatedFields[index], updatedFields[index + 1]] = [updatedFields[index + 1], updatedFields[index]];
      }
      return { ...prev, fields: updatedFields };
    });
  }, []);
  
  // Save template changes
  const saveTemplate = useCallback(async () => {
    if (!formData.title.trim()) {
      toast.error(t('templates.titleRequired'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Track interaction
      interactionService.trackEvent('template_save', 'save_button', {
        templateId,
        fieldCount: formData.fields.length
      });
      
      await dispatch(updateTemplate({
        id: templateId,
        template: {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          is_public: formData.isPublic,
          fields: formData.fields
        }
      })).unwrap();
      
      toast.success(t('templates.saveSuccess'));
      setIsEditing(false);
    } catch (error) {
      toast.error(t('templates.saveError'));
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, formData, templateId, t]);
  
  // Delete template
  const handleDeleteTemplate = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      // Track interaction
      interactionService.trackEvent('template_delete', 'delete_button', {
        templateId
      });
      
      await dispatch(deleteTemplate(templateId)).unwrap();
      
      toast.success(t('templates.deleteSuccess'));
      navigate('/dashboard/templates');
    } catch (error) {
      toast.error(t('templates.deleteError'));
      console.error('Error deleting template:', error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
    }
  }, [dispatch, templateId, navigate, t]);
  
  // Create submission URL
  const getSubmissionUrl = useCallback(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/submit/${templateId}`;
  }, [templateId]);
  
  // Copy submission URL to clipboard
  const copySubmissionUrl = useCallback(() => {
    const url = getSubmissionUrl();
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success(t('templates.urlCopied'));
        
        // Track interaction
        interactionService.trackEvent('copy_submission_url', 'copy_button', {
          templateId
        });
      })
      .catch(() => {
        toast.error(t('templates.urlCopyError'));
      });
  }, [getSubmissionUrl, templateId, t]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplate(templateId);
        setTemplate(data);
      } catch (error) {
        handleApiError(error, 'Failed to load template');
        navigate('/templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, navigate]);

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
    // Clear errors when user makes changes
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Basic validation
    if (template?.fields) {
      template.fields.forEach(field => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label || 'This field'} is required`;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Submit the form data
      await templateService.submitForm(templateId, formData);
      
      toast.success('Form submitted successfully!');
      
      // Redirect to success page or clear form
      setFormData({});
      navigate(`/templates/${templateId}/success`);
    } catch (error) {
      handleApiError(error, 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!template) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Template Not Found</h2>
          <p className="mt-2 text-gray-600">The template you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6" 
            onClick={() => navigate('/templates')}
          >
            Browse Templates
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.title}</h1>
        {template.description && (
          <p className="text-gray-600 mb-8">{template.description}</p>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <FormRenderer 
              fields={template.fields || []}
              values={formData}
              errors={errors}
              onChange={handleFormChange}
            />
            
            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                className="mr-4"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default useTemplatePage; 