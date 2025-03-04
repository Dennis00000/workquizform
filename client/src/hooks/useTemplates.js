import { useState, useCallback } from 'react';
import { templateService } from '../services/templateService';
import { handleError } from '../utils/errorHandler';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

export const useTemplates = () => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getTemplates(filters);
      setTemplates(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = async (templateData) => {
    try {
      setLoading(true);
      const result = await templateService.createTemplate(templateData);
      toast.success(t('templates.createSuccess'));
      return result;
    } catch (error) {
      handleError(error, {
        defaultMessage: t('templates.createError')
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id, templateData) => {
    try {
      setLoading(true);
      const result = await templateService.updateTemplate(id, templateData);
      toast.success(t('templates.updateSuccess'));
      return result;
    } catch (error) {
      handleError(error, {
        defaultMessage: t('templates.updateError')
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    try {
      setLoading(true);
      await templateService.deleteTemplate(id);
      toast.success(t('templates.deleteSuccess'));
    } catch (error) {
      handleError(error, {
        defaultMessage: t('templates.deleteError')
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getTemplateById(id);
      setTemplate(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    template,
    loading,
    error,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}; 