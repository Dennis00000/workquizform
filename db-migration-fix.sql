-- Create RPC functions for likes
CREATE OR REPLACE FUNCTION increment_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Create template_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT true,
  show_in_table BOOLEAN DEFAULT true,
  options JSONB,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add likes_count column to templates if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Add comments_count column to templates if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Add is_public column to templates if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add RLS policies for template_likes
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes"
  ON template_likes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own likes"
  ON template_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON template_likes FOR DELETE
  USING (user_id = auth.uid());

-- Add RLS policies for questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Template owners can insert questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Template owners can update questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_id
      AND templates.user_id = auth.uid()
    )
  );

CREATE POLICY "Template owners can delete questions"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM templates
      WHERE templates.id = template_id
      AND templates.user_id = auth.uid()
    )
  );