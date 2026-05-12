import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

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

// GET /api/admin/batches/[id] — batch detail with all codes + redemptions
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await assertAdmin(request)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const admin = adminClient()

  const [batchRes, codesRes] = await Promise.all([
    admin.from("wholesale_batches").select("*").eq("id", id).single(),
    admin
      .from("wholesale_codes")
      .select("id, code, used_count, is_active, expires_at")
      .eq("batch_id", id)
      .order("code"),
  ])

  if (batchRes.error) return NextResponse.json({ error: batchRes.error.message }, { status: 500 })

  // Fetch redemption info for redeemed codes
  const redeemedCodeIds = (codesRes.data ?? [])
    .filter((c: any) => c.used_count > 0)
    .map((c: any) => c.id)

  let redemptions: any[] = []
  if (redeemedCodeIds.length > 0) {
    const { data } = await admin
      .from("wholesale_redemptions")
      .select("code_id, redeemed_at, user_id")
      .in("code_id", redeemedCodeIds)
    redemptions = data ?? []
  }

  const redemptionMap: Record<string, any> = {}
  for (const r of redemptions) {
    redemptionMap[r.code_id] = r
  }

  const codes = (codesRes.data ?? []).map((c: any) => ({
    ...c,
    redeemed: c.used_count > 0,
    redeemed_at: redemptionMap[c.id]?.redeemed_at ?? null,
  }))

  return NextResponse.json({ batch: batchRes.data, codes })
}
