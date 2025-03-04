import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate Supabase credentials
if (!supabaseUrl) {
  console.error('CRITICAL ERROR: Missing Supabase URL. Please check your environment variables.');
  // In development, show a more helpful message
  if (process.env.NODE_ENV === 'development') {
    console.error('Make sure you have REACT_APP_SUPABASE_URL defined in your .env file');
  }
}

if (!supabaseAnonKey) {
  console.error('CRITICAL ERROR: Missing Supabase Anon Key. Please check your environment variables.');
  // In development, show a more helpful message
  if (process.env.NODE_ENV === 'development') {
    console.error('Make sure you have REACT_APP_SUPABASE_ANON_KEY defined in your .env file');
  }
}

// Log the first few characters of the key for debugging (don't log the full key for security)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined');

// Create the Supabase client with enhanced options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'quizform-auth',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'x-application-name': 'QuizForm'
    }
  },
  // Add better error handling
  shouldThrowOnError: false
});

// Test the connection to verify credentials are working
(async function testSupabaseConnection() {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection test failed:', error.message);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err.message);
  }
})();

/**
 * Get a public URL for a file in storage
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - Path to the file
 * @returns {string|null} - Public URL or null
 */
export const getPublicUrl = (bucket, filePath) => {
  if (!bucket || !filePath) return null;
  
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
};

/**
 * Upload a file to storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - Path to store the file
 * @param {File} file - File to upload
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    publicUrl: getPublicUrl(bucket, data.path)
  };
};

/**
 * Delete a file from storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - Path to the file
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    throw error;
  }
  
  return true;
};

// Export default for backward compatibility
export default supabase; 