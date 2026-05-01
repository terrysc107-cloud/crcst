import { createServiceClient } from '@/lib/supabase/server'

export type CertType = 'CRCST' | 'CHL' | 'CER'

const RESULT_TABLE: Record<CertType, 'crcst_quiz_results' | 'chl_quiz_results' | 'cer_quiz_results'> = {
  CRCST: 'crcst_quiz_results',
  CHL: 'chl_quiz_results',
  CER: 'cer_quiz_results',
}

export async function getQuizResults(userId: string, certType: CertType, limit = 10) {
  const supabase = createServiceClient()
  const table = RESULT_TABLE[certType]
  const { data, error } = await supabase
    .from(table)
    .select('id, score, total_questions, percentage, difficulty, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []).map(r => ({ ...r, cert_type: certType }))
}

export async function saveQuizResult(certType: CertType, result: {
  user_id: string
  score: number
  total_questions: number
  percentage: number
  difficulty: string
}) {
  const supabase = createServiceClient()
  const table = RESULT_TABLE[certType]
  const { error } = await supabase.from(table).insert(result)
  return { error }
}

export async function getActiveQuizSession(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_paused', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function upsertQuizSession(session: Parameters<ReturnType<typeof createServiceClient>['from']>[0] extends 'quiz_sessions' ? never : {
  id?: string
  user_id: string
  quiz_mode: 'practice' | 'mock' | 'flashcard' | 'custom'
  question_ids: unknown
  answers: unknown
  current_question_index?: number
  selected_domains?: unknown
  difficulty?: string | null
  elapsed_time_seconds?: number
  is_paused?: boolean
}) {
  const supabase = createServiceClient()
  if (session.id) {
    const { error } = await supabase
      .from('quiz_sessions')
      .update({
        answers: session.answers,
        current_question_index: session.current_question_index,
        elapsed_time_seconds: session.elapsed_time_seconds,
        is_paused: session.is_paused,
        paused_at: session.is_paused ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)
    return { error }
  }
  const { error } = await supabase.from('quiz_sessions').insert({
    user_id: session.user_id,
    quiz_mode: session.quiz_mode,
    question_ids: session.question_ids,
    answers: session.answers,
    current_question_index: session.current_question_index ?? 0,
    selected_domains: session.selected_domains ?? null,
    difficulty: session.difficulty ?? null,
    elapsed_time_seconds: session.elapsed_time_seconds ?? 0,
    is_paused: session.is_paused ?? false,
  })
  return { error }
}
