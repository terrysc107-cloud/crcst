import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

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
