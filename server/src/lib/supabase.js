const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const { logger } = require('../utils/logger');

// Create Supabase client
const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseKey
);

// Create Supabase service client with admin privileges
const supabaseService = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey
);

// Test connection to Supabase
async function testConnection() {
  try {
    logger.info('Initializing Supabase service client with:', {
      url: config.database.supabaseUrl,
      keyLength: config.database.supabaseKey ? config.database.supabaseKey.length : 0
    });
    
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Supabase connection error:', error);
      return false;
    }
    
    logger.info('Supabase connection test successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
    return false;
  }
}

/**
 * Get a public URL for a file in storage
 */
function getPublicUrl(bucket, filePath) {
  if (!bucket || !filePath) return null;
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

module.exports = {
  supabase,
  supabaseService,
  testConnection,
  getPublicUrl
}; 