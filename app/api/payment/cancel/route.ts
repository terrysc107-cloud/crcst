import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSubscription, getServiceSupabase } from '@/lib/subscription'

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

    const sub = await getUserSubscription(user.id)
    if (!sub || sub.tier === 'free') {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Expire the tier immediately by setting tier_expires_at to now
    const serviceSupabase = getServiceSupabase()
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({
        tier: 'free',
        tier_expires_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[payment/cancel] DB update failed:', updateError)
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Subscription cancelled. Your access has been downgraded to Free.' })
  } catch (error) {
    console.error('[payment/cancel]', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
