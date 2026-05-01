import { createServiceClient } from '@/lib/supabase/server'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

export async function getStreak(userId: string): Promise<StreakData> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('daily_usage')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  const dates = [...new Set(data.map(r => r.created_at.slice(0, 10)))].sort().reverse()
  const lastActivityDate = dates[0] ?? null

  let currentStreak = 0
  let longestStreak = 0
  let streak = 0
  const today = new Date().toISOString().slice(0, 10)

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedStr = expected.toISOString().slice(0, 10)
    if (dates[i] === expectedStr) {
      streak++
      if (i === 0) currentStreak = streak
    } else {
      break
    }
  }

  // Compute longest streak from sorted dates
  let run = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) {
      run++
      longestStreak = Math.max(longestStreak, run)
    } else {
      run = 1
    }
  }
  longestStreak = Math.max(longestStreak, run, currentStreak)

  return { currentStreak, longestStreak, lastActivityDate }
}
