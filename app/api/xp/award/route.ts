import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getXpTier } from '@/lib/progression-config'

export type QuizActivityType = 'practice' | 'test' | 'homework' | 'flashcard' | 'custom'
export type CertType = 'crcst' | 'chl' | 'cer'

// XP per non-progression activity
const ACTIVITY_XP: Record<QuizActivityType, number> = {
  practice:  5,
  test:      25,   // full exam
  homework:  10,
  flashcard: 3,
  custom:    5,
}

// Bonus XP thresholds (only for scored activities)
const SCORE_BONUS_THRESHOLD = 90
const SCORE_BONUS_XP = 10

interface AwardBody {
  activityType: QuizActivityType
  cert: CertType
  correct: number
  total: number
  elapsedSeconds: number
  domains?: Record<string, { correct: number; total: number }>
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as AwardBody
  const { activityType, cert, correct, total, elapsedSeconds, domains } = body

  if (!ACTIVITY_XP[activityType]) {
    return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 })
  }

  const scorePct = total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : null
  const baseXp = ACTIVITY_XP[activityType]
  const bonusXp = scorePct !== null && scorePct >= SCORE_BONUS_THRESHOLD ? SCORE_BONUS_XP : 0
  const xpEarned = baseXp + bonusXp

  // Write session record
  await supabaseAdmin.from('user_sessions').insert({
    user_id: user.id,
    activity_type: activityType,
    cert,
    duration_seconds: elapsedSeconds,
    questions_answered: total,
    score_pct: scorePct,
    xp_earned: xpEarned,
    started_at: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
    completed_at: new Date().toISOString(),
  })

  // Update user_xp — upsert + increment
  const { data: xpRow } = await supabaseAdmin
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', user.id)
    .maybeSingle()

  const newTotal = (xpRow?.total_xp ?? 0) + xpEarned

  await supabaseAdmin
    .from('user_xp')
    .upsert(
      { user_id: user.id, total_xp: newTotal, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  // Update domain mastery if domain breakdown provided
  if (domains && Object.keys(domains).length > 0) {
    for (const [domainName, stats] of Object.entries(domains)) {
      const { data: existing } = await supabaseAdmin
        .from('crcst_domain_mastery')
        .select('questions_answered, questions_correct')
        .eq('user_id', user.id)
        .eq('domain_name', domainName)
        .maybeSingle()

      const totalAnswered = (existing?.questions_answered ?? 0) + stats.total
      const totalCorrect = (existing?.questions_correct ?? 0) + stats.correct
      const masteryPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100 * 100) / 100 : 0

      await supabaseAdmin
        .from('crcst_domain_mastery')
        .upsert(
          {
            user_id: user.id,
            domain_name: domainName,
            questions_answered: totalAnswered,
            questions_correct: totalCorrect,
            mastery_pct: masteryPct,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,domain_name' }
        )
    }
  }

  const tier = getXpTier(newTotal)

  return NextResponse.json({
    xpEarned,
    totalXp: newTotal,
    tier: tier.label,
    tierColor: tier.color,
    breakdown: { base: baseXp, bonus: bonusXp },
  })
}
