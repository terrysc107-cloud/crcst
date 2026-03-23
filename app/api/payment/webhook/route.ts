import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getServiceSupabase } from '@/lib/subscription'
import { getSquareClient } from '@/lib/square'

// Square webhook signature verification
function verifySquareSignature(
  body: string,
  signature: string,
  notificationUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!signatureKey) return false

  const hmac = createHmac('sha256', signatureKey)
  hmac.update(notificationUrl + body)
  const expected = hmac.digest('base64')
  return expected === signature
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-square-hmacsha256-signature') || ''
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`

  if (!verifySquareSignature(body, signature, notificationUrl)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const supabase = getServiceSupabase()

  try {
    const eventType = event.type as string

    // ── One-time payment completed (Lifetime) ──────────────────────────────
    if (eventType === 'payment.completed') {
      const payment = event.data?.object?.payment
      const orderId = payment?.order_id

      if (!orderId) return NextResponse.json({ ok: true })

      const square = getSquareClient()
      const { result: orderResult } = await square.ordersApi.retrieveOrder(orderId)
      const metadata = orderResult.order?.metadata

      if (metadata?.plan === 'lifetime' && metadata?.userId) {
        await upsertSubscription(supabase, {
          userId: metadata.userId,
          plan: 'lifetime',
          status: 'active',
          squareCustomerId: payment.customer_id || null,
        })
      }
    }

    // ── Subscription created ───────────────────────────────────────────────
    if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
      const sub = event.data?.object?.subscription
      if (!sub) return NextResponse.json({ ok: true })

      const customerId = sub.customer_id
      const square = getSquareClient()
      const { result: customerResult } = await square.customersApi.retrieveCustomer(customerId)
      const userId = customerResult.customer?.referenceId

      if (!userId) return NextResponse.json({ ok: true })

      const status =
        sub.status === 'ACTIVE'
          ? 'active'
          : sub.status === 'CANCELED'
          ? 'cancelled'
          : sub.status === 'PAUSED'
          ? 'paused'
          : 'past_due'

      await upsertSubscription(supabase, {
        userId,
        plan: 'pro',
        status,
        squareSubscriptionId: sub.id,
        squareCustomerId: customerId,
        currentPeriodEnd: sub.charged_through_date
          ? new Date(sub.charged_through_date).toISOString()
          : null,
      })
    }

    // ── Subscription cancelled ─────────────────────────────────────────────
    if (eventType === 'subscription.updated') {
      const sub = event.data?.object?.subscription
      if (sub?.status === 'CANCELED') {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('square_subscription_id', sub.id)
      }
    }
  } catch (error) {
    console.error('[webhook] processing error', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

async function upsertSubscription(
  supabase: ReturnType<typeof getServiceSupabase>,
  opts: {
    userId: string
    plan: 'pro' | 'lifetime'
    status: string
    squareSubscriptionId?: string | null
    squareCustomerId?: string | null
    currentPeriodEnd?: string | null
  }
) {
  await supabase.from('subscriptions').upsert(
    {
      user_id: opts.userId,
      plan: opts.plan,
      status: opts.status,
      square_subscription_id: opts.squareSubscriptionId ?? null,
      square_customer_id: opts.squareCustomerId ?? null,
      current_period_end: opts.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}
