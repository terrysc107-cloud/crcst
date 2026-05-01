import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader } from '@/lib/supabase/server'
import { getUserSubscription, getHourlyUsage, getDailyAiChatUsage, FREE_LIMITS } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClientWithAuthHeader(request.headers.get('Authorization') || '')

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ plan: 'free', usage: null }, { status: 200 })
    }

    const [sub, hourlyUsage, dailyAiChats] = await Promise.all([
      getUserSubscription(user.id),
      getHourlyUsage(user.id),
      getDailyAiChatUsage(user.id),
    ])

    const plan = sub?.tier || 'free'

    return NextResponse.json({
      plan,
      status: sub?.status || 'none',
      currentPeriodEnd: sub?.current_period_end || null,
      usage: {
        questionsThisHour: hourlyUsage.questions_attempted,
        aiChatsToday: dailyAiChats,
        questionsLimit: plan === 'free' ? FREE_LIMITS.questionsPerHour : null,
        aiChatsLimit: plan === 'free' ? FREE_LIMITS.aiChatsPerDay : null,
      },
    })
  } catch (error) {
    console.error('[payment/status]', error)
    return NextResponse.json({ plan: 'free', usage: null })
  }
}
