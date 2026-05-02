import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface UserStudyState {
  userId: string
  examDate: string | null
  daysRemaining: number | null
  readinessScore: number
  weakDomains: string[]
  studyDaysPerWeek: number
  targetCert: string
  streak: number
}

export interface DailyQuota {
  dueReviews: number
  weakDomainQuestions: number
  mockQuestions: number
  totalMinutes: number
  primaryDomain: string | null
  description: string
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role config')
  return createClient(url, key)
}

export async function getUserStudyState(userId: string): Promise<UserStudyState> {
  const sb = getServiceClient()

  const { data: profile } = await sb
    .from('profiles')
    .select('exam_date, study_days_per_week, target_cert, experience_level')
    .eq('id', userId)
    .single()

  const examDate = profile?.exam_date ?? null
  const daysRemaining = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)
    : null

  const targetCert = (profile?.target_cert ?? 'CRCST') as string
  const studyDaysPerWeek = profile?.study_days_per_week ?? 3

  const resultsTable = `${targetCert.toLowerCase()}_quiz_results`
  const { data: recentResults } = await sb
    .from(resultsTable)
    .select('percentage, domains, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const readinessScore = computeReadiness(recentResults ?? [])
  const weakDomains = computeWeakDomains(recentResults ?? [])

  const { data: streakData } = await sb
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()
  const streak = streakData ? await getStreakCount(userId, sb) : 0

  return {
    userId,
    examDate,
    daysRemaining,
    readinessScore,
    weakDomains,
    studyDaysPerWeek,
    targetCert,
    streak,
  }
}

function computeReadiness(results: { percentage: number }[]): number {
  if (results.length === 0) return 50
  const weights = results.map((_, i) => 1 / (i + 1))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const weighted = results.reduce((sum, r, i) => sum + r.percentage * weights[i], 0)
  return Math.round(weighted / totalWeight)
}

function computeWeakDomains(
  results: { domains?: Record<string, { correct: number; total: number }> | null }[]
): string[] {
  const domainStats: Record<string, { correct: number; total: number }> = {}

  for (const r of results) {
    if (!r.domains) continue
    for (const [domain, stats] of Object.entries(r.domains)) {
      if (!domainStats[domain]) domainStats[domain] = { correct: 0, total: 0 }
      domainStats[domain].correct += stats.correct
      domainStats[domain].total += stats.total
    }
  }

  return Object.entries(domainStats)
    .filter(([, s]) => s.total >= 3)
    .map(([domain, s]) => ({ domain, pct: s.correct / s.total }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3)
    .map((x) => x.domain)
}

async function getStreakCount(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: SupabaseClient<any>
): Promise<number> {
  const tables = ['crcst_quiz_results', 'chl_quiz_results', 'cer_quiz_results']
  const allDates = new Set<string>()

  for (const table of tables) {
    const { data } = await sb
      .from(table)
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(60)
    for (const row of (data ?? []) as { created_at: string }[]) {
      allDates.add(new Date(row.created_at).toISOString().slice(0, 10))
    }
  }

  const sorted = Array.from(allDates).sort().reverse()
  if (sorted.length === 0) return 0

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86_400_000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getDailyQuota(state: UserStudyState): DailyQuota {
  const { daysRemaining, readinessScore, weakDomains, studyDaysPerWeek } = state

  let baseMinutes = 20
  if (daysRemaining !== null) {
    if (daysRemaining <= 7) baseMinutes = 45
    else if (daysRemaining <= 14) baseMinutes = 35
    else if (daysRemaining <= 30) baseMinutes = 30
    else if (daysRemaining <= 60) baseMinutes = 25
  }

  const intensityMultiplier = readinessScore < 60 ? 1.2 : readinessScore > 80 ? 0.85 : 1

  const totalMinutes = Math.round(baseMinutes * intensityMultiplier)

  const questionsPerMinute = 1.5
  const totalQ = Math.round(totalMinutes * questionsPerMinute)

  let dueReviews: number
  let weakDomainQuestions: number
  let mockQuestions: number

  if (daysRemaining !== null && daysRemaining <= 14) {
    dueReviews = Math.round(totalQ * 0.3)
    weakDomainQuestions = Math.round(totalQ * 0.3)
    mockQuestions = Math.round(totalQ * 0.4)
  } else if (readinessScore < 60) {
    dueReviews = Math.round(totalQ * 0.4)
    weakDomainQuestions = Math.round(totalQ * 0.45)
    mockQuestions = Math.round(totalQ * 0.15)
  } else {
    dueReviews = Math.round(totalQ * 0.5)
    weakDomainQuestions = Math.round(totalQ * 0.3)
    mockQuestions = Math.round(totalQ * 0.2)
  }

  const totalActual = dueReviews + weakDomainQuestions + mockQuestions
  const diff = totalQ - totalActual
  dueReviews += diff

  const primaryDomain = weakDomains[0] ?? null

  let description: string
  if (daysRemaining !== null && daysRemaining <= 0) {
    description = 'Exam day — good luck!'
  } else if (daysRemaining !== null && daysRemaining <= 7) {
    description = `Final push — ${daysRemaining}d left. Focus on weak spots and mock questions.`
  } else if (daysRemaining !== null) {
    description = `${daysRemaining} days to exam · ${totalMinutes} min session`
  } else {
    description = `${totalMinutes} min session · ${studyDaysPerWeek}x/week target`
  }

  return { dueReviews, weakDomainQuestions, mockQuestions, totalMinutes, primaryDomain, description }
}
