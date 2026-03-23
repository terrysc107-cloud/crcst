import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create quiz_sessions table
    const { error: tableError } = await supabase.from('quiz_sessions').select('id').limit(1)

    if (tableError && tableError.message.includes('does not exist')) {
      console.log('[v0] Creating quiz_sessions table')

      // Use raw SQL through Supabase
      const sqlStatements = `
        CREATE TABLE IF NOT EXISTS public.quiz_sessions (
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

        CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON public.quiz_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_quiz_sessions_is_paused ON public.quiz_sessions(user_id, is_paused);

        ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own quiz sessions" ON public.quiz_sessions;
        CREATE POLICY "Users can view their own quiz sessions"
          ON public.quiz_sessions FOR SELECT
          USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can insert their own quiz sessions" ON public.quiz_sessions;
        CREATE POLICY "Users can insert their own quiz sessions"
          ON public.quiz_sessions FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update their own quiz sessions" ON public.quiz_sessions;
        CREATE POLICY "Users can update their own quiz sessions"
          ON public.quiz_sessions FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete their own quiz sessions" ON public.quiz_sessions;
        CREATE POLICY "Users can delete their own quiz sessions"
          ON public.quiz_sessions FOR DELETE
          USING (auth.uid() = user_id);
      `

      // Execute each statement
      const statements = sqlStatements
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        })

        if (error && !error.message.includes('already exists')) {
          console.error('[v0] Error executing statement:', error)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Migration error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
