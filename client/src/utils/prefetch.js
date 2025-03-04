import templateApi from '../services/api/templateApi';
import submissionApi from '../services/api/submissionApi';
import { userApi } from '../services/api/userApi';

/**
 * Utility for prefetching resources
 */
class PrefetchService {
  /**
   * Prefetch common application data
   * @param {string} userId - Current user ID (optional)
   */
  async prefetchCommonData(userId = null) {
    // Create an array of promises for parallel fetching
    const promises = [
      templateApi.getPublicTemplates(), // Prefetch public templates
    ];
    
    // If user is logged in, prefetch user-specific data
    if (userId) {
      promises.push(
        userApi.getUserProfile(userId),
        templateApi.getUserTemplates(userId),
        submissionApi.getUserSubmissions(userId)
      );
    }
    
    // Execute all prefetch operations in parallel
    return Promise.allSettled(promises);
  }
  
  /**
   * Prefetch template data including all related resources
   * @param {string} templateId - Template ID
   */
  async prefetchTemplateData(templateId) {
    return Promise.allSettled([
      templateApi.getTemplateWithQuestions(templateId),
      submissionApi.getTemplateSubmissions(templateId)
    ]);
  }
  
  /**
   * Prefetch resources for specific routes
   * @param {string} route - Route path
   * @param {Object} params - Route parameters
   * @param {string} userId - Current user ID (optional)
   */
  async prefetchForRoute(route, params = {}, userId = null) {
    if (route.startsWith('/templates')) {
      if (params.id) {
        return this.prefetchTemplateData(params.id);
      } else {
        return templateApi.getPublicTemplates();
      }
    } else if (route.startsWith('/submissions') && params.id) {
      return submissionApi.getSubmissionWithDetails(params.id);
    } else if (route === '/dashboard' && userId) {
      return Promise.allSettled([
        templateApi.getUserTemplates(userId),
        submissionApi.getUserSubmissions(userId)
      ]);
    }
    
    return null;
  }
}

export const prefetchService = new PrefetchService(); 