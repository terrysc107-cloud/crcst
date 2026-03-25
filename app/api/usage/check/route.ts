import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { canUserAccessPaidFeature } from '@/lib/subscription'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feature = searchParams.get('feature') as 'questions' | 'ai_chat'

    if (!feature || !['questions', 'ai_chat'].includes(feature)) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
    }

    const access = await canUserAccessPaidFeature(user.id, feature)

    return NextResponse.json({
      allowed: access.allowed,
      reason: access.reason,
      used: access.used,
      limit: access.limit,
      remaining: access.limit ? access.limit - (access.used ?? 0) : null,
    })
  } catch (error) {
    console.error('[usage/check]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
