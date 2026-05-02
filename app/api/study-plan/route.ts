import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserStudyState, getDailyQuota } from '@/lib/dal/study-plan'
import { getTodaysPlan } from '@/lib/plan'

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = serviceClient()
  const { data: { user }, error } = await sb.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const state = await getUserStudyState(user.id)
    const quota = getDailyQuota(state)
    const plan = getTodaysPlan(state, quota)

    return NextResponse.json({
      examDate: state.examDate,
      daysRemaining: state.daysRemaining,
      readinessScore: state.readinessScore,
      weakDomain: state.weakDomains[0] ?? null,
      targetCert: state.targetCert,
      dueReviews: quota.dueReviews,
      weakDomainQuestions: quota.weakDomainQuestions,
      mockQuestions: quota.mockQuestions,
      totalMinutes: quota.totalMinutes,
      description: quota.description,
      planLabel: plan.label,
    })
  } catch (err) {
    console.error('study-plan error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
