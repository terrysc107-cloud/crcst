-- Quiz sessions (save/resume)
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_mode             TEXT NOT NULL CHECK (quiz_mode IN ('practice', 'mock', 'flashcard', 'custom')),
  question_ids          JSONB NOT NULL,
  answers               JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  selected_domains      JSONB DEFAULT '[]',
  difficulty            TEXT DEFAULT 'all',
  elapsed_time_seconds  INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ DEFAULT NOW(),
  paused_at             TIMESTAMPTZ DEFAULT NOW(),
  is_paused             BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_is_paused ON quiz_sessions(user_id, is_paused);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON quiz_sessions
  FOR DELETE USING (auth.uid() = user_id);
