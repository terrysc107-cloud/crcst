import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkAndAwardBadges } from '@/lib/dal/badges'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceClient()
  const { data: { user } } = await sb.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Gather stats for this user
  const [crcstCount, chlCount, cerCount, streakRow, badgeRow, dcRow, aiCount] = await Promise.all([
    sb.from('crcst_quiz_results').select('id, percentage, domains', { count: 'exact', head: false }).eq('user_id', user.id),
    sb.from('chl_quiz_results').select('id, percentage').eq('user_id', user.id),
    sb.from('cer_quiz_results').select('id, percentage').eq('user_id', user.id),
    sb.from('user_streaks').select('current_streak').eq('user_id', user.id).single(),
    sb.from('user_badges').select('badge_id').eq('user_id', user.id),
    sb.from('daily_challenge_results').select('challenge_date').eq('user_id', user.id).order('challenge_date', { ascending: false }),
    sb.from('xp_transactions').select('id', { count: 'exact' }).eq('user_id', user.id).eq('reason', 'ai_chat'),
  ])

  const body = await req.json()
  const { mockPassed = false, consecutiveCorrect = 0 } = body

  const allQuizResults = [
    ...(crcstCount.data ?? []),
    ...(chlCount.data ?? []),
    ...(cerCount.data ?? []),
  ]

  const totalQuizzes = allQuizResults.length

  // Count total questions answered from xp_transactions amounts
  const { data: txData } = await sb
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('reason', 'quiz_complete')

  const totalQuestionsAnswered = (txData ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0) / 8

  // Best domain percentage from crcst domains JSON
  let bestDomainPct = 0
  for (const r of (crcstCount.data ?? [])) {
    if (r.domains && Array.isArray(r.domains)) {
      for (const d of r.domains) {
        if (d.percentage > bestDomainPct) bestDomainPct = d.percentage
      }
    }
  }

  // Daily challenge streak
  const dcDates = (dcRow.data ?? []).map(r => r.challenge_date).sort().reverse()
  let dcStreak = 0
  let dcConsec = new Date()
  for (const d of dcDates) {
    const diff = Math.floor((dcConsec.getTime() - new Date(d).getTime()) / 86400000)
    if (diff <= 1) { dcStreak++; dcConsec = new Date(d) }
    else break
  }

  const newBadges = await checkAndAwardBadges({
    userId: user.id,
    totalQuizzes,
    currentStreak: streakRow.data?.current_streak ?? 0,
    totalQuestionsAnswered: Math.round(totalQuestionsAnswered),
    bestDomainPct,
    mockPassed,
    consecutiveCorrect,
    aiChatsTotal: aiCount.count ?? 0,
    dailyChallengesCompleted: dcDates.length,
    dailyChallengeStreak: dcStreak,
  })

  return NextResponse.json({ newBadges })
}
