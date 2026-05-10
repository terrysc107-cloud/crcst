import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { QUESTIONS } from '@/lib/questions'
import { PROGRESSION_LEVELS } from '@/lib/progression-config'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { levelId, answers, durationSeconds = 0 } = body as {
    levelId: number
    answers: Record<string, number>
    durationSeconds?: number
  }

  const level = PROGRESSION_LEVELS.find(l => l.id === levelId)
  if (!level) return NextResponse.json({ error: 'Invalid level' }, { status: 400 })

  // Grade server-side
  const questionIds = Object.keys(answers)
  let correct = 0
  for (const qId of questionIds) {
    const question = QUESTIONS.find(q => q.id === qId)
    if (!question) continue
    if (answers[qId] === question.correct_answer) correct++
  }
  const total = questionIds.length
  const score = total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : 0

  // Look up the ceu_module for this level
  const { data: ceuMod } = await supabaseAdmin
    .from('ceu_modules')
    .select('id, contact_hours')
    .eq('level_id', levelId)
    .maybeSingle()

  if (!ceuMod) return NextResponse.json({ error: 'Module not found' }, { status: 404 })

  // Upsert user_ceu_completions (allow retakes but don't double-count)
  const { data: existing } = await supabaseAdmin
    .from('user_ceu_completions')
    .select('id, ceu_earned')
    .eq('user_id', user.id)
    .eq('module_id', ceuMod.id)
    .maybeSingle()

  const alreadyCompleted = !!existing

  await supabaseAdmin
    .from('user_ceu_completions')
    .upsert({
      user_id: user.id,
      module_id: ceuMod.id,
      score_pct: score,
      ceu_earned: ceuMod.contact_hours,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,module_id' })

  // Log user_session (always log each attempt for study time tracking)
  await supabaseAdmin
    .from('user_sessions')
    .insert({
      user_id: user.id,
      activity_type: 'progression',
      cert: 'crcst',
      duration_seconds: Math.max(0, Math.min(durationSeconds, 7200)),
      questions_answered: total,
      score_pct: score,
      xp_earned: 0,
      started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      completed_at: new Date().toISOString(),
    })

  // Increment profiles.total_study_seconds
  await supabaseAdmin.rpc('increment_study_seconds', {
    p_user_id: user.id,
    p_seconds: Math.max(0, Math.min(durationSeconds, 7200)),
  })

  return NextResponse.json({
    score,
    correct,
    total,
    ceuEarned: Number(ceuMod.contact_hours),
    alreadyCompleted,
  })
}
