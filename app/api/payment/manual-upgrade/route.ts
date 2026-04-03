import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint allows manual upgrade for users who paid but webhook didn't fire
// DELETE THIS FILE after webhook is properly configured
export async function POST(request: NextRequest) {
  try {
    const { email, tier } = await request.json()

    if (!email || !tier || !["pro", "triple_crown"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid email or tier" },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json(
        { error: "Failed to list users" },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate 90-day expiry
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Update user's tier
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        tier,
        tier_expires_at: expiresAt.toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile: " + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${email} upgraded to ${tier} until ${expiresAt.toISOString()}` 
    })
  } catch (error: any) {
    console.error("Manual upgrade error:", error)
    return NextResponse.json(
      { error: error.message || "Upgrade failed" },
      { status: 500 }
    )
  }
}
