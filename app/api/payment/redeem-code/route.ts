import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Authenticate
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code } = await request.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    const normalized = code.trim().toUpperCase()

    // Look up the code (service role bypasses RLS)
    const { data: wc, error: codeErr } = await admin
      .from("wholesale_codes")
      .select("id, tier, max_uses, used_count, duration_days, expires_at, is_active, label")
      .eq("code", normalized)
      .single()

    if (codeErr || !wc) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 })
    }

    if (!wc.is_active) {
      return NextResponse.json({ error: "This code is no longer active" }, { status: 400 })
    }

    if (wc.expires_at && new Date(wc.expires_at) < new Date()) {
      return NextResponse.json({ error: "This code has expired" }, { status: 400 })
    }

    if (wc.used_count >= wc.max_uses) {
      return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 })
    }

    // Check if user already redeemed this code
    const { data: existing } = await admin
      .from("wholesale_redemptions")
      .select("id")
      .eq("code_id", wc.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already redeemed this code" }, { status: 400 })
    }

    // Calculate new expiry
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + wc.duration_days)

    // Apply tier to profile
    await admin
      .from("profiles")
      .update({ tier: wc.tier, tier_expires_at: expiresAt.toISOString() })
      .eq("id", user.id)

    // Record redemption and increment used_count atomically
    await Promise.all([
      admin.from("wholesale_redemptions").insert({
        code_id: wc.id,
        user_id: user.id,
        tier_granted: wc.tier,
      }),
      admin.rpc("increment_wholesale_used_count", { code_id: wc.id }),
    ])

    return NextResponse.json({
      success: true,
      tier: wc.tier,
      expiresAt: expiresAt.toISOString(),
      durationDays: wc.duration_days,
    })
  } catch (err: any) {
    console.error("redeem-code error:", err)
    return NextResponse.json({ error: "Redemption failed" }, { status: 500 })
  }
}
