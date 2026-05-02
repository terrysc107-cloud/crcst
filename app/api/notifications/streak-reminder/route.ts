import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { streakReminderHtml } from '@/lib/email-templates'

const CRON_SECRET = process.env.CRON_SECRET

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Called by Vercel Cron at 20:00 UTC daily
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const url = new URL(req.url)
  if (CRON_SECRET && url.searchParams.get('secret') !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const sb = getServiceClient()

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Find users with an active streak who haven't studied today
  const { data: atRisk } = await sb
    .from('user_streaks')
    .select('user_id, current_streak, freeze_credits')
    .gte('current_streak', 1)
    .lt('last_activity_date', today)            // hasn't studied today
    .gte('last_activity_date', yesterday)       // was active yesterday (streak not already broken)

  if (!atRisk || atRisk.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // Get emails for these users
  const userIds = atRisk.map(r => r.user_id)
  const { data: users } = await sb.auth.admin.listUsers()
  const userMap = new Map(users?.users?.map(u => [u.id, u]) ?? [])

  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://spdcertcompanion.com'

  let sent = 0
  for (const row of atRisk) {
    const user = userMap.get(row.user_id)
    if (!user?.email) continue

    const firstName = (user.user_metadata?.full_name ?? user.email.split('@')[0]).split(' ')[0]

    try {
      await resend.emails.send({
        from: 'SPD Cert Companion <noreply@spdcertcompanion.com>',
        to: user.email,
        subject: `🔥 Don't break your ${row.current_streak}-day streak!`,
        html: streakReminderHtml({
          firstName,
          streak: row.current_streak,
          freezeCredits: row.freeze_credits,
          dashboardUrl,
        }),
      })
      sent++
    } catch (err) {
      console.error(`Failed to send streak reminder to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, total: atRisk.length })
}
