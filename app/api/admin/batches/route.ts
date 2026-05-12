import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const UNAMBIGUOUS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

function randomCode(slug: string, tier: string): string {
  const tierShort = tier === "triple_crown" ? "TC" : "PRO"
  const rand = Array.from({ length: 4 }, () =>
    UNAMBIGUOUS[Math.floor(Math.random() * UNAMBIGUOUS.length)]
  ).join("")
  return `${slug}-${tierShort}-${rand}`
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function assertAdmin(request: NextRequest) {
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  const { data: { user } } = await anonClient.auth.getUser(token)
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

// GET /api/admin/batches — list all batches with usage stats
export async function GET(request: NextRequest) {
  const user = await assertAdmin(request)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const admin = adminClient()
  const { data: batches, error } = await admin
    .from("wholesale_batches")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach per-batch usage counts
  const batchIds = batches.map((b: any) => b.id)
  const { data: codes } = await admin
    .from("wholesale_codes")
    .select("batch_id, used_count")
    .in("batch_id", batchIds)

  const usageMap: Record<string, number> = {}
  for (const c of codes ?? []) {
    usageMap[c.batch_id] = (usageMap[c.batch_id] ?? 0) + (c.used_count > 0 ? 1 : 0)
  }

  const result = batches.map((b: any) => ({
    ...b,
    redeemed: usageMap[b.id] ?? 0,
    revenue: (b.price_per_seat * b.quantity).toFixed(2),
  }))

  return NextResponse.json({ batches: result })
}

// POST /api/admin/batches — create batch + generate codes
export async function POST(request: NextRequest) {
  const user = await assertAdmin(request)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const {
    org_name, org_slug, tier, quantity, price_per_seat,
    duration_days = 90, notes, channel = "wholesale", rep_name,
  } = await request.json()

  if (!org_name || !org_slug || !tier || !quantity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!["pro", "triple_crown"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
  }
  if (!["wholesale", "distributor", "giveaway"].includes(channel)) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 })
  }
  if (quantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
  }

  const slug = org_slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + Number(duration_days))

  const admin = adminClient()

  // Create batch
  const { data: batch, error: batchErr } = await admin
    .from("wholesale_batches")
    .insert({
      org_name, org_slug: slug, tier, quantity,
      price_per_seat: channel === "giveaway" ? 0 : price_per_seat,
      duration_days: Number(duration_days),
      expires_at: expiresAt.toISOString(),
      notes, channel, rep_name: rep_name || null,
    })
    .select()
    .single()

  if (batchErr) return NextResponse.json({ error: batchErr.message }, { status: 500 })

  // Generate unique codes
  const existingCodes = new Set<string>()
  const rows = []

  for (let i = 0; i < quantity; i++) {
    let code = randomCode(slug, tier)
    let attempts = 0
    while (existingCodes.has(code) && attempts < 10) {
      code = randomCode(slug, tier)
      attempts++
    }
    existingCodes.add(code)
    rows.push({
      code,
      label: org_name,
      tier,
      max_uses: 1,
      used_count: 0,
      duration_days,
      expires_at: expiresAt.toISOString(),
      is_active: true,
      batch_id: batch.id,
    })
  }

  const { error: codesErr } = await admin.from("wholesale_codes").insert(rows)
  if (codesErr) return NextResponse.json({ error: codesErr.message }, { status: 500 })

  return NextResponse.json({ batch, codes: rows.map((r) => r.code) })
}
