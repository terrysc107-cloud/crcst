import { createClient } from "@supabase/supabase-js"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

// Read price IDs at runtime from server environment
const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || ""
const STRIPE_TRIPLE_CROWN_PRICE_ID = process.env.STRIPE_TRIPLE_CROWN_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_TRIPLE_CROWN_PRICE_ID || ""

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log("[v0] Stripe checkout API called")
  try {
    const { tier } = await request.json()
    console.log("[v0] Tier requested:", tier)

    if (!tier || !["pro", "triple_crown"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      )
    }

    // Get authenticated user
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get or create Stripe customer
    let customerId: string
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      })
      customerId = customer.id

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    // Select price ID based on tier
    const priceId = tier === "pro" ? STRIPE_PRO_PRICE_ID : STRIPE_TRIPLE_CROWN_PRICE_ID

    // Validate price ID is set
    if (!priceId) {
      console.error(`Missing Stripe price ID for tier: ${tier}. PRO=${STRIPE_PRO_PRICE_ID}, TRIPLE_CROWN=${STRIPE_TRIPLE_CROWN_PRICE_ID}`)
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${tier} plan. Please contact support.` },
        { status: 500 }
      )
    }

    console.log("[v0] Creating checkout session with priceId:", priceId)
    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?plan=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        supabase_uid: user.id,
        tier,
      },
    })

    console.log("[v0] Checkout session created successfully, URL:", session.url)
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("[v0] Checkout error:", error.message, error)
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    )
  }
}
