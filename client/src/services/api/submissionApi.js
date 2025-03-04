import BaseApiService from './baseApi';
import { submissionCache } from '../../utils/cache';
import { supabase } from '../../lib/supabase';

class SubmissionApiService extends BaseApiService {
  constructor() {
    super('submissions');
  }
  
  /**
   * Get submissions for a specific template
   * @param {string} templateId - Template ID
   * @returns {Promise<Array>} - Submissions for the template
   */
  async getTemplateSubmissions(templateId) {
    const cacheKey = `template-submissions-${templateId}`;
    const cachedData = submissionCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*, profiles(name, email, avatar_url)')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cache the result
      submissionCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching template submissions:', error);
      throw error;
    }
  }
  
  /**
   * Get submissions by the current user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's submissions
   */
  async getUserSubmissions(userId) {
    const cacheKey = `user-submissions-${userId}`;
    const cachedData = submissionCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          templates:template_id (
            id,
            title,
            description
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cache the result
      submissionCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      throw error;
    }
  }
  
  /**
   * Get a single submission with details
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} - Submission with template and question details
   */
  async getSubmissionWithDetails(id) {
    const cacheKey = `submission-${id}`;
    const cachedData = submissionCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          profiles:user_id (name, email, avatar_url),
          templates:template_id (
            *,
            questions:questions (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Cache the result
      submissionCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching submission details:', error);
      throw error;
    }
  }
}

export default new SubmissionApiService(); 