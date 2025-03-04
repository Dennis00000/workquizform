import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

/**
 * Service for submission-related API calls
 */
const submissionService = {
  /**
   * Get all submissions for a template
   * @param {string} templateId - Template ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} - Submissions array
   */
  async getSubmissions(templateId, options = {}) {
    try {
      const {
        sort_by = 'created_at',
        sort_order = 'desc',
        limit = 20,
        page = 1
      } = options;
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Start building the query
      let query = supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('template_id', templateId);
      
      // Apply sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      return { 
        submissions: data || [], 
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      handleSupabaseError(error, 'Failed to fetch submissions');
      throw error;
    }
  },
  
  /**
   * Get a submission by ID
   * @param {string} id - Submission ID
   * @returns {Promise<Object>} - Submission object
   */
  async getSubmission(id) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to fetch submission');
      throw error;
    }
  },
  
  /**
   * Create a new submission
   * @param {Object} submission - Submission data
   * @returns {Promise<Object>} - Created submission
   */
  async createSubmission(submission) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert(submission)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to create submission');
      throw error;
    }
  },
  
  /**
   * Delete a submission
   * @param {string} id - Submission ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteSubmission(id) {
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Failed to delete submission');
      throw error;
    }
  },
  
  /**
   * Get submission statistics for a template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Submission statistics
   */
  async getSubmissionStats(templateId) {
    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .eq('template_id', templateId);
      
      if (countError) {
        throw countError;
      }
      
      // Get daily submissions for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: dailyData, error: dailyError } = await supabase
        .from('submissions')
        .select('created_at')
        .eq('template_id', templateId)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (dailyError) {
        throw dailyError;
      }
      
      // Process daily data
      const dailySubmissions = {};
      dailyData.forEach(submission => {
        const date = new Date(submission.created_at).toISOString().split('T')[0];
        dailySubmissions[date] = (dailySubmissions[date] || 0) + 1;
      });
      
      return {
        total: count,
        daily: dailySubmissions
      };
    } catch (error) {
      handleSupabaseError(error, 'Failed to fetch submission statistics');
      throw error;
    }
  }
};

export default submissionService; 