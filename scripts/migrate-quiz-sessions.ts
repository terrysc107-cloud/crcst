import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createQuizSessionsTable() {
  try {
    console.log('[v0] Creating quiz_sessions table...')

    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS quiz_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          quiz_mode TEXT NOT NULL CHECK (quiz_mode IN ('practice', 'mock', 'flashcard', 'custom')),
          question_ids JSONB NOT NULL,
          answers JSONB NOT NULL,
          current_question_index INTEGER NOT NULL DEFAULT 0,
          selected_domains JSONB,
          difficulty TEXT,
          elapsed_time_seconds INTEGER NOT NULL DEFAULT 0,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          paused_at TIMESTAMP WITH TIME ZONE,
          is_paused BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_sessions_is_paused ON quiz_sessions(user_id, is_paused);

        ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

        CREATE POLICY IF NOT EXISTS "Users can view their own quiz sessions"
          ON quiz_sessions FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own quiz sessions"
          ON quiz_sessions FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own quiz sessions"
          ON quiz_sessions FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own quiz sessions"
          ON quiz_sessions FOR DELETE
          USING (auth.uid() = user_id);
      `
    })

    if (error) {
      console.error('[v0] Migration error:', error)
      process.exit(1)
    }

    console.log('[v0] quiz_sessions table created successfully')
    process.exit(0)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    process.exit(1)
  }
}

createQuizSessionsTable()
