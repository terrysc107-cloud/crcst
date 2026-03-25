-- Create daily_usage table for rate limiting
-- This table tracks questions and AI chats used per user per time period

CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  questions_attempted INTEGER DEFAULT 0 NOT NULL,
  ai_chats_used INTEGER DEFAULT 0 NOT NULL
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_created 
  ON daily_usage(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY IF NOT EXISTS "Users can view own usage" 
  ON daily_usage FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own usage
CREATE POLICY IF NOT EXISTS "Users can insert own usage" 
  ON daily_usage FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY IF NOT EXISTS "Service role full access" 
  ON daily_usage FOR ALL 
  USING (auth.role() = 'service_role');
