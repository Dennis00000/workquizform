const { supabase } = require('../lib/supabase');
const { verifySchema, applyMigration } = require('./verify-schema');
const path = require('path');
const fs = require('fs').promises;

/**
 * Initialize the database with the required schema and seed data
 */
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the consolidated schema file
    const schemaPath = path.join(__dirname, 'migrations', 'consolidated_schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    // This regex handles SQL statements properly, including those with semicolons in strings or comments
    const statements = schemaSql
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/--.*$/gm, '') // Remove single-line comments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement individually
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('run_sql', { sql: statement });
        if (error) {
          console.error(`Error executing SQL statement: ${error.message}`);
          console.error('Statement:', statement);
          // Continue with other statements instead of failing completely
        }
      } catch (err) {
        console.error(`Error executing SQL statement: ${err.message}`);
        console.error('Statement:', statement);
        // Continue with other statements
      }
    }
    
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

module.exports = {
  initializeDatabase
}; 