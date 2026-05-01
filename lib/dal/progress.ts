import { createServiceClient } from '@/lib/supabase/server'
import type { CertType } from '@/lib/dal/quiz'
import { getQuizResults } from '@/lib/dal/quiz'

export interface ProgressSummary {
  certType: CertType
  totalAttempted: number
  averageScore: number
  bestScore: number
  lastAttemptAt: string | null
}

export async function getProgressSummary(userId: string): Promise<ProgressSummary[]> {
  const certTypes: CertType[] = ['CRCST', 'CHL', 'CER']
  const summaries = await Promise.all(
    certTypes.map(async (certType) => {
      const results = await getQuizResults(userId, certType, 50)
      if (results.length === 0) {
        return { certType, totalAttempted: 0, averageScore: 0, bestScore: 0, lastAttemptAt: null }
      }
      const scores = results.map(r => r.percentage)
      return {
        certType,
        totalAttempted: results.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        bestScore: Math.max(...scores),
        lastAttemptAt: results[0].created_at,
      }
    })
  )
  return summaries
}

export async function getDailyUsageSummary(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_hourly_usage', { p_user_id: userId })
  if (error || !data || data.length === 0) {
    return { questions_attempted: 0, ai_chats_used: 0 }
  }
  const row = data[0] ?? { questions_count: 0, chats_count: 0 }
  return {
    questions_attempted: Number(row.questions_count) || 0,
    ai_chats_used: Number(row.chats_count) || 0,
  }
}
