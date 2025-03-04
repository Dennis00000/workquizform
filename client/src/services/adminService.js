import axiosInstance from './axiosConfig';
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

/**
 * Admin service for managing users and system settings
 */
class AdminService {
  /**
   * Get all users with pagination and filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with users data
   */
  async getUsers(params = {}) {
    try {
      const { page = 1, limit = 10, search = '', role = '', sortBy = 'created_at', sortOrder = 'desc' } = params;
      
      // Calculate the range for pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Start building the query
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      if (role) {
        query = query.eq('role', role);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        users: data, 
        pagination: {
          page,
          limit,
          total: count || 0,
        }
      };
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to fetch users');
    }
  }
  
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with user data
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to fetch user');
    }
  }
  
  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} - Promise with updated user data
   */
  async updateUser(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to update user');
    }
  }
  
  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise with success status
   */
  async deleteUser(userId) {
    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Then delete the auth user (requires admin privileges)
      // This would typically be done through a server-side function
      // as client-side doesn't have permission to delete auth users
      const { error: authError } = await axiosInstance.delete(`/admin/users/${userId}`);
      
      if (authError) throw authError;
      
      return { success: true };
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to delete user');
    }
  }
  
  /**
   * Get system statistics
   * @returns {Promise} - Promise with system statistics
   */
  async getSystemStats() {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Get template count
      const { count: templateCount, error: templateError } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true });
      
      if (templateError) throw templateError;
      
      // Get submission count
      const { count: submissionCount, error: submissionError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true });
      
      if (submissionError) throw submissionError;
      
      return {
        users: userCount || 0,
        templates: templateCount || 0,
        submissions: submissionCount || 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to fetch system statistics');
    }
  }
  
  /**
   * Get system logs
   * @param {Object} params - Query parameters
   * @returns {Promise} - Promise with system logs
   */
  async getSystemLogs(params = {}) {
    try {
      const { page = 1, limit = 50, level = '', sortOrder = 'desc' } = params;
      
      // This would typically come from a server-side logs API
      // For now, we'll simulate it with a client-side request
      const response = await axiosInstance.get('/admin/logs', { params });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }
  
  /**
   * Update a user's role
   * @param {string} userId - User ID
   * @param {string} role - New role ('admin', 'user', etc.)
   * @returns {Promise} - Promise with updated user data
   */
  async updateUserRole(userId, role) {
    try {
      console.log(`Updating user ${userId} role to ${role}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
      
      console.log('User role updated successfully:', data);
      return data;
    } catch (error) {
      throw handleSupabaseError(error, 'Failed to update user role');
    }
  }
  
  /**
   * Check if the current user is an admin
   * @returns {Promise<boolean>} - Whether the current user is an admin
   */
  async checkAdminStatus() {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting current user:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('No user found, not an admin');
        return false;
      }
      
      console.log('Checking admin status for user:', user.id);
      
      // Get the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile data:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.warn('No profile found for user:', user.id);
        return false;
      }
      
      console.log('User role from profile:', profile.role);
      return profile.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

export default new AdminService(); 