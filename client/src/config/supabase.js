import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to handle common Supabase errors
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  if (error.code === 'auth/invalid-email') {
    return 'Invalid email address';
  }
  
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return 'Invalid email or password';
  }
  
  return error.message || 'An unexpected error occurred';
};