import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserSubscription, getServiceSupabase } from '@/lib/subscription'
import { getSquareClient } from '@/lib/square'

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
    if (!sub || sub.plan !== 'pro' || !sub.square_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const square = getSquareClient()
    await square.subscriptionsApi.cancelSubscription(sub.square_subscription_id)

    // Update local record — access stays active until period end
    const serviceSupabase = getServiceSupabase()
    await serviceSupabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true, message: 'Subscription cancelled. Access continues until period end.' })
  } catch (error) {
    console.error('[payment/cancel]', error)
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
  }
}
