import api from './api';

/**
 * Service for tracking form analytics
 */
class AnalyticsService {
  /**
   * Track a form view
   * @param {string} templateId - Template ID
   * @param {Object} metadata - Additional metadata
   */
  async trackFormView(templateId, metadata = {}) {
    try {
      await api.post('/analytics/form-view', {
        templateId,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Failed to track form view:', error);
    }
  }

  /**
   * Track a form submission
   * @param {string} templateId - Template ID
   * @param {Object} metadata - Additional metadata
   */
  async trackFormSubmission(templateId, metadata = {}) {
    try {
      await api.post('/analytics/form-submission', {
        templateId,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Failed to track form submission:', error);
    }
  }

  /**
   * Track a form field interaction
   * @param {string} templateId - Template ID
   * @param {string} fieldId - Field ID
   * @param {string} action - Interaction type (focus, blur, change)
   * @param {Object} metadata - Additional metadata
   */
  async trackFieldInteraction(templateId, fieldId, action, metadata = {}) {
    try {
      await api.post('/analytics/field-interaction', {
        templateId,
        fieldId,
        action,
        timestamp: new Date().toISOString(),
        ...metadata
      });
    } catch (error) {
      console.error('Failed to track field interaction:', error);
    }
  }

  /**
   * Get form analytics data
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Analytics data
   */
  async getFormAnalytics(templateId) {
    try {
      const response = await api.get(`/analytics/form/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get form analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService; 