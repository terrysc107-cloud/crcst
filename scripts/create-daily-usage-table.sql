-- daily_usage table: tracks per-user, per-day question and chat counts
CREATE TABLE IF NOT EXISTS daily_usage (
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  ai_chats_used       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- RLS
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own usage" ON daily_usage;
CREATE POLICY "Users can read own usage"
  ON daily_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (needed for server-side increment)
DROP POLICY IF EXISTS "Service role full access" ON daily_usage;
CREATE POLICY "Service role full access"
  ON daily_usage FOR ALL
  USING (true);

-- RPC: upsert + increment a single field atomically
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id UUID,
  p_date    DATE,
  p_field   TEXT   -- 'questions_attempted' or 'ai_chats_used'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_field = 'questions_attempted' THEN
    INSERT INTO daily_usage (user_id, date, questions_attempted, ai_chats_used)
      VALUES (p_user_id, p_date, 1, 0)
    ON CONFLICT (user_id, date)
      DO UPDATE SET questions_attempted = daily_usage.questions_attempted + 1;

  ELSIF p_field = 'ai_chats_used' THEN
    INSERT INTO daily_usage (user_id, date, questions_attempted, ai_chats_used)
      VALUES (p_user_id, p_date, 0, 1)
    ON CONFLICT (user_id, date)
      DO UPDATE SET ai_chats_used = daily_usage.ai_chats_used + 1;
  END IF;
END;
$$;
