-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create template_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for templates
CREATE POLICY "Templates are viewable by everyone" 
  ON templates FOR SELECT 
  USING (is_public OR user_id = auth.uid());

CREATE POLICY "Users can insert their own templates" 
  ON templates FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates" 
  ON templates FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates" 
  ON templates FOR DELETE 
  USING (user_id = auth.uid());

-- Create RLS policies for questions
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

-- Create RLS policies for template_likes
CREATE POLICY "Users can view their own likes" 
  ON template_likes FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own likes" 
  ON template_likes FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes" 
  ON template_likes FOR DELETE 
  USING (user_id = auth.uid()); 