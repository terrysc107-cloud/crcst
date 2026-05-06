import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { QUESTIONS } from '@/lib/questions'
import { PROGRESSION_LEVELS, XP_RULES, XpBreakdown, LEVEL_BADGE_MAP } from '@/lib/progression-config'

export async function POST(req: NextRequest) {
  // Lazy-initialize clients inside handler so env vars are available at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Validate session using the anon key + auth header
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

  const body = await req.json()
  const { levelId, answers } = body as {
    levelId: number
    answers: Record<string, number> // questionId -> selected option index
  }

  const level = PROGRESSION_LEVELS.find(l => l.id === levelId)
  if (!level) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
  }

  // Score against server-side source of truth — never trust client score
  const questionIds = Object.keys(answers)
  let correct = 0
  const incorrectItems: {
    questionId: string
    questionText: string
    selectedAnswer: number
    correctAnswer: number
    explanation: string
    domain: string
  }[] = []

  for (const qId of questionIds) {
    const question = QUESTIONS.find(q => q.id === qId)
    if (!question) continue
    const selected = answers[qId]
    if (selected === question.correct_answer) {
      correct++
    } else {
      incorrectItems.push({
        questionId: qId,
        questionText: question.question,
        selectedAnswer: selected,
        correctAnswer: question.correct_answer,
        explanation: question.explanation,
        domain: question.domain,
      })
    }
  }

  const total = questionIds.length
  const score = total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : 0
  const passed = score >= level.passingScore

  // Record the attempt
  await supabaseAdmin.from('progression_attempts').insert({
    user_id: user.id,
    level_id: levelId,
    score,
    passed,
  })

  // Update user_levels
  const { data: existing } = await supabaseAdmin
    .from('user_levels')
    .select('best_score, status')
    .eq('user_id', user.id)
    .eq('level_id', levelId)
    .maybeSingle()

  const newBestScore = existing?.best_score
    ? Math.max(Number(existing.best_score), score)
    : score

  await supabaseAdmin
    .from('user_levels')
    .upsert({
      user_id: user.id,
      level_id: levelId,
      status: passed ? 'completed' : (existing?.status ?? 'unlocked'),
      best_score: newBestScore,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,level_id' })

  // Unlock next level if passed
  if (passed && levelId < 5) {
    await supabaseAdmin
      .from('user_levels')
      .upsert({
        user_id: user.id,
        level_id: levelId + 1,
        status: 'unlocked',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,level_id' })
  }

  // Check bonus triggers — derive from attempts table (no drift-prone counter)
  const bonusUnlocked: string[] = []

  // 1. Real Case Breakdown — complete 2 consecutive levels
  const { data: recentPasses } = await supabaseAdmin
    .from('progression_attempts')
    .select('level_id, passed')
    .eq('user_id', user.id)
    .eq('passed', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (passed && recentPasses) {
    const passedLevels = new Set(recentPasses.map(a => a.level_id))
    // Check if two consecutive levels (including current) are both passed
    const consecutive =
      (passedLevels.has(levelId) && passedLevels.has(levelId - 1)) ||
      (passedLevels.has(levelId) && passedLevels.has(levelId + 1))

    if (consecutive) {
      const { error } = await supabaseAdmin
        .from('bonus_unlocks')
        .upsert({ user_id: user.id, module_id: 'real-case-breakdown' }, { onConflict: 'user_id,module_id', ignoreDuplicates: true })
      if (!error) bonusUnlocked.push('real-case-breakdown')
    }
  }

  // 2. Speed Round — score >= 90 on any level
  if (passed && score >= 90) {
    const { error } = await supabaseAdmin
      .from('bonus_unlocks')
      .upsert({ user_id: user.id, module_id: 'speed-round' }, { onConflict: 'user_id,module_id', ignoreDuplicates: true })
    if (!error) bonusUnlocked.push('speed-round')
  }

  // 3. Critical Mistakes Vault — fail same level 2+ times
  if (!passed) {
    const { count } = await supabaseAdmin
      .from('progression_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('level_id', levelId)
      .eq('passed', false)

    if ((count ?? 0) >= 2) {
      const { error } = await supabaseAdmin
        .from('bonus_unlocks')
        .upsert({ user_id: user.id, module_id: 'critical-mistakes-vault' }, { onConflict: 'user_id,module_id', ignoreDuplicates: true })
      if (!error) bonusUnlocked.push('critical-mistakes-vault')
    }
  }

  // ─── XP Calculation ───────────────────────────────────────────────────────

  // Was this the first-ever pass of this level?
  const { count: priorPassCount } = await supabaseAdmin
    .from('progression_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('level_id', levelId)
    .eq('passed', true)

  const isFirstPass = passed && (priorPassCount ?? 0) === 1 // current attempt was just inserted

  const xpBreakdown: XpBreakdown = {
    attempt: XP_RULES.attempt,
    pass: passed ? XP_RULES.pass : 0,
    firstPass: isFirstPass ? XP_RULES.firstPass : 0,
    precision: passed && score >= 90 ? XP_RULES.precision : 0,
    total: 0,
  }
  xpBreakdown.total = xpBreakdown.attempt + xpBreakdown.pass + xpBreakdown.firstPass + xpBreakdown.precision

  // Upsert user_xp — increment atomically
  const { data: xpRow } = await supabaseAdmin
    .from('user_xp')
    .select('total_xp')
    .eq('user_id', user.id)
    .maybeSingle()

  const newTotal = (xpRow?.total_xp ?? 0) + xpBreakdown.total

  await supabaseAdmin
    .from('user_xp')
    .upsert({
      user_id: user.id,
      total_xp: newTotal,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  // ─── Badge Awarding ───────────────────────────────────────────────────────

  const badgesEarned: string[] = []

  async function awardBadge(badgeId: string) {
    const { error } = await supabaseAdmin
      .from('progression_badges')
      .upsert({ user_id: user.id, badge_id: badgeId }, { onConflict: 'user_id,badge_id', ignoreDuplicates: true })
    if (!error) badgesEarned.push(badgeId)
  }

  if (passed) {
    // Domain Mastered badge for this level
    const domainBadge = LEVEL_BADGE_MAP[levelId]
    if (domainBadge) await awardBadge(domainBadge)

    // Full Circuit — all 5 levels completed
    const { data: completedLevels } = await supabaseAdmin
      .from('user_levels')
      .select('level_id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
    if ((completedLevels?.length ?? 0) >= 5) await awardBadge('full-circuit')

    // Precision — 90%+ on any level
    if (score >= 90) await awardBadge('precision')

    // Perfect Round — 100%
    if (score === 100) await awardBadge('perfect-round')
  }

  return NextResponse.json({
    passed,
    score,
    correct,
    total,
    incorrectItems,
    bonusUnlocked,
    nextLevelUnlocked: passed && levelId < 5 ? levelId + 1 : null,
    xpBreakdown,
    totalXp: newTotal,
    badgesEarned,
  })
}
