const { supabase } = require('../lib/supabase');
const fs = require('fs');
const path = require('path');

/**
 * Verify that the database schema matches the expected schema
 */
async function verifySchema() {
  console.log('Verifying database schema...');
  
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return false;
    }
    
    const tableNames = tables.map(t => t.tablename);
    const requiredTables = [
      'profiles',
      'templates',
      'questions',
      'submissions',
      'template_likes',
      'comments',
      'tags',
      'template_tags'
    ];
    
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.warn('Missing tables:', missingTables);
      return false;
    }
    
    // Check if RLS is enabled on tables
    for (const table of requiredTables) {
      const { data: rls, error: rlsError } = await supabase
        .rpc('check_rls_enabled', { table_name: table });
        
      if (rlsError) {
        console.error(`Error checking RLS for ${table}:`, rlsError);
        continue;
      }
      
      if (!rls) {
        console.warn(`RLS not enabled on table: ${table}`);
      }
    }
    
    console.log('Schema verification complete');
    return true;
  } catch (error) {
    console.error('Schema verification failed:', error);
    return false;
  }
}

/**
 * Apply a migration file to the database
 */
async function applyMigration(filePath) {
  try {
    console.log(`Applying migration: ${filePath}`);
    
    const sql = fs.readFileSync(filePath, 'utf8');
    const { error } = await supabase.rpc('run_sql', { sql });
    
    if (error) {
      console.error('Migration error:', error);
      return false;
    }
    
    console.log(`Migration applied successfully: ${filePath}`);
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

/**
 * Initialize the database schema
 */
async function initializeSchema() {
  const schemaValid = await verifySchema();
  
  if (!schemaValid) {
    console.log('Schema needs to be initialized or updated');
    
    const consolidatedSchemaPath = path.join(__dirname, 'migrations', 'consolidated_schema.sql');
    
    if (fs.existsSync(consolidatedSchemaPath)) {
      const success = await applyMigration(consolidatedSchemaPath);
      
      if (success) {
        console.log('Schema initialized successfully');
        return true;
      } else {
        console.error('Failed to initialize schema');
        return false;
      }
    } else {
      console.error('Consolidated schema file not found');
      return false;
    }
  }
  
  return true;
}

module.exports = {
  verifySchema,
  applyMigration,
  initializeSchema
}; 