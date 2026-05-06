-- Progression Unlock System tables
-- Run this in the Supabase SQL editor before using /progression

CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  level_id SMALLINT NOT NULL CHECK (level_id BETWEEN 1 AND 5),
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
  best_score NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS progression_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  level_id SMALLINT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bonus_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  module_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own rows" ON user_levels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows" ON progression_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own rows" ON bonus_unlocks FOR ALL USING (auth.uid() = user_id);

-- Index for fail-streak + score queries
CREATE INDEX IF NOT EXISTS idx_progression_attempts_user_level
  ON progression_attempts(user_id, level_id, created_at DESC);
