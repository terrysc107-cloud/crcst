import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSubscription, getHourlyUsage, FREE_LIMITS } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: request.headers.get('Authorization') || '' },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ plan: 'free', usage: null }, { status: 200 })
    }

    const [sub, usage] = await Promise.all([
      getUserSubscription(user.id),
      getHourlyUsage(user.id),
    ])

    const plan = sub?.status === 'active' ? sub.tier : 'free'

    return NextResponse.json({
      plan,
      status: sub?.status || 'none',
      currentPeriodEnd: sub?.current_period_end || null,
      usage: {
        questionsThisHour: usage.questions_attempted,
        aiChatsToday: usage.ai_chats_used,
        questionsLimit: plan === 'free' ? FREE_LIMITS.questionsPerHour : null,
        aiChatsLimit: plan === 'free' ? FREE_LIMITS.aiChatsPerDay : null,
      },
    })
  } catch (error) {
    console.error('[payment/status]', error)
    return NextResponse.json({ plan: 'free', usage: null })
  }
}
