-- Create quiz_sessions table for storing in-progress quizzes
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_mode TEXT NOT NULL CHECK (quiz_mode IN ('practice', 'mock', 'flashcard', 'custom')),
  question_ids JSONB NOT NULL, -- Array of question IDs in the quiz
  answers JSONB NOT NULL, -- Array of answers (null or answer index), matches question_ids order
  current_question_index INTEGER NOT NULL DEFAULT 0,
  selected_domains JSONB, -- Array of selected domain names
  difficulty TEXT, -- 'all', 'easy', 'medium', 'hard'
  elapsed_time_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  paused_at TIMESTAMP WITH TIME ZONE,
  is_paused BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_is_paused ON quiz_sessions(user_id, is_paused);

-- Enable RLS
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own sessions
CREATE POLICY "Users can view their own quiz sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz sessions"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz sessions"
  ON quiz_sessions FOR DELETE
  USING (auth.uid() = user_id);
