import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

/**
 * Service for user profile-related API calls
 */
const profileService = {
  /**
   * Get a user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to fetch profile');
      throw error;
    }
  },
  
  /**
   * Update a user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} - Updated profile
   */
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to update profile');
      throw error;
    }
  },
  
  /**
   * Upload a profile avatar
   * @param {string} userId - User ID
   * @param {File} file - Avatar image file
   * @returns {Promise<string>} - Avatar URL
   */
  async uploadAvatar(userId, file) {
    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update the user profile with the new avatar URL
      await this.updateProfile(userId, { avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (error) {
      handleSupabaseError(error, 'Failed to upload avatar');
      throw error;
    }
  },
  
  /**
   * Remove a profile avatar
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - Success status
   */
  async removeAvatar(userId) {
    try {
      // Get the current profile to find the avatar URL
      const profile = await this.getProfile(userId);
      
      if (profile.avatar_url) {
        // Extract the file path from the URL
        const url = new URL(profile.avatar_url);
        const pathParts = url.pathname.split('/');
        const filePath = pathParts[pathParts.length - 1];
        
        // Delete the file from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([`avatars/${filePath}`]);
        
        if (deleteError) {
          console.warn('Failed to delete avatar file:', deleteError);
          // Continue anyway to update the profile
        }
      }
      
      // Update the profile to remove the avatar URL
      await this.updateProfile(userId, { avatar_url: null });
      
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Failed to remove avatar');
      throw error;
    }
  }
};

export default profileService; 