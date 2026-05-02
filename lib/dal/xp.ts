import { createClient } from '@supabase/supabase-js'

// XP thresholds per level (cumulative total XP required to reach that level)
export const XP_LEVELS = [
  { level: 1,  name: 'Decon Apprentice',         minXp: 0     },
  { level: 2,  name: 'Instrument Handler',        minXp: 100   },
  { level: 3,  name: 'Tray Assembler',            minXp: 250   },
  { level: 4,  name: 'Sterile Tech',              minXp: 500   },
  { level: 5,  name: 'Sterile Steward',           minXp: 1000  },
  { level: 6,  name: 'CS Specialist',             minXp: 2000  },
  { level: 7,  name: 'Infection Prevention Pro',  minXp: 3500  },
  { level: 8,  name: 'Tray Sage',                 minXp: 6000  },
  { level: 9,  name: 'SPD Lead',                  minXp: 10000 },
  { level: 10, name: 'Chief Tech',                minXp: 15000 },
]

export interface XpState {
  total_xp: number
  current_level: number
  level_name: string
  level_progress_pct: number
  next_level_xp: number | null  // null at max level
}

export function computeLevel(totalXp: number): XpState {
  let current = XP_LEVELS[0]
  for (const lvl of XP_LEVELS) {
    if (totalXp >= lvl.minXp) current = lvl
    else break
  }

  const idx = XP_LEVELS.indexOf(current)
  const next = XP_LEVELS[idx + 1] ?? null

  const progressPct = next
    ? Math.round(((totalXp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100

  return {
    total_xp: totalXp,
    current_level: current.level,
    level_name: current.name,
    level_progress_pct: progressPct,
    next_level_xp: next?.minXp ?? null,
  }
}

// XP per correct answer by difficulty
export const XP_PER_CORRECT: Record<string, number> = {
  easy:    5,
  medium:  10,
  hard:    15,
  all:     8,    // default when difficulty is "all"
  mock:    10,
  practice: 8,
  flashcards: 5,
  custom:  8,
}

export function calculateQuizXp(params: {
  correct: number
  total: number
  difficulty: string
  isMockPassed?: boolean
}): number {
  const base = XP_PER_CORRECT[params.difficulty.toLowerCase()] ?? 8
  let xp = params.correct * base

  // first-attempt-correct bonus (scored >80%)
  const pct = params.total > 0 ? params.correct / params.total : 0
  if (pct >= 0.8) xp = Math.round(xp * 1.5)

  // mock exam pass bonus
  if (params.isMockPassed) xp += 50

  return xp
}

function getServiceClient() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function awardXp(userId: string, amount: number, reason: string): Promise<{ newState: XpState; leveledUp: boolean; oldLevel: number }> {
  const sb = getServiceClient()

  // Upsert the user_xp row
  const { data: existing } = await sb
    .from('user_xp')
    .select('total_xp, current_level')
    .eq('user_id', userId)
    .single()

  const oldXp    = existing?.total_xp    ?? 0
  const oldLevel = existing?.current_level ?? 1
  const newXp    = oldXp + amount
  const newState = computeLevel(newXp)

  await sb.from('user_xp').upsert({
    user_id: userId,
    total_xp: newXp,
    current_level: newState.current_level,
    level_progress_pct: newState.level_progress_pct,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Log transaction
  await sb.from('xp_transactions').insert({
    user_id: userId,
    amount,
    reason,
  })

  // Update daily activity xp
  const today = new Date().toISOString().split('T')[0]
  await sb.from('user_daily_activity').upsert({
    user_id: userId,
    activity_date: today,
    xp_earned: amount,
  }, {
    onConflict: 'user_id,activity_date',
    ignoreDuplicates: false,
  })

  return {
    newState,
    leveledUp: newState.current_level > oldLevel,
    oldLevel,
  }
}

export async function getUserXp(userId: string): Promise<XpState> {
  const sb = getServiceClient()
  const { data } = await sb
    .from('user_xp')
    .select('total_xp, current_level, level_progress_pct')
    .eq('user_id', userId)
    .single()

  return computeLevel(data?.total_xp ?? 0)
}
