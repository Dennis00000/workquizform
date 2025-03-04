const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');
const logger = require('../utils/logger');

// Function to split SQL into individual statements
function splitSqlStatements(sql) {
  // Remove comments and empty lines
  const cleanedSql = sql
    .replace(/--.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .trim();

  // Split by semicolons, but respect dollar-quoted strings
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < cleanedSql.length; i++) {
    const char = cleanedSql[i];
    const nextChar = cleanedSql[i + 1] || '';
    
    // Check for dollar quote start/end
    if (char === '$' && nextChar === '$') {
      if (!inDollarQuote) {
        inDollarQuote = true;
        dollarTag = '$$';
      } else if (inDollarQuote && dollarTag === '$$') {
        inDollarQuote = false;
      }
      currentStatement += char;
    } 
    // Check for semicolon outside of dollar quotes
    else if (char === ';' && !inDollarQuote) {
      statements.push(currentStatement.trim() + ';');
      currentStatement = '';
    } 
    // Add character to current statement
    else {
      currentStatement += char;
    }
  }

  // Add the last statement if it exists and doesn't end with semicolon
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim() + (currentStatement.trim().endsWith(';') ? '' : ';'));
  }

  // Filter out empty statements
  return statements.filter(stmt => stmt.trim() !== ';');
}

async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'migrations', 'consolidated_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Read RPC functions SQL file
    const rpcPath = path.join(__dirname, 'migrations', 'create_rpc_functions.sql');
    const rpcSql = fs.readFileSync(rpcPath, 'utf8');
    
    // Combine SQL files
    const combinedSql = schemaSql + '\n' + rpcSql;
    
    // Split into individual statements
    const statements = splitSqlStatements(combinedSql);
    
    logger.info(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      try {
        await pool.query(statement);
        successCount++;
      } catch (err) {
        errorCount++;
        logger.error(`Error executing SQL statement: ${err.message}`);
        logger.error(`Statement: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      }
    }
    
    logger.info(`Database initialization completed with ${successCount} successful statements and ${errorCount} errors`);
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = { initializeDatabase }; 