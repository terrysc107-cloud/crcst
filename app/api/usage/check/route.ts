import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader } from '@/lib/supabase/server'
import { canUserAccessPaidFeature } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClientWithAuthHeader(request.headers.get('Authorization') || '')

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') as 'questions' | 'ai_chat'

    if (!feature || !['questions', 'ai_chat'].includes(feature)) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
    }

    const access = await canUserAccessPaidFeature(user.id, feature)
    const isUnlimited = access.limit === -1

    return NextResponse.json({
      allowed: access.allowed,
      reason: access.reason,
      used: access.used,
      limit: isUnlimited ? null : access.limit,
      remaining: isUnlimited ? null : (access.limit ? access.limit - (access.used ?? 0) : null),
      unlimited: isUnlimited,
    })
  } catch (error) {
    console.error('[usage/check]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
