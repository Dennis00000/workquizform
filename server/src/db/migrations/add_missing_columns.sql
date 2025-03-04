-- Add is_public column if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add likes_count column if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Add comments_count column if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Add topic column if it doesn't exist
ALTER TABLE templates ADD COLUMN IF NOT EXISTS topic VARCHAR(50); 