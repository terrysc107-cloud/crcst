import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader } from '@/lib/supabase/server'
import { incrementDailyUsage, canUserAccessPaidFeature } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientWithAuthHeader(request.headers.get('Authorization') || '')

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const field = body.field as 'questions_attempted' | 'ai_chats_used'

    if (!field || !['questions_attempted', 'ai_chats_used'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

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

    const result = await incrementDailyUsage(user.id, field)
    const accessAfter = await canUserAccessPaidFeature(user.id, feature)
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
