import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getUserStudyState, getDailyQuota } from '@/lib/dal/study-plan'
import { weeklyReadinessHtml, weeklyReadinessText } from '@/lib/email-templates'

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow cron (secret header) or service-role token
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`
  if (!isCron) {
    const sb = serviceClient()
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: { user } } = await sb.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const sb = serviceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://spdcertcompanion.com'

  // Fetch all users who have an exam date set and completed onboarding
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, display_name, exam_date, target_cert')
    .not('exam_date', 'is', null)
    .not('onboarding_completed_at', 'is', null)
    .limit(500)

  if (error || !profiles) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }

  // Fetch emails via auth admin
  const results = { sent: 0, skipped: 0, errors: 0 }

  for (const profile of profiles) {
    try {
      const { data: { user } } = await sb.auth.admin.getUserById(profile.id)
      if (!user?.email) { results.skipped++; continue }

      const state = await getUserStudyState(profile.id)
      const quota = getDailyQuota(state)

      // Compute week-over-week change from last 2 weeks of results
      const cert = (profile.target_cert ?? 'crcst').toLowerCase()
      const table = `${cert}_quiz_results`
      const { data: recentResults } = await sb
        .from(table)
        .select('percentage, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const now = Date.now()
      const oneWeek = 7 * 86_400_000
      const thisWeek = (recentResults ?? []).filter(r => now - new Date(r.created_at).getTime() < oneWeek)
      const lastWeek = (recentResults ?? []).filter(r => {
        const age = now - new Date(r.created_at).getTime()
        return age >= oneWeek && age < 2 * oneWeek
      })

      const avg = (rows: { percentage: number }[]) =>
        rows.length ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length) : null

      const thisAvg = avg(thisWeek) ?? state.readinessScore
      const lastAvg = avg(lastWeek) ?? state.readinessScore
      const change = thisAvg - lastAvg

      const html = weeklyReadinessHtml({
        userName: profile.display_name ?? user.email.split('@')[0],
        userEmail: user.email,
        targetCert: (profile.target_cert ?? 'CRCST').toUpperCase(),
        readinessScore: thisAvg,
        readinessChange: change,
        weakDomain: state.weakDomains[0] ?? null,
        suggestedSessions: state.studyDaysPerWeek,
        examDate: state.examDate,
        daysRemaining: state.daysRemaining,
        appUrl,
      })

      const text = weeklyReadinessText({
        userName: profile.display_name ?? user.email.split('@')[0],
        userEmail: user.email,
        targetCert: (profile.target_cert ?? 'CRCST').toUpperCase(),
        readinessScore: thisAvg,
        readinessChange: change,
        weakDomain: state.weakDomains[0] ?? null,
        suggestedSessions: state.studyDaysPerWeek,
        examDate: state.examDate,
        daysRemaining: state.daysRemaining,
        appUrl,
      })

      await resend.emails.send({
        from: 'SPD Cert Companion <noreply@spdcertcompanion.com>',
        to: user.email,
        subject: `Your ${quota.totalMinutes}-min study plan for this week`,
        html,
        text,
      })

      results.sent++
    } catch {
      results.errors++
    }
  }

  return NextResponse.json(results)
}
