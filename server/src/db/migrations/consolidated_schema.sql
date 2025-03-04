-- Consolidated schema migration for QuizForm application

-- Clear existing tables if needed (for clean installation)
-- WARNING: This will delete all data if run on an existing database
/*
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS templates;
DROP TABLE IF EXISTS template_likes;
DROP TABLE IF EXISTS template_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS profiles;
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb
);

-- Create index for faster searching
CREATE INDEX IF NOT EXISTS templates_title_idx ON templates USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS templates_description_idx ON templates USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates(user_id);
CREATE INDEX IF NOT EXISTS templates_is_public_idx ON templates(is_public);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'choice', 'multiple_choice', 'date', 'scale', 'file')),
  options JSONB DEFAULT NULL,
  is_required BOOLEAN DEFAULT false,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster template question lookup
CREATE INDEX IF NOT EXISTS questions_template_id_idx ON questions(template_id);
CREATE INDEX IF NOT EXISTS questions_position_idx ON questions(position);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster template submission lookup
CREATE INDEX IF NOT EXISTS submissions_template_id_idx ON submissions(template_id);
CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON submissions(user_id);

-- Template likes join table
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, user_id)
);

-- Create index for faster likes lookup
CREATE INDEX IF NOT EXISTS template_likes_template_id_idx ON template_likes(template_id);
CREATE INDEX IF NOT EXISTS template_likes_user_id_idx ON template_likes(user_id);

-- Template categories join table
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, category_id)
);

-- Create index for faster category lookup
CREATE INDEX IF NOT EXISTS template_categories_template_id_idx ON template_categories(template_id);
CREATE INDEX IF NOT EXISTS template_categories_category_id_idx ON template_categories(category_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RPC function to toggle a template like
CREATE OR REPLACE FUNCTION toggle_like(
  p_template_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if the like already exists
  SELECT EXISTS(
    SELECT 1 FROM template_likes
    WHERE template_id = p_template_id AND user_id = p_user_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Unlike
    DELETE FROM template_likes
    WHERE template_id = p_template_id AND user_id = p_user_id;
    RETURN FALSE;
  ELSE
    -- Like
    INSERT INTO template_likes (template_id, user_id)
    VALUES (p_template_id, p_user_id);
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user profile trigger
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up trigger to create profile when a new user is created
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE create_profile_for_user();

-- Insert default categories
INSERT INTO categories (name, description, slug)
VALUES 
  ('Education', 'Educational forms and surveys', 'education'),
  ('Business', 'Business and professional forms', 'business'),
  ('Personal', 'Personal and lifestyle forms', 'personal'),
  ('Health', 'Health and wellness surveys', 'health'),
  ('Technology', 'Technology and IT related forms', 'technology'),
  ('Entertainment', 'Entertainment and media surveys', 'entertainment'),
  ('Research', 'Academic and market research', 'research'),
  ('Feedback', 'Feedback and evaluation forms', 'feedback'),
  ('Other', 'Miscellaneous forms', 'other')
ON CONFLICT (name) DO NOTHING; 