const { supabase } = require('../config/supabase');

// Database initialization function that checks for existing objects before creating them
async function initializeDatabase() {
  try {
    console.log('Starting safe database initialization...');
    
    // Check if profiles table exists
    let { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count');
    
    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('Creating profiles table...');
      
      // Create profiles table using Supabase SQL
      const { error: createProfilesError } = await supabase.rpc('run_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          name TEXT,
          email TEXT,
          bio TEXT,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        `
      });
      
      if (createProfilesError) {
        console.error('Error creating profiles table:', createProfilesError);
      } else {
        console.log('Profiles table created successfully');
      }
    } else {
      console.log('Profiles table already exists');
    }
    
    // Check if templates table exists
    let { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('count');
    
    if (templatesError && templatesError.code === 'PGRST116') {
      console.log('Creating templates table...');
      
      // Create templates table using Supabase SQL
      const { error: createTemplatesError } = await supabase.rpc('run_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS public.templates (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT,
          topic TEXT,
          user_id UUID REFERENCES auth.users(id),
          is_public BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          tags JSONB DEFAULT '[]'::jsonb,
          questions JSONB DEFAULT '[]'::jsonb
        );
        `
      });
      
      if (createTemplatesError) {
        console.error('Error creating templates table:', createTemplatesError);
        
        // Try a different approach if the first one fails
        console.log('Trying alternative approach to create templates table...');
        
        // Check if the run_sql function is available
        const { error: checkSqlError } = await supabase.rpc('run_sql', { sql: 'SELECT 1;' });
        
        if (checkSqlError) {
          console.error('run_sql function not available, cannot create table programmatically');
          console.log('Please create the templates table manually in the Supabase SQL editor');
        }
      } else {
        console.log('Templates table created successfully');
      }
    } else {
      console.log('Templates table already exists');
    }
    
    // Safe creation of triggers - check if they exist first
    const createTriggerSafely = async (triggerName, tableName, functionBody) => {
      const { error: checkTriggerError } = await supabase.rpc('run_sql', {
        sql: `
        SELECT 1 FROM pg_trigger 
        WHERE tgname = '${triggerName}' 
        AND tgrelid = '${tableName}'::regclass::oid;
        `
      });
      
      if (checkTriggerError) {
        console.log(`Cannot check if trigger ${triggerName} exists, skipping creation`);
        return;
      }
      
      // Create trigger if it doesn't exist
      const { error: createTriggerError } = await supabase.rpc('run_sql', {
        sql: `
        ${functionBody}
        
        CREATE TRIGGER IF NOT EXISTS ${triggerName}
        BEFORE UPDATE ON ${tableName}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
        `
      });
      
      if (createTriggerError) {
        console.error(`Error creating trigger ${triggerName}:`, createTriggerError);
      } else {
        console.log(`Trigger ${triggerName} created or already exists`);
      }
    };
    
    // Create updated_at function and triggers
    const { error: createFunctionError } = await supabase.rpc('run_sql', {
      sql: `
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      `
    });
    
    if (createFunctionError) {
      console.error('Error creating update_updated_at function:', createFunctionError);
    } else {
      console.log('update_updated_at function created or updated');
      
      // Create triggers for each table
      await createTriggerSafely('update_profiles_updated_at', 'profiles', '');
      await createTriggerSafely('update_templates_updated_at', 'templates', '');
    }
    
    console.log('Database initialization completed');
    return { success: true };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return { success: false, error };
  }
}

module.exports = { initializeDatabase }; 