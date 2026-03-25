import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
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
        const tier = session.metadata?.tier || "PRO"

        if (supabaseUid) {
          // Update user subscription in database
          await supabase
            .from("subscriptions")
            .upsert({
              id: supabaseUid,
              tier,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("id", supabaseUid)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const supabaseUid = subscription.metadata?.supabase_uid

        if (supabaseUid) {
          const status = subscription.status === "active" ? "active" : "canceled"
          await supabase
            .from("subscriptions")
            .update({
              status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("id", supabaseUid)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const supabaseUid = subscription.metadata?.supabase_uid

        if (supabaseUid) {
          await supabase
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("id", supabaseUid)
        }
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
