import { supabase } from '../../lib/supabase';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Base API service with common methods for Supabase interactions
 */
class BaseApiService {
  constructor(resource) {
    this.resource = resource;
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   */
  handleError(error) {
    handleApiError(error);
  }

  /**
   * Get all records
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of records
   */
  async getAll(options = {}) {
    try {
      let query = supabase.from(this.resource).select('*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply sorting
      if (options.sortBy) {
        const { column, ascending = true } = options.sortBy;
        query = query.order(column, { ascending });
      }

      // Apply pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get a record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object>} Record data
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.resource)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async create(data) {
    try {
      const { data: result, error } = await supabase
        .from(this.resource)
        .insert(data)
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Update a record
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data) {
    try {
      const { data: result, error } = await supabase
        .from(this.resource)
        .update(data)
        .eq('id', id)
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from(this.resource)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default BaseApiService; 