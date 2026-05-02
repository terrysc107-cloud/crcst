import { createClient } from '@supabase/supabase-js'

export interface StreakState {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  freeze_credits: number
  streak_broken: boolean       // true if it just detected a break
  freeze_used: boolean         // true if a freeze was auto-consumed to save it
}

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

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.round(ms / 86400000)
}

export async function recordActivity(userId: string, isPro: boolean): Promise<StreakState> {
  const sb = getServiceClient()
  const today = todayStr()

  const { data: existing } = await sb
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    // First ever activity
    const row = {
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      freeze_credits: 1,
      last_weekly_grant: today,
      last_monthly_grant: isPro ? today : null,
    }
    await sb.from('user_streaks').insert(row)

    await upsertDailyActivity(userId, today, sb)

    return {
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      freeze_credits: 1,
      streak_broken: false,
      freeze_used: false,
    }
  }

  const last = existing.last_activity_date
  const diff = last ? daysBetween(last, today) : 999
  let currentStreak = existing.current_streak
  let longestStreak = existing.longest_streak
  let freezeCredits = existing.freeze_credits
  let streakBroken = false
  let freezeUsed = false

  // Grant weekly/monthly freeze credits
  const lastWeekly  = existing.last_weekly_grant
  const lastMonthly = existing.last_monthly_grant

  let newLastWeekly  = lastWeekly
  let newLastMonthly = lastMonthly

  if (!lastWeekly || daysBetween(lastWeekly, today) >= 7) {
    freezeCredits = Math.min(freezeCredits + 1, 5)  // cap at 5
    newLastWeekly = today
  }
  if (isPro && (!lastMonthly || daysBetween(lastMonthly, today) >= 30)) {
    freezeCredits = Math.min(freezeCredits + 1, 5)
    newLastMonthly = today
  }

  if (diff === 0) {
    // Already active today — no change to streak count
  } else if (diff === 1) {
    // Consecutive day
    currentStreak++
    if (currentStreak > longestStreak) longestStreak = currentStreak
  } else if (diff === 2 && freezeCredits > 0) {
    // Missed exactly one day, auto-use a freeze
    freezeCredits--
    currentStreak++
    if (currentStreak > longestStreak) longestStreak = currentStreak
    freezeUsed = true
  } else if (diff > 1) {
    // Streak broken
    streakBroken = true
    currentStreak = 1
  }

  await sb.from('user_streaks').update({
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
    freeze_credits: freezeCredits,
    last_weekly_grant: newLastWeekly,
    last_monthly_grant: newLastMonthly,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)

  await upsertDailyActivity(userId, today, sb)

  return {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
    freeze_credits: freezeCredits,
    streak_broken: streakBroken,
    freeze_used: freezeUsed,
  }
}

export async function manualFreeze(userId: string): Promise<{ success: boolean; streak: number; creditsLeft: number }> {
  const sb = getServiceClient()
  const { data } = await sb
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data || data.freeze_credits < 1) {
    return { success: false, streak: data?.current_streak ?? 0, creditsLeft: 0 }
  }

  const today = todayStr()
  const newStreak = (data.current_streak ?? 0) + 1

  await sb.from('user_streaks').update({
    current_streak: newStreak,
    last_activity_date: today,
    freeze_credits: data.freeze_credits - 1,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)

  return { success: true, streak: newStreak, creditsLeft: data.freeze_credits - 1 }
}

export async function getStreakState(userId: string): Promise<StreakState> {
  const sb = getServiceClient()
  const { data } = await sb
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) return { current_streak: 0, longest_streak: 0, last_activity_date: null, freeze_credits: 0, streak_broken: false, freeze_used: false }

  const today = todayStr()
  const last = data.last_activity_date
  const diff = last ? daysBetween(last, today) : 999
  const streakBroken = diff > 1 && data.freeze_credits < 1

  return {
    current_streak: streakBroken ? 0 : data.current_streak,
    longest_streak: data.longest_streak,
    last_activity_date: last,
    freeze_credits: data.freeze_credits,
    streak_broken: streakBroken,
    freeze_used: false,
  }
}

async function upsertDailyActivity(userId: string, date: string, sb: ReturnType<typeof getServiceClient>) {
  await sb.from('user_daily_activity').upsert({
    user_id: userId,
    activity_date: date,
    questions_answered: 1,
  }, {
    onConflict: 'user_id,activity_date',
    ignoreDuplicates: false,
  })
}

export async function getDailyActivity(userId: string, weeks = 52): Promise<Array<{ date: string; count: number }>> {
  const sb = getServiceClient()
  const since = new Date()
  since.setDate(since.getDate() - weeks * 7)

  const { data } = await sb
    .from('user_daily_activity')
    .select('activity_date, questions_answered')
    .eq('user_id', userId)
    .gte('activity_date', since.toISOString().split('T')[0])
    .order('activity_date', { ascending: true })

  return (data ?? []).map(r => ({ date: r.activity_date, count: r.questions_answered }))
}
