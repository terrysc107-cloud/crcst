-- Shared quiz_sessions table used by all three cert pages (crcst / chl / cer).
-- Replaces the three cert-specific quiz_sessions tables.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cert                  TEXT NOT NULL CHECK (cert IN ('crcst', 'chl', 'cer')),
  quiz_mode             TEXT NOT NULL,
  question_ids          JSONB NOT NULL,
  answers               JSONB NOT NULL DEFAULT '[]',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  selected_domains      JSONB DEFAULT '[]',
  difficulty            TEXT DEFAULT 'all',
  elapsed_time_seconds  INTEGER NOT NULL DEFAULT 0,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at             TIMESTAMPTZ,
  is_paused             BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_cert
  ON quiz_sessions (user_id, cert, is_paused);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "users own their sessions" ON quiz_sessions
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
