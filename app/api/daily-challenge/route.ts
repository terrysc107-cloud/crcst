import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getDailyChallenge, getUserDailyResult, saveDailyChallengeResult } from '@/lib/dal/daily-challenge'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// GET — fetch today's challenge + whether the user has already done it
export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  let userId: string | null = null
  if (token) {
    const sb = getServiceClient()
    const { data: { user } } = await sb.auth.getUser(token)
    userId = user?.id ?? null
  }

  const challenge = await getDailyChallenge()
  const userResult = userId ? await getUserDailyResult(userId) : null

  return NextResponse.json({
    date: challenge.date,
    questionIds: challenge.questionIds,
    questions: challenge.questions,
    userResult,
  })
}

// POST — submit results
export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceClient()
  const { data: { user } } = await sb.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score, total } = await req.json()
  const { percentile } = await saveDailyChallengeResult(user.id, score, total)

  return NextResponse.json({ percentile })
}
