import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader } from '@/lib/supabase/server'
import { canUserAccessPaidFeature, incrementDailyUsage } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json() as { feature: 'questions' | 'ai_chat' }

    const supabase = createClientWithAuthHeader(request.headers.get('Authorization') || '')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ allowed: true, guest: true })
    }

    const access = await canUserAccessPaidFeature(user.id, feature)

    if (!access.allowed) {
      return NextResponse.json({ allowed: false, reason: access.reason, used: access.used, limit: access.limit }, { status: 403 })
    }

    await incrementDailyUsage(user.id, feature === 'questions' ? 'questions_attempted' : 'ai_chats_used')

    return NextResponse.json({ allowed: true, used: (access.used ?? 0) + 1, limit: access.limit })
  } catch (error) {
    console.error('[track-usage]', error)
    return NextResponse.json({ allowed: true })
  }
}
