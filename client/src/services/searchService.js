import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';
import { performanceMonitor } from '../utils/performance';

/**
 * Service for handling search functionality across the application
 */
class SearchService {
  /**
   * Search templates
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} - Promise with search results
   */
  async searchTemplates(query, options = {}) {
    try {
      const perfKey = performanceMonitor.startApiCall('searchTemplates', 'GET');
      
      const { 
        limit = 10, 
        category = null, 
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('templates')
        .select('*, profiles(name)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);
      
      // Apply category filter if provided
      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Execute the query
      const { data, error } = await dbQuery;
      
      performanceMonitor.endApiCall(perfKey, !error);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Search failed');
    }
  }
  
  /**
   * Search submissions
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} - Promise with search results
   */
  async searchSubmissions(query, options = {}) {
    try {
      const perfKey = performanceMonitor.startApiCall('searchSubmissions', 'GET');
      
      const { 
        limit = 10, 
        templateId = null, 
        status = null,
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('submissions')
        .select('*, templates(title)')
        .or(`submitter_name.ilike.%${query}%,submitter_email.ilike.%${query}%`)
        .limit(limit);
      
      // Apply template filter if provided
      if (templateId) {
        dbQuery = dbQuery.eq('template_id', templateId);
      }
      
      // Apply status filter if provided
      if (status) {
        dbQuery = dbQuery.eq('status', status);
      }
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Execute the query
      const { data, error } = await dbQuery;
      
      performanceMonitor.endApiCall(perfKey, !error);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Search failed');
    }
  }
  
  /**
   * Search users (admin only)
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise} - Promise with search results
   */
  async searchUsers(query, options = {}) {
    try {
      const perfKey = performanceMonitor.startApiCall('searchUsers', 'GET');
      
      const { 
        limit = 10, 
        role = null,
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);
      
      // Apply role filter if provided
      if (role) {
        dbQuery = dbQuery.eq('role', role);
      }
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Execute the query
      const { data, error } = await dbQuery;
      
      performanceMonitor.endApiCall(perfKey, !error);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Search failed');
    }
  }
  
  /**
   * Global search across multiple entities
   * @param {string} query - Search query
   * @param {Array} entities - Entities to search ['templates', 'submissions', 'users']
   * @param {number} limit - Results limit per entity
   * @returns {Promise} - Promise with search results
   */
  async globalSearch(query, entities = ['templates', 'submissions'], limit = 5) {
    try {
      const perfKey = performanceMonitor.startApiCall('globalSearch', 'GET');
      
      const results = {
        templates: [],
        submissions: [],
        users: []
      };
      
      // Run searches in parallel
      const promises = [];
      
      if (entities.includes('templates')) {
        promises.push(
          this.searchTemplates(query, { limit })
            .then(data => { results.templates = data; })
            .catch(error => { console.error('Template search error:', error); })
        );
      }
      
      if (entities.includes('submissions')) {
        promises.push(
          this.searchSubmissions(query, { limit })
            .then(data => { results.submissions = data; })
            .catch(error => { console.error('Submission search error:', error); })
        );
      }
      
      if (entities.includes('users')) {
        promises.push(
          this.searchUsers(query, { limit })
            .then(data => { results.users = data; })
            .catch(error => { console.error('User search error:', error); })
        );
      }
      
      await Promise.all(promises);
      
      performanceMonitor.endApiCall(perfKey, true);
      
      return results;
    } catch (error) {
      console.error('Global search error:', error);
      throw new Error('Global search failed');
    }
  }
}

export default new SearchService(); 