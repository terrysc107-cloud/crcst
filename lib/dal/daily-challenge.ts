import { createClient } from '@supabase/supabase-js'
import { QUESTIONS } from '@/lib/questions'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// Deterministic shuffle based on a seed (date string)
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr]
  // Simple hash of the seed string
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  // Fisher-Yates with seeded random
  for (let i = copy.length - 1; i > 0; i--) {
    hash = ((hash * 1664525 + 1013904223) | 0) >>> 0
    const j = hash % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export async function getDailyChallenge(date = todayStr()): Promise<{
  date: string
  questionIds: string[]
  questions: typeof QUESTIONS
}> {
  const sb = getServiceClient()

  // Check if today's challenge already exists in DB
  const { data: existing } = await sb
    .from('daily_challenges')
    .select('question_ids')
    .eq('challenge_date', date)
    .single()

  if (existing) {
    const ids = existing.question_ids as string[]
    const questions = QUESTIONS.filter(q => ids.includes(q.id))
    return { date, questionIds: ids, questions }
  }

  // Generate deterministically from date
  const shuffled = seededShuffle(QUESTIONS, date)
  const selected = shuffled.slice(0, 10)
  const ids = selected.map(q => q.id)

  // Persist to DB so all users see the same questions
  await sb.from('daily_challenges').insert({
    challenge_date: date,
    question_ids: ids,
    cert_type: 'crcst',
  })

  return { date, questionIds: ids, questions: selected }
}

export async function getUserDailyResult(userId: string, date = todayStr()) {
  const sb = getServiceClient()
  const { data } = await sb
    .from('daily_challenge_results')
    .select('score, total, percentage, completed_at')
    .eq('user_id', userId)
    .eq('challenge_date', date)
    .single()
  return data ?? null
}

export async function saveDailyChallengeResult(
  userId: string,
  score: number,
  total: number,
  date = todayStr()
): Promise<{ percentile: number }> {
  const sb = getServiceClient()
  const pct = Math.round((score / total) * 100)

  await sb.from('daily_challenge_results').upsert({
    user_id: userId,
    challenge_date: date,
    score,
    total,
    percentage: pct,
  }, { onConflict: 'user_id,challenge_date' })

  // Compute percentile: % of completions that scored LOWER than this user
  const { data: allResults } = await sb
    .from('daily_challenge_results')
    .select('percentage')
    .eq('challenge_date', date)

  if (!allResults || allResults.length === 0) return { percentile: 100 }

  const below = allResults.filter(r => r.percentage < pct).length
  const percentile = Math.round((below / allResults.length) * 100)

  return { percentile }
}
