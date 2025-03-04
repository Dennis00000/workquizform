const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Debug logging
console.log('Initializing Supabase service client with:', {
  url: supabaseUrl,
  keyLength: supabaseServiceKey?.length || 0
});

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service configuration. Check your .env file.');
}

const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Test the connection
serviceSupabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase service connection test failed:', error);
  } else {
    console.log('Supabase service connection test successful');
  }
});

module.exports = serviceSupabase; 