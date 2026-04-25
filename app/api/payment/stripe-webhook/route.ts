import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Fix 5: Explicit webhook secret guard — fail fast if not configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    // Fix 5: Explicit signature header guard
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error("Webhook signature verification failed:", error.message)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const supabaseUid = session.metadata?.supabase_uid
        const tier = session.metadata?.tier || "pro"

        if (supabaseUid && ["pro", "triple_crown"].includes(tier)) {
          // Calculate 90-day expiry
          const now = new Date()
          const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

          // Upsert user's tier and expiry in profiles table (insert if not exists, update if exists)
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              id: supabaseUid,
              tier,
              tier_expires_at: expiresAt.toISOString(),
              stripe_customer_id: session.customer as string,
              created_at: new Date().toISOString(),
            }, { onConflict: 'id' })

          if (upsertError) {
            console.error("Failed to upsert profile:", upsertError)
          } else {
            console.log(`Successfully upgraded user ${supabaseUid} to ${tier}`)
          }
        }
        break
      }

      case "charge.refunded": {
        // Fix 2: Handle refunds — revoke access immediately when a charge is refunded
        const charge = event.data.object as Stripe.Charge
        const stripeCustomerId = charge.customer as string

        if (stripeCustomerId) {
          // Look up user by Stripe customer ID
          const { data: profile, error: lookupError } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", stripeCustomerId)
            .single()

          if (lookupError || !profile) {
            console.error("Failed to find profile for customer:", stripeCustomerId, lookupError)
          } else {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                tier: "free",
                tier_expires_at: null,
              })
              .eq("id", profile.id)

            if (updateError) {
              console.error("Failed to revoke access after refund:", updateError)
            } else {
              console.log(`Revoked access for user ${profile.id} after refund`)
            }
          }
        }
        break
      }

      case "customer.subscription.updated": {
        // Not used for one-time payments, but kept for reference
        break
      }

      case "customer.subscription.deleted": {
        // Not used for one-time payments, but kept for reference
        break
      }

      case "invoice.payment_succeeded": {
        // Handle successful payment if needed
        break
      }

      case "invoice.payment_failed": {
        // Handle failed payment if needed
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}
