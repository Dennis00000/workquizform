import BaseApiService from './baseApi';
import { userCache } from '../../utils/cache';
import { supabase } from '../../config/supabase';

class UserApiService extends BaseApiService {
  constructor() {
    super('profiles');
  }
  
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  async getUserProfile(userId) {
    const cacheKey = `user-profile-${userId}`;
    const cachedData = userCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Cache the result
      userCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated profile
   */
  async updateProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate cache
      userCache.delete(`user-profile-${userId}`);
      
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Upload avatar image
   * @param {string} userId - User ID
   * @param {File} file - Image file
   * @returns {Promise<string>} - Avatar URL
   */
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from(this.tableName)
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      // Invalidate cache
      userCache.delete(`user-profile-${userId}`);
      
      return data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
  
  /**
   * Get users by role
   * @param {string} role - Role to filter by
   * @returns {Promise<Array>} - Users with the specified role
   */
  async getUsersByRole(role) {
    const cacheKey = `users-by-role-${role}`;
    const cachedData = userCache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cache the result
      userCache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      throw error;
    }
  }
}

export const userApi = new UserApiService(); 