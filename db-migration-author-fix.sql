-- Add author_id column if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);

-- Create a function to sync author_id and user_id
CREATE OR REPLACE FUNCTION sync_author_user_ids() RETURNS void AS $$
BEGIN
  -- Update author_id from user_id where author_id is null
  UPDATE templates 
  SET author_id = user_id 
  WHERE author_id IS NULL AND user_id IS NOT NULL;
  
  -- Update user_id from author_id where user_id is null
  UPDATE templates 
  SET user_id = author_id 
  WHERE user_id IS NULL AND author_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Run the sync function
SELECT sync_author_user_ids();

-- Create a trigger to keep author_id and user_id in sync
CREATE OR REPLACE FUNCTION sync_author_user_ids_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.author_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.author_id := NEW.user_id;
  ELSIF NEW.user_id IS NULL AND NEW.author_id IS NOT NULL THEN
    NEW.user_id := NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS sync_author_user_ids_trigger ON templates;

-- Create the trigger
CREATE TRIGGER sync_author_user_ids_trigger
BEFORE INSERT OR UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION sync_author_user_ids_trigger();

-- Create a view to make querying easier
CREATE OR REPLACE VIEW templates_with_authors AS
SELECT 
  t.*,
  p.name as author_name,
  p.email as author_email
FROM 
  templates t
LEFT JOIN 
  profiles p ON t.user_id = p.id;

-- Update the RLS policies to work with both author_id and user_id
CREATE POLICY IF NOT EXISTS "Templates are viewable by everyone with author_id" 
  ON templates FOR SELECT 
  USING (is_public OR author_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can insert their own templates with author_id" 
  ON templates FOR INSERT 
  WITH CHECK (author_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own templates with author_id" 
  ON templates FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own templates with author_id" 
  ON templates FOR DELETE 
  USING (author_id = auth.uid()); 