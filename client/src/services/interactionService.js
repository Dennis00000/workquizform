import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';
import { performanceMonitor } from '../utils/performance';

/**
 * Service for tracking user interactions and analytics
 */
class InteractionService {
  /**
   * Track a page view
   * @param {string} path - The page path
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} - Promise with tracking result
   */
  async trackPageView(path, metadata = {}) {
    try {
      const perfKey = performanceMonitor.startInteraction('pageView', path);
      
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_page_views')
        .insert([
          {
            path,
            user_id: user?.id || null,
            session_id: this.getSessionId(),
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            metadata,
            created_at: new Date().toISOString()
          }
        ]);
      
      performanceMonitor.endInteraction(perfKey, !error);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track page view:', error);
      // Don't throw here to prevent affecting user experience
      return { success: false, error };
    }
  }
  
  /**
   * Track a user event (click, form submission, etc.)
   * @param {string} eventType - Type of event
   * @param {string} elementId - ID of the element (if applicable)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} - Promise with tracking result
   */
  async trackEvent(eventType, elementId = null, metadata = {}) {
    try {
      const perfKey = performanceMonitor.startInteraction('event', eventType);
      
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert([
          {
            event_type: eventType,
            element_id: elementId,
            user_id: user?.id || null,
            session_id: this.getSessionId(),
            path: window.location.pathname,
            metadata,
            created_at: new Date().toISOString()
          }
        ]);
      
      performanceMonitor.endInteraction(perfKey, !error);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track event:', error);
      // Don't throw here to prevent affecting user experience
      return { success: false, error };
    }
  }
  
  /**
   * Track form interactions
   * @param {string} formId - ID of the form
   * @param {string} action - Action performed (start, submit, error)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise} - Promise with tracking result
   */
  async trackFormInteraction(formId, action, metadata = {}) {
    try {
      const perfKey = performanceMonitor.startInteraction('form', `${formId}:${action}`);
      
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_form_interactions')
        .insert([
          {
            form_id: formId,
            action,
            user_id: user?.id || null,
            session_id: this.getSessionId(),
            path: window.location.pathname,
            metadata,
            created_at: new Date().toISOString()
          }
        ]);
      
      performanceMonitor.endInteraction(perfKey, !error);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to track form interaction:', error);
      // Don't throw here to prevent affecting user experience
      return { success: false, error };
    }
  }
  
  /**
   * Get a unique session ID
   * @returns {string} - Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Get user analytics data (for authenticated users)
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user analytics data
   */
  async getUserAnalytics(userId) {
    try {
      // This would typically be a server-side aggregation
      // For now, we'll simulate with a basic query
      const { data, error } = await supabase
        .from('analytics_page_views')
        .select('path, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to fetch user analytics');
    }
  }

  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('name, count')
      .order('count', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async likeTemplate(templateId) {
    const { data, error } = await supabase
      .from('template_likes')
      .insert([{ template_id: templateId }]);

    if (error) throw error;
    return data;
  }

  async unlikeTemplate(templateId) {
    const { error } = await supabase
      .from('template_likes')
      .delete()
      .match({ template_id: templateId });

    if (error) throw error;
  }

  async addComment(templateId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ template_id: templateId, content }]);

    if (error) throw error;
    return data[0];
  }

  async getComments(templateId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(name, avatar_url)
      `)
      .eq('template_id', templateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .match({ id: commentId });

    if (error) throw error;
  }
}

export default new InteractionService(); 