import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { incrementDailyUsage, canUserAccessPaidFeature } from '@/lib/subscription'

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const field = body.field as 'questions_attempted' | 'ai_chats_used'

    if (!field || !['questions_attempted', 'ai_chats_used'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

    // Check if user can still access the feature
    const feature = field === 'questions_attempted' ? 'questions' : 'ai_chat'
    const access = await canUserAccessPaidFeature(user.id, feature)

    if (!access.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        message: access.reason,
        used: access.used,
        limit: access.limit,
      }, { status: 429 })
    }

    // Increment usage
    const result = await incrementDailyUsage(user.id, field)

    return NextResponse.json({
      success: result.success,
      used: result.newCount,
      limit: access.limit,
      remaining: access.limit ? Math.max(0, access.limit - result.newCount) : null,
    })
  } catch (error) {
    console.error('[usage/increment]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
