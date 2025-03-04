-- Add missing columns to templates table
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
ALTER TABLE templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Create index on topic for better performance
CREATE INDEX IF NOT EXISTS idx_templates_topic ON templates(topic); 