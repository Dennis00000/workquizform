-- Function to increment template likes count
CREATE OR REPLACE FUNCTION increment_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement template likes count
CREATE OR REPLACE FUNCTION decrement_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment template comments count
CREATE OR REPLACE FUNCTION increment_template_comments(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement template comments count
CREATE OR REPLACE FUNCTION decrement_template_comments(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment template view count
CREATE OR REPLACE FUNCTION increment_view_count(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or update user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM profiles
    WHERE id = user_id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    -- Update existing profile
    UPDATE profiles
    SET 
      name = COALESCE(user_name, name),
      email = COALESCE(user_email, email),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = user_id;
    RETURN TRUE;
  ELSE
    -- Create new profile
    INSERT INTO profiles (id, name, email, role, created_at, updated_at)
    VALUES (
      user_id,
      user_name,
      user_email,
      'user',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
    RETURN TRUE;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in create_user_profile: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 