import { createClient, SupabaseClient } from '@supabase/supabase-js'

type Cert = 'crcst' | 'chl' | 'cer'

export interface PausedSession {
  id: string
  cert: Cert
  quiz_mode: string
  question_ids: string[]
  answers: (number | null)[]
  current_question_index: number
  selected_domains: string[]
  difficulty: string
  elapsed_time_seconds: number
  paused_at: string
}

export interface SaveSessionPayload {
  userId: string
  cert: Cert
  mode: string
  questionIds: string[]
  answers: (number | null)[]
  currentQuestionIndex: number
  selectedDomains: string[]
  difficulty: string
  elapsedTimeSeconds: number
}

function getServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function loadPausedSessions(
  userId: string,
  cert: Cert,
  client?: SupabaseClient
): Promise<PausedSession[]> {
  const sb = client ?? getServerClient()
  const { data, error } = await sb
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('cert', cert)
    .eq('is_paused', true)
    .order('paused_at', { ascending: false })

  if (error) {
    console.error('loadPausedSessions error:', error)
    return []
  }
  return (data ?? []) as PausedSession[]
}

export async function saveSession(
  payload: SaveSessionPayload,
  client?: SupabaseClient
): Promise<string | null> {
  const sb = client ?? getServerClient()
  const { data, error } = await sb
    .from('quiz_sessions')
    .insert({
      user_id: payload.userId,
      cert: payload.cert,
      quiz_mode: payload.mode,
      question_ids: payload.questionIds,
      answers: payload.answers,
      current_question_index: payload.currentQuestionIndex,
      selected_domains: payload.selectedDomains,
      difficulty: payload.difficulty,
      elapsed_time_seconds: payload.elapsedTimeSeconds,
      is_paused: true,
      paused_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('saveSession error:', error)
    return null
  }
  return data?.id ?? null
}

export async function loadSession(
  sessionId: string,
  client?: SupabaseClient
): Promise<PausedSession | null> {
  const sb = client ?? getServerClient()
  const { data, error } = await sb
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    console.error('loadSession error:', error)
    return null
  }
  return data as PausedSession
}

export async function deleteSession(
  sessionId: string,
  client?: SupabaseClient
): Promise<void> {
  const sb = client ?? getServerClient()
  const { error } = await sb.from('quiz_sessions').delete().eq('id', sessionId)
  if (error) console.error('deleteSession error:', error)
}
