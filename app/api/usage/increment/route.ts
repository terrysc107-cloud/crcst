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

    // Check if user can still access the feature BEFORE incrementing
    const feature = field === 'questions_attempted' ? 'questions' : 'ai_chat'
    const accessBefore = await canUserAccessPaidFeature(user.id, feature)

    if (!accessBefore.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        message: accessBefore.reason,
        used: accessBefore.used,
        limit: accessBefore.limit,
      }, { status: 429 })
    }

    // Increment usage
    const result = await incrementDailyUsage(user.id, field)

    // Check limit again after incrementing
    const accessAfter = await canUserAccessPaidFeature(user.id, feature)
    
    // For Pro/Triple Crown users, limit is -1 (unlimited) - return null instead
    const isUnlimited = accessAfter.limit === -1

    return NextResponse.json({
      success: result.success,
      used: result.newCount,
      limit: isUnlimited ? null : accessAfter.limit,
      remaining: isUnlimited ? null : (accessAfter.limit ? Math.max(0, accessAfter.limit - result.newCount) : null),
      allowed: accessAfter.allowed,
      unlimited: isUnlimited,
    })
  } catch (error) {
    console.error('[usage/increment]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
