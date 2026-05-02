import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { awardXp, calculateQuizXp } from '@/lib/dal/xp'

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

  const body = await req.json()
  const { correct, total, difficulty, reason } = body

  const xpAmount = calculateQuizXp({
    correct: correct ?? 0,
    total: total ?? 1,
    difficulty: difficulty ?? 'all',
    isMockPassed: body.isMockPassed ?? false,
  })

  const result = await awardXp(user.id, xpAmount, reason ?? 'quiz_complete')

  return NextResponse.json({
    xpAwarded: xpAmount,
    ...result.newState,
    leveledUp: result.leveledUp,
    oldLevel: result.oldLevel,
  })
}
