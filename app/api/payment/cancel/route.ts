import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader, createServiceClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientWithAuthHeader(request.headers.get('Authorization') || '')

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sub = await getUserSubscription(user.id)
    if (!sub || sub.tier === 'free') {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Mark the subscription as cancelled without revoking access immediately.
    // The user retains paid access until tier_expires_at is reached naturally.
    const serviceSupabase = createServiceClient()
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ cancelled: true } as any)
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
