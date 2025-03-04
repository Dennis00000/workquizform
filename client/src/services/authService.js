import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../utils/errorHandler';

/**
 * Service for authentication-related API calls
 */
const authService = {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} - User data
   */
  async signUp(email, password, metadata = {}) {
    try {
      console.log('Starting user registration process...');
      console.log('Email:', email);
      console.log('Metadata:', JSON.stringify(metadata));
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Include the name in the user metadata so the trigger can use it
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Supabase auth.signUp error:', error);
        throw error;
      }
      
      if (!data || !data.user) {
        console.error('No user data returned from signUp');
        throw new Error('Failed to create user account');
      }
      
      console.log('User registration successful:', data.user.id);
      
      // Wait a moment to ensure auth is complete before creating profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Manually create a profile if the trigger doesn't work
      try {
        console.log('Attempting to create profile for user:', data.user.id);
        
        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.warn('Error checking for existing profile:', profileCheckError.message);
        }
          
        if (existingProfile) {
          console.log('Profile already exists, skipping creation');
        } else {
          console.log('No existing profile found, creating new profile');
          
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id, 
                name: metadata.name || '', 
                email: email,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]);
            
          if (profileError) {
            console.warn('Error creating profile manually:', profileError.message);
            
            // If insert fails, try upsert instead
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert([
                { 
                  id: data.user.id, 
                  name: metadata.name || '', 
                  email: email,
                  role: 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);
              
            if (upsertError) {
              console.error('Error upserting profile:', upsertError.message);
              // Try one more approach - direct RPC call
              try {
                const { error: rpcError } = await supabase.rpc('create_user_profile', {
                  user_id: data.user.id,
                  user_email: email,
                  user_name: metadata.name || ''
                });
                
                if (rpcError) {
                  console.error('Error creating profile via RPC:', rpcError.message);
                } else {
                  console.log('Profile created via RPC successfully');
                }
              } catch (rpcErr) {
                console.error('Exception in RPC profile creation:', rpcErr.message);
              }
            } else {
              console.log('Profile upserted successfully');
            }
          } else {
            console.log('Profile created manually successfully');
          }
        }
      } catch (profileErr) {
        console.warn('Failed to create profile manually:', profileErr.message);
        // Continue anyway - the trigger might have created the profile
      }
      
      return data;
    } catch (error) {
      console.error('Registration error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      
      // Check for specific error conditions
      if (error.message && error.message.includes('User already registered')) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      }
      
      handleSupabaseError(error, 'Failed to sign up');
      throw error;
    }
  },
  
  // Alias for signUp to maintain compatibility
  register(email, password, metadata = {}) {
    return this.signUp(email, password, metadata);
  },
  
  /**
   * Sign in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to sign in');
      throw error;
    }
  },
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      handleSupabaseError(error, 'Failed to sign out');
      throw error;
    }
  },
  
  /**
   * Get the current user
   * @returns {Promise<Object>} - User data
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return data.user;
    } catch (error) {
      handleSupabaseError(error, 'Failed to get current user', true);
      return null;
    }
  },
  
  /**
   * Reset a user's password
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success status
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Failed to send password reset email');
      throw error;
    }
  },
  
  /**
   * Update a user's password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - User data
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to update password');
      throw error;
    }
  }
};

export default authService; 