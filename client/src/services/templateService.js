import api from './api';
import { toast } from 'react-hot-toast';
import templateApi from './api/templateApi';

/**
 * Service for template-related API calls
 */
const templateService = {
  /**
   * Get all templates with optional filtering
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Templates and pagination data
   */
  async getTemplates(options = {}) {
    try {
      const {
        topic,
        is_public,
        user_id,
        search,
        sort_by = 'created_at',
        sort_order = 'desc',
        limit = 20,
        page = 1
      } = options;
      
      // If user_id is specified, use the templateApi to get user templates
      if (user_id) {
        const templates = await templateApi.getUserTemplates(user_id);
        return {
          templates,
          count: templates.length,
          page: 1,
          limit: templates.length,
          totalPages: 1
        };
      }
      
      // If is_public is true, use the templateApi to get public templates
      if (is_public) {
        const templates = await templateApi.getPublicTemplates(options);
        return {
          templates,
          count: templates.length,
          page: 1,
          limit: templates.length,
          totalPages: 1
        };
      }
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      const response = await api.get('/templates', {
        params: {
          topic,
          is_public,
          user_id,
          search,
          sort_by,
          sort_order,
          limit,
          offset
        }
      });
      
      return {
        templates: response.data.data || [],
        count: response.data.count || 0,
        page,
        limit,
        totalPages: Math.ceil((response.data.count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return empty array instead of throwing error for better UX
      return { templates: [], count: 0, page: 1, limit: 20, totalPages: 0 };
    }
  },
  
  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} - Template object
   */
  async getTemplate(id) {
    try {
      // Try to get the template with questions from templateApi first
      try {
        const template = await templateApi.getTemplateWithQuestions(id);
        return template;
      } catch (err) {
        // Fall back to the server API if Supabase direct access fails
        const response = await api.get(`/templates/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get a template by ID (alias for getTemplate)
   * @param {string} id - Template ID
   * @returns {Promise<Object>} - Template object
   */
  async getTemplateById(id) {
    return this.getTemplate(id);
  },
  
  /**
   * Create a new template
   * @param {Object} template - Template data
   * @returns {Promise<Object>} - Created template
   */
  async createTemplate(template) {
    try {
      const response = await api.post('/templates', template);
      toast.success('Template created successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      throw error;
    }
  },
  
  /**
   * Update a template
   * @param {string} id - Template ID
   * @param {Object} updates - Template updates
   * @returns {Promise<Object>} - Updated template
   */
  async updateTemplate(id, updates) {
    try {
      const response = await api.put(`/templates/${id}`, updates);
      toast.success('Template updated successfully!');
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      toast.error('Failed to update template');
      throw error;
    }
  },
  
  /**
   * Delete a template
   * @param {string} id - Template ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTemplate(id) {
    try {
      await api.delete(`/templates/${id}`);
      toast.success('Template deleted successfully!');
      return true;
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      toast.error('Failed to delete template');
      throw error;
    }
  },
  
  /**
   * Toggle like on a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Like status
   */
  async toggleLike(templateId) {
    try {
      // Try to use the templateApi first
      try {
        return await templateApi.toggleLike(templateId);
      } catch (err) {
        // Fall back to the server API
        const response = await api.post(`/templates/${templateId}/like`);
        return response.data;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  /**
   * Check if user has liked a template
   * @param {string} templateId - Template ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Whether user has liked the template
   */
  async hasUserLiked(templateId, userId) {
    try {
      const response = await api.get(`/templates/${templateId}/likes/${userId}`);
      return response.data.hasLiked;
    } catch (error) {
      console.error('Error checking if user liked template:', error);
      return false;
    }
  },
  
  /**
   * Get popular templates
   * @param {number} limit - Number of templates to return
   * @returns {Promise<Array>} - Array of popular templates
   */
  async getPopularTemplates(limit = 5) {
    try {
      const response = await api.get('/templates/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      // Return empty array instead of throwing error
      return { templates: [] };
    }
  },
  
  /**
   * Get templates by category
   * @param {string} category - Category name
   * @param {number} limit - Number of templates to return
   * @returns {Promise<Array>} - Array of templates
   */
  async getTemplatesByCategory(category, limit = 10) {
    try {
      const response = await api.get(`/templates/category/${category}`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      return { templates: [] };
    }
  },
  
  /**
   * Get latest templates
   * @returns {Promise<Array>} - Array of latest templates
   */
  async getLatestTemplates() {
    try {
      const response = await api.get('/templates/latest');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest templates:', error);
      // Return empty array instead of throwing error
      return { templates: [] };
    }
  },
  
  /**
   * Search templates
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Array of matching templates
   */
  async searchTemplates(query) {
    try {
      const response = await api.get('/templates/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching templates:', error);
      return { templates: [] };
    }
  },

  /**
   * Submit a form response
   * @param {string} templateId - Template ID
   * @param {Object} formData - Form data
   * @returns {Promise<Object>} - Submission result
   */
  async submitForm(templateId, formData) {
    try {
      const response = await api.post(`/templates/${templateId}/submit`, formData);
      return response.data;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  },

  /**
   * Get template tags
   * @returns {Promise<Array>} - Array of tags
   */
  async getTags() {
    try {
      const response = await api.get('/templates/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
};

// Export both as default and named export for backward compatibility
export { templateService };
export default templateService; 