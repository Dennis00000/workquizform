import BaseApiService from './baseApi';
import { templateCache } from '../../utils/cache';
import { supabase } from '../../lib/supabase';

class TemplateApiService extends BaseApiService {
  constructor() {
    super('templates');
  }
  
  /**
   * Get public templates
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Public templates
   */
  async getPublicTemplates(options = {}) {
    const cacheKey = 'public-templates';
    const cachedData = templateCache.get(cacheKey);
    
    if (cachedData && !options.skipCache) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          categories:template_categories (
            categories (id, name, slug)
          ),
          likes:template_likes (count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to flatten structure
      const processed = data.map(template => ({
        ...template,
        likes: template.likes.length ? parseInt(template.likes[0].count) : 0,
        categories: template.categories.map(c => c.categories)
      }));
      
      // Cache the result
      templateCache.set(cacheKey, processed);
      
      return processed;
    } catch (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }
  }
  
  /**
   * Get templates created by a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's templates
   */
  async getUserTemplates(userId) {
    const cacheKey = `user-templates-${userId}`;
    const cachedData = templateCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          categories:template_categories (
            categories (id, name, slug)
          ),
          likes:template_likes (count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data
      const processed = data.map(template => ({
        ...template,
        likes: template.likes.length ? parseInt(template.likes[0].count) : 0,
        categories: template.categories.map(c => c.categories)
      }));
      
      // Cache the result
      templateCache.set(cacheKey, processed);
      
      return processed;
    } catch (error) {
      console.error('Error fetching user templates:', error);
      throw error;
    }
  }
  
  /**
   * Get a template by ID with all related data
   * @param {string} id - Template ID
   * @returns {Promise<Object>} - Template with questions
   */
  async getTemplateWithQuestions(id) {
    const cacheKey = `template-${id}`;
    const cachedData = templateCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          questions (*),
          profiles:user_id (name, avatar_url),
          categories:template_categories (
            categories (id, name, slug)
          ),
          likes:template_likes (user_id)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Process the data
      const processed = {
        ...data,
        questions: data.questions.sort((a, b) => a.order - b.order),
        categories: data.categories.map(c => c.categories),
        likes: data.likes.length
      };
      
      // Cache the result
      templateCache.set(cacheKey, processed);
      
      return processed;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }
  
  /**
   * Toggle like status for a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Updated like count
   */
  async toggleLike(templateId) {
    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        template_id: templateId
      });
      
      if (error) throw error;
      
      // Invalidate caches
      templateCache.delete(`template-${templateId}`);
      templateCache.delete('public-templates');
      
      return data;
    } catch (error) {
      console.error('Error toggling template like:', error);
      throw error;
    }
  }
}

const templateApiInstance = new TemplateApiService();
export default templateApiInstance; 