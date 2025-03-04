-- Create templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id),
  author_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- Create index on author_id
CREATE INDEX IF NOT EXISTS idx_templates_author_id ON templates(author_id);

-- Enable RLS on templates table
ALTER TABLE templates ENABLE ROW LEVEL SECURITY; 