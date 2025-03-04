const serviceSupabase = require('./serviceSupabase');

const setupDatabase = async () => {
  try {
    console.log('Starting database setup...');

    // Check if users table exists
    const { error: tableError } = await serviceSupabase
      .from('users')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('Creating users table...');
      // Create users table through Supabase interface
      const { error: createError } = await serviceSupabase
        .from('users')
        .insert({
          email: 'setup@example.com',
          name: 'Setup User',
          password_hash: 'setup',
          role: 'user',
          status: 'active'
        })
        .select();

      if (createError && !createError.message.includes('duplicate key')) {
        console.error('Error creating table:', createError);
        throw createError;
      }
    }

    // Check if required columns exist
    const { data: columns, error: columnsError } = await serviceSupabase
      .from('users')
      .select()
      .limit(1);

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
      throw columnsError;
    }

    console.log('Current table structure:', Object.keys(columns?.[0] || {}));

    // The table should now be ready for use
    console.log('Database setup completed successfully');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

const ensureTemplatesColumns = async () => {
  console.log('Checking templates table schema...');
  
  // Get current columns
  const { data: columns, error } = await serviceSupabase
    .from('templates')
    .select()
    .limit(1);
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking templates table:', error);
    return false;
  }
  
  // Check if is_public column exists
  const hasIsPublic = columns && columns.length > 0 && 'is_public' in columns[0];
  
  if (!hasIsPublic) {
    console.log('Adding is_public column to templates table...');
    
    // Use raw SQL to add the column (since Supabase API doesn't support ALTER TABLE)
    const { error: alterError } = await serviceSupabase.rpc('execute_sql', {
      sql: 'ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true'
    });
    
    if (alterError) {
      console.error('Error adding is_public column:', alterError);
      return false;
    }
    
    console.log('is_public column added successfully');
  } else {
    console.log('is_public column already exists');
  }
  
  return true;
};

module.exports = setupDatabase; 