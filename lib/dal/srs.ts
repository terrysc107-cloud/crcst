import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { QuestionState } from '@/lib/srs'

type Cert = 'crcst' | 'chl' | 'cer'

export interface QuestionStateUpdate {
  ease: number
  interval_days: number
  next_due: string
  last_result: 'correct' | 'incorrect'
}

// Fallback client using the anon key. RLS applies — queries are scoped by user_id.
// For client-side calls, pass the browser client directly instead.
function getServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Returns IDs of questions due today for a given cert.
export async function getDueTodayIds(
  userId: string,
  cert: Cert,
  client?: SupabaseClient
): Promise<string[]> {
  const sb = client ?? getServerClient()
  const today = new Date().toISOString().split('T')[0]

  let query = sb
    .from('question_state')
    .select('question_id')
    .eq('user_id', userId)
    .lte('next_due', today)

  if (cert === 'chl') {
    query = query.like('question_id', 'chl-%')
  } else if (cert === 'cer') {
    query = query.like('question_id', 'cer-%')
  } else {
    query = query
      .not('question_id', 'like', 'chl-%')
      .not('question_id', 'like', 'cer-%')
  }

  const { data, error } = await query
  if (error) {
    console.error('getDueTodayIds error:', error)
    return []
  }
  return (data ?? []).map((row: { question_id: string }) => row.question_id)
}

// Returns count of questions due today for a given cert.
// question_id prefix convention:
//   chl-*  → CHL
//   cer-*  → CER
//   (bare number) → CRCST
export async function getDueToday(
  userId: string,
  cert: Cert,
  client?: SupabaseClient
): Promise<number> {
  const sb = client ?? getServerClient()
  const today = new Date().toISOString().split('T')[0]

  let query = sb
    .from('question_state')
    .select('question_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_due', today)

  if (cert === 'chl') {
    query = query.like('question_id', 'chl-%')
  } else if (cert === 'cer') {
    query = query.like('question_id', 'cer-%')
  } else {
    // CRCST: exclude chl and cer prefixed ids
    query = query
      .not('question_id', 'like', 'chl-%')
      .not('question_id', 'like', 'cer-%')
  }

  const { count, error } = await query
  if (error) {
    console.error('getDueToday error:', error)
    return 0
  }
  return count ?? 0
}

export interface SrsStats {
  mastered: number   // interval_days >= 21 (well-known cards)
  learning: number   // 0 < interval_days < 21
  nextDue: string | null  // earliest future next_due (YYYY-MM-DD)
}

// Returns SRS progress counts and the next scheduled review date for a cert.
export async function getSrsStats(
  userId: string,
  cert: Cert,
  client?: SupabaseClient
): Promise<SrsStats> {
  const sb = client ?? getServerClient()
  const today = new Date().toISOString().split('T')[0]

  let query = sb
    .from('question_state')
    .select('interval_days, next_due')
    .eq('user_id', userId)

  if (cert === 'chl') {
    query = query.like('question_id', 'chl-%')
  } else if (cert === 'cer') {
    query = query.like('question_id', 'cer-%')
  } else {
    query = query
      .not('question_id', 'like', 'chl-%')
      .not('question_id', 'like', 'cer-%')
  }

  const { data, error } = await query
  if (error || !data) return { mastered: 0, learning: 0, nextDue: null }

  let mastered = 0
  let learning = 0
  let nextDue: string | null = null

  for (const row of data as { interval_days: number; next_due: string }[]) {
    if (row.interval_days >= 21) mastered++
    else learning++

    if (row.next_due > today) {
      if (!nextDue || row.next_due < nextDue) nextDue = row.next_due
    }
  }

  return { mastered, learning, nextDue }
}

// Upserts question state after each answer.
export async function upsertQuestionState(
  userId: string,
  questionId: string,
  update: QuestionStateUpdate,
  client?: SupabaseClient
): Promise<void> {
  const sb = client ?? getServerClient()

  const { error } = await sb.from('question_state').upsert(
    {
      user_id: userId,
      question_id: questionId,
      ease: update.ease,
      interval_days: update.interval_days,
      next_due: update.next_due,
      last_seen: new Date().toISOString(),
      last_result: update.last_result,
    },
    { onConflict: 'user_id,question_id' }
  )

  if (error) {
    console.error('upsertQuestionState error:', error)
  }
}
