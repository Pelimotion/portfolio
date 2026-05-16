-- PELIMOTION MIGRATION v1.0
-- Run this in Supabase SQL Editor

-- 1. Update blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'pt';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS reading_time_min INT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS generation_preset_id UUID;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 2. blog_images (Library)
CREATE TABLE IF NOT EXISTS blog_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE, -- Ensure URLs are unique in the library
  prompt TEXT,
  alt_text TEXT,
  width INT, height INT,
  file_size_kb INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. post_images (Pivot)
CREATE TABLE IF NOT EXISTS post_images (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  image_id UUID REFERENCES blog_images(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'body', -- 'hero' | 'thumb' | 'body'
  position INT DEFAULT 0,
  placeholder_id TEXT,
  PRIMARY KEY (post_id, image_id)
);

-- 4. content_presets
CREATE TABLE IF NOT EXISTS content_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scope TEXT NOT NULL, -- 'global' | 'category' | 'post'
  scope_value TEXT,
  section TEXT NOT NULL, -- 'strategy' | 'outline' | 'writing' | 'image' | 'seo'
  prompt_template TEXT NOT NULL,
  tone_voice TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. topic_library
CREATE TABLE IF NOT EXISTS topic_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  subtopics TEXT[],
  hype_score INT DEFAULT 0,
  platforms TEXT[],
  trend_data JSONB,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. generation_queue
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topic_library(id),
  preset_id UUID REFERENCES content_presets(id),
  status TEXT DEFAULT 'pending', -- 'pending' | 'running' | 'done' | 'failed' | 'review'
  output_post_id UUID REFERENCES blog_posts(id),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Auth Required)
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON blog_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all" ON post_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all" ON content_presets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all" ON topic_library FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all" ON generation_queue FOR ALL USING (auth.role() = 'authenticated');
