import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { weeklyDigestHtml } from '@/lib/email-templates'

const CRON_SECRET = process.env.CRON_SECRET

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Called by Vercel Cron every Sunday at 08:00 UTC
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (CRON_SECRET && url.searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const sb = getServiceClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  // Get users active in the last 7 days
  const { data: activeUsers } = await sb
    .from('user_daily_activity')
    .select('user_id')
    .gte('activity_date', sevenDaysAgo)

  if (!activeUsers || activeUsers.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const uniqueIds = [...new Set(activeUsers.map(r => r.user_id))]
  const { data: users } = await sb.auth.admin.listUsers()
  const userMap = new Map(users?.users?.map(u => [u.id, u]) ?? [])

  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://spdcertcompanion.com'

  let sent = 0
  for (const userId of uniqueIds) {
    const user = userMap.get(userId)
    if (!user?.email) continue

    const [streakRow, weekActivity, recentResults] = await Promise.all([
      sb.from('user_streaks').select('current_streak').eq('user_id', userId).single(),
      sb.from('user_daily_activity').select('questions_answered').eq('user_id', userId).gte('activity_date', sevenDaysAgo),
      sb.from('crcst_quiz_results').select('percentage, domains').eq('user_id', userId).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()).order('created_at', { ascending: false }).limit(10),
    ])

    const questionsThisWeek = (weekActivity.data ?? []).reduce((s, r) => s + (r.questions_answered ?? 0), 0)

    const results = recentResults.data ?? []
    const avgScore = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length)
      : null

    // Find weakest domain
    const domainMap: Record<string, { correct: number; total: number }> = {}
    for (const r of results) {
      for (const d of (r.domains ?? [])) {
        if (!domainMap[d.name]) domainMap[d.name] = { correct: 0, total: 0 }
        domainMap[d.name].correct += d.correct
        domainMap[d.name].total   += d.total
      }
    }
    let weakDomain: string | null = null
    let worstPct = 101
    for (const [name, { correct, total }] of Object.entries(domainMap)) {
      if (total < 2) continue
      const pct = (correct / total) * 100
      if (pct < worstPct) { worstPct = pct; weakDomain = name }
    }

    const firstName = (user.user_metadata?.full_name ?? user.email.split('@')[0]).split(' ')[0]

    try {
      await resend.emails.send({
        from: 'SPD Cert Companion <noreply@spdcertcompanion.com>',
        to: user.email,
        subject: `📊 Your weekly readiness report is ready`,
        html: weeklyDigestHtml({
          firstName,
          streak: streakRow.data?.current_streak ?? 0,
          questionsThisWeek,
          avgScore,
          weakDomain,
          dashboardUrl,
        }),
      })
      sent++
    } catch (err) {
      console.error(`Failed to send weekly digest to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, total: uniqueIds.length })
}
