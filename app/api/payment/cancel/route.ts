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

    // Mark the subscription as cancelled without revoking access immediately.
    // The user retains paid access until tier_expires_at is reached naturally —
    // we do NOT set tier: 'free' or update tier_expires_at here.
    // Access will be downgraded automatically once tier_expires_at passes.
    const serviceSupabase = getServiceSupabase()
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({
        cancelled: true,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[payment/cancel] DB update failed:', updateError)
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Subscription cancelled. Your access will remain active until the end of your billing period.' })
  } catch (error) {
    console.error('[payment/cancel]', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
