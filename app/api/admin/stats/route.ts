import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

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

export async function GET(request: NextRequest) {
  const user = await assertAdmin(request)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date().toISOString()
  const day7  = new Date(Date.now() - 7  * 86400000).toISOString()
  const day30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const day90 = new Date(Date.now() - 90 * 86400000).toISOString()
  const soon  = new Date(Date.now() + 14 * 86400000).toISOString() // expires in ≤14 days

  const [
    profilesRes,
    active7Res,
    active30Res,
    newUsers7Res,
    newUsers30Res,
    questionsRes,
    expiringSoonRes,
    recentlyExpiredRes,
    topUsersRes,
    wholesaleRes,
  ] = await Promise.all([
    // All profiles with tier info
    admin.from("profiles").select("tier, tier_expires_at, created_at"),

    // Active last 7 days (distinct users who answered questions)
    admin.from("daily_usage").select("user_id").gte("created_at", day7),

    // Active last 30 days
    admin.from("daily_usage").select("user_id").gte("created_at", day30),

    // New signups last 7 days
    admin.from("profiles").select("id").gte("created_at", day7),

    // New signups last 30 days
    admin.from("profiles").select("id").gte("created_at", day30),

    // Total questions answered
    admin.from("question_attempts").select("id", { count: "exact", head: true }),

    // Paid users expiring in next 14 days
    admin.from("profiles")
      .select("id, tier, tier_expires_at")
      .in("tier", ["pro", "triple_crown"])
      .gte("tier_expires_at", now)
      .lte("tier_expires_at", soon),

    // Paid users whose tier expired in last 30 days (lapsed)
    admin.from("profiles")
      .select("id, tier, tier_expires_at")
      .in("tier", ["pro", "triple_crown"])
      .lt("tier_expires_at", now)
      .gte("tier_expires_at", day30),

    // Top 10 users by questions answered
    admin.from("question_attempts")
      .select("user_id")
      .gte("attempted_at", day30),

    // Wholesale summary
    admin.from("wholesale_batches").select("tier, quantity, price_per_seat"),
  ])

  const profiles = profilesRes.data ?? []

  // Tier breakdown
  const tierCounts = { free: 0, pro: 0, triple_crown: 0, expired: 0 }
  for (const p of profiles) {
    if (!p.tier || p.tier === "free") {
      tierCounts.free++
    } else if (p.tier_expires_at && new Date(p.tier_expires_at) < new Date()) {
      tierCounts.expired++
    } else if (p.tier === "pro") {
      tierCounts.pro++
    } else if (p.tier === "triple_crown") {
      tierCounts.triple_crown++
    }
  }

  // Active users (deduplicated)
  const active7  = new Set((active7Res.data ?? []).map((r: any) => r.user_id)).size
  const active30 = new Set((active30Res.data ?? []).map((r: any) => r.user_id)).size

  // Signups in last 30 days by week (for sparkline)
  const signupsByWeek = [0, 0, 0, 0]
  for (const p of profiles) {
    const daysAgo = (Date.now() - new Date(p.created_at).getTime()) / 86400000
    if (daysAgo <= 7)  signupsByWeek[3]++
    else if (daysAgo <= 14) signupsByWeek[2]++
    else if (daysAgo <= 21) signupsByWeek[1]++
    else if (daysAgo <= 28) signupsByWeek[0]++
  }

  // Top users by activity (last 30 days)
  const userActivity: Record<string, number> = {}
  for (const r of topUsersRes.data ?? []) {
    userActivity[r.user_id] = (userActivity[r.user_id] ?? 0) + 1
  }
  const topUserIds = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ user_id: id, questions_30d: count }))

  // Wholesale revenue
  const wholesaleRevenue = (wholesaleRes.data ?? []).reduce(
    (sum: number, b: any) => sum + b.price_per_seat * b.quantity, 0
  )

  return NextResponse.json({
    tiers: tierCounts,
    totalUsers: profiles.length,
    active7,
    active30,
    newUsers7:  newUsers7Res.data?.length ?? 0,
    newUsers30: newUsers30Res.data?.length ?? 0,
    totalQuestions: questionsRes.count ?? 0,
    expiringSoon:      expiringSoonRes.data ?? [],
    recentlyExpired:   recentlyExpiredRes.data ?? [],
    signupsByWeek,
    topUsers: topUserIds,
    wholesaleRevenue,
    wholesaleBatches: wholesaleRes.data?.length ?? 0,
  })
}
