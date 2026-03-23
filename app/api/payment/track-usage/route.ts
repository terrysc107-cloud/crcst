import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { canUserAccessPaidFeature, incrementDailyUsage } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json() as { feature: 'questions' | 'ai_chat' }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: request.headers.get('Authorization') || '' },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Unauthenticated users: apply a soft guest limit via cookie, don't track server-side
    if (!user) {
      return NextResponse.json({ allowed: true, guest: true })
    }

    const access = await canUserAccessPaidFeature(user.id, feature)

    if (!access.allowed) {
      return NextResponse.json({ allowed: false, reason: access.reason, used: access.used, limit: access.limit }, { status: 403 })
    }

    // Increment usage counter
    await incrementDailyUsage(user.id, feature === 'questions' ? 'questions_attempted' : 'ai_chats_used')

    return NextResponse.json({ allowed: true, used: (access.used ?? 0) + 1, limit: access.limit })
  } catch (error) {
    console.error('[track-usage]', error)
    // Fail open — don't block users due to tracking errors
    return NextResponse.json({ allowed: true })
  }
}
