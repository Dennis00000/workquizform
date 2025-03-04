-- Add user_id column to templates table if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- Create a function to set user_id from author_id if needed
CREATE OR REPLACE FUNCTION migrate_author_id_to_user_id() RETURNS void AS $$
BEGIN
  -- Update templates where user_id is null but author_id exists
  UPDATE templates 
  SET user_id = author_id 
  WHERE user_id IS NULL AND author_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_author_id_to_user_id();

-- Create or update RLS policies
CREATE POLICY IF NOT EXISTS "Templates are viewable by everyone" 
  ON templates FOR SELECT 
  USING (is_public OR user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert their own templates" 
  ON templates FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own templates" 
  ON templates FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own templates" 
  ON templates FOR DELETE 
  USING (user_id = auth.uid());

-- Enable RLS on templates table
ALTER TABLE templates ENABLE ROW LEVEL SECURITY; 