import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSquareClient, SQUARE_LOCATION_ID, PLAN_PRICES } from '@/lib/square'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, email } = await request.json()

    if (!plan || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (plan !== 'pro' && plan !== 'lifetime') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const square = getSquareClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spdcertprep.com'
    const idempotencyKey = randomUUID()

    if (plan === 'lifetime') {
      // One-time payment via Square Payment Link
      const { result } = await square.checkoutApi.createPaymentLink({
        idempotencyKey,
        order: {
          locationId: SQUARE_LOCATION_ID,
          lineItems: [
            {
              name: 'SPD Cert Companion — Lifetime Access',
              quantity: '1',
              basePriceMoney: {
                amount: PLAN_PRICES.lifetime.amount,
                currency: PLAN_PRICES.lifetime.currency,
              },
            },
          ],
          metadata: {
            userId,
            plan: 'lifetime',
          },
        },
        checkoutOptions: {
          redirectUrl: `${baseUrl}/payment/success?plan=lifetime`,
          askForShippingAddress: false,
          merchantSupportEmail: email,
        },
        prePopulatedData: {
          buyerEmail: email,
        },
      })

      if (!result.paymentLink?.url) {
        throw new Error('Failed to create Square payment link')
      }

      return NextResponse.json({ checkoutUrl: result.paymentLink.url })
    }

    if (plan === 'pro') {
      // Subscription via Square Subscriptions API
      // First, create or find the customer
      const { result: customerResult } = await square.customersApi.searchCustomers({
        query: {
          filter: {
            emailAddress: {
              exact: email,
            },
          },
        },
      })

      let customerId: string
      if (customerResult.customers && customerResult.customers.length > 0) {
        customerId = customerResult.customers[0].id!
      } else {
        const { result: newCustomer } = await square.customersApi.createCustomer({
          idempotencyKey: randomUUID(),
          emailAddress: email,
          referenceId: userId,
        })
        customerId = newCustomer.customer!.id!
      }

      // Create a checkout for the subscription first payment + card on file
      const { result } = await square.checkoutApi.createPaymentLink({
        idempotencyKey,
        order: {
          locationId: SQUARE_LOCATION_ID,
          lineItems: [
            {
              name: 'SPD Cert Companion Pro — Monthly Subscription',
              quantity: '1',
              basePriceMoney: {
                amount: PLAN_PRICES.pro.amount,
                currency: PLAN_PRICES.pro.currency,
              },
            },
          ],
          metadata: {
            userId,
            plan: 'pro',
            customerId,
          },
        },
        checkoutOptions: {
          redirectUrl: `${baseUrl}/payment/success?plan=pro`,
          askForShippingAddress: false,
          merchantSupportEmail: email,
          subscriptionPlanId: PLAN_PRICES.pro.planVariationId,
        },
        prePopulatedData: {
          buyerEmail: email,
        },
      })

      if (!result.paymentLink?.url) {
        throw new Error('Failed to create Square payment link')
      }

      return NextResponse.json({ checkoutUrl: result.paymentLink.url })
    }
  } catch (error) {
    console.error('[payment/checkout]', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
