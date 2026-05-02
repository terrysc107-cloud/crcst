'use client'

import { supabase } from '@/lib/supabase'

export interface GamificationResult {
  xpAwarded: number
  leveledUp: boolean
  oldLevel: number
  current_level: number
  level_name: string
  newBadges: string[]
  streak: number
  streakBroken: boolean
  freezeUsed: boolean
}

export async function runGamificationAfterQuiz(params: {
  correct: number
  total: number
  difficulty: string
  mode: string
  mockPassed?: boolean
  consecutiveCorrect?: number
}): Promise<GamificationResult | null> {
  try {
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (!token) return null

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const [xpRes, streakRes, badgeRes] = await Promise.allSettled([
      fetch('/api/xp/award', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          correct: params.correct,
          total: params.total,
          difficulty: params.difficulty,
          reason: 'quiz_complete',
          isMockPassed: params.mockPassed ?? false,
        }),
      }).then(r => r.json()),

      fetch('/api/streaks/activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),

      fetch('/api/badges/check', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mockPassed: params.mockPassed ?? false,
          consecutiveCorrect: params.consecutiveCorrect ?? 0,
        }),
      }).then(r => r.json()),
    ])

    const xp     = xpRes.status === 'fulfilled'    ? xpRes.value     : {}
    const streak = streakRes.status === 'fulfilled' ? streakRes.value : {}
    const badges = badgeRes.status === 'fulfilled'  ? badgeRes.value  : {}

    return {
      xpAwarded: xp.xpAwarded ?? 0,
      leveledUp: xp.leveledUp ?? false,
      oldLevel: xp.oldLevel ?? 1,
      current_level: xp.current_level ?? 1,
      level_name: xp.level_name ?? '',
      newBadges: badges.newBadges ?? [],
      streak: streak.current_streak ?? 0,
      streakBroken: streak.streak_broken ?? false,
      freezeUsed: streak.freeze_used ?? false,
    }
  } catch (err) {
    console.error('Gamification error:', err)
    return null
  }
}
