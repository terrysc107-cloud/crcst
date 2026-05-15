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

function dateKey(iso: string) {
  return iso.slice(0, 10) // "YYYY-MM-DD"
}

function last14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000)
    return d.toISOString().slice(0, 10)
  })
}

export async function GET(request: NextRequest) {
  const user = await assertAdmin(request)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now   = new Date().toISOString()
  const day1  = new Date(Date.now() - 1  * 86400000).toISOString()
  const day7  = new Date(Date.now() - 7  * 86400000).toISOString()
  const day14 = new Date(Date.now() - 14 * 86400000).toISOString()
  const day30 = new Date(Date.now() - 30 * 86400000).toISOString()
  const soon  = new Date(Date.now() + 14 * 86400000).toISOString()

  const [
    profilesRes,
    active7Res,
    active30Res,
    newUsers14Res,
    questionsAllRes,
    questions24hRes,
    questions14dRes,
    expiringSoonRes,
    recentlyExpiredRes,
    topUsersRes,
    wholesaleRes,
  ] = await Promise.all([
    admin.from("profiles").select("id, tier, tier_expires_at, created_at"),
    admin.from("daily_usage").select("user_id").gte("created_at", day7),
    admin.from("daily_usage").select("user_id").gte("created_at", day30),
    admin.from("profiles").select("created_at").gte("created_at", day14),
    admin.from("question_attempts").select("id", { count: "exact", head: true }),
    admin.from("question_attempts").select("user_id, was_correct").gte("attempted_at", day1),
    admin.from("question_attempts").select("attempted_at, user_id").gte("attempted_at", day14),
    admin.from("profiles")
      .select("id, tier, tier_expires_at")
      .in("tier", ["pro", "triple_crown"])
      .gte("tier_expires_at", now)
      .lte("tier_expires_at", soon),
    admin.from("profiles")
      .select("id, tier, tier_expires_at")
      .in("tier", ["pro", "triple_crown"])
      .lt("tier_expires_at", now)
      .gte("tier_expires_at", day30),
    admin.from("question_attempts").select("user_id").gte("attempted_at", day30),
    admin.from("wholesale_batches").select("tier, quantity, price_per_seat"),
  ])

  const profiles = profilesRes.data ?? []

  // ── Tier breakdown ──────────────────────────────────────────────────────────
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

  // ── Active users ────────────────────────────────────────────────────────────
  const active7  = new Set((active7Res.data  ?? []).map((r: any) => r.user_id)).size
  const active30 = new Set((active30Res.data ?? []).map((r: any) => r.user_id)).size

  // ── Sign-ups by day (last 14 days) ──────────────────────────────────────────
  const signupDayCounts: Record<string, number> = {}
  for (const p of newUsers14Res.data ?? []) {
    const k = dateKey(p.created_at)
    signupDayCounts[k] = (signupDayCounts[k] ?? 0) + 1
  }
  const days14 = last14Days()
  const signupsByDay = days14.map((d) => ({ date: d, count: signupDayCounts[d] ?? 0 }))

  // ── Weekly sparkline (legacy — still used for summary) ──────────────────────
  const signupsByWeek = [0, 0, 0, 0]
  for (const p of profiles) {
    const daysAgo = (Date.now() - new Date(p.created_at).getTime()) / 86400000
    if (daysAgo <= 7)        signupsByWeek[3]++
    else if (daysAgo <= 14)  signupsByWeek[2]++
    else if (daysAgo <= 21)  signupsByWeek[1]++
    else if (daysAgo <= 28)  signupsByWeek[0]++
  }

  // ── Questions last 24h ──────────────────────────────────────────────────────
  const q24h = questions24hRes.data ?? []
  const questions24h       = q24h.length
  const questions24hUsers  = new Set(q24h.map((r: any) => r.user_id)).size
  const questions24hCorrect = q24h.filter((r: any) => r.was_correct).length
  const correctPct24h = questions24h > 0
    ? Math.round((questions24hCorrect / questions24h) * 100)
    : 0

  // ── Questions by day (last 14 days) ─────────────────────────────────────────
  const qDayMap: Record<string, { questions: number; users: Set<string> }> = {}
  for (const r of questions14dRes.data ?? []) {
    const k = dateKey(r.attempted_at)
    if (!qDayMap[k]) qDayMap[k] = { questions: 0, users: new Set() }
    qDayMap[k].questions++
    qDayMap[k].users.add(r.user_id)
  }
  const questionsByDay = days14.map((d) => ({
    date: d,
    questions: qDayMap[d]?.questions ?? 0,
    users: qDayMap[d]?.users.size ?? 0,
  }))

  // ── Top users by activity (last 30d) ────────────────────────────────────────
  const userActivity: Record<string, number> = {}
  for (const r of topUsersRes.data ?? []) {
    userActivity[r.user_id] = (userActivity[r.user_id] ?? 0) + 1
  }
  const topUserIds = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ user_id: id, questions_30d: count }))

  // ── Free power users (upgrade targets) ──────────────────────────────────────
  const freeTierIds = new Set(profiles.filter((p) => !p.tier || p.tier === "free").map((p) => p.id))
  const freeActivity: Record<string, number> = {}
  for (const r of topUsersRes.data ?? []) {
    if (freeTierIds.has(r.user_id)) {
      freeActivity[r.user_id] = (freeActivity[r.user_id] ?? 0) + 1
    }
  }
  const freePowerUsers = Object.entries(freeActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ user_id: id, questions_30d: count }))

  // ── Wholesale revenue ────────────────────────────────────────────────────────
  const wholesaleRevenue = (wholesaleRes.data ?? []).reduce(
    (sum: number, b: any) => sum + b.price_per_seat * b.quantity, 0
  )

  const newUsers7  = signupsByDay.slice(0, 7).reduce((s, d) => s + d.count, 0)
  const newUsers30 = profiles.filter((p) => new Date(p.created_at) >= new Date(day30)).length

  return NextResponse.json({
    tiers: tierCounts,
    totalUsers:       profiles.length,
    active7,
    active30,
    newUsers7,
    newUsers30,
    totalQuestions:   questionsAllRes.count ?? 0,
    questions24h,
    questions24hUsers,
    correctPct24h,
    signupsByDay,
    signupsByWeek,
    questionsByDay,
    freePowerUsers,
    expiringSoon:     expiringSoonRes.data ?? [],
    recentlyExpired:  recentlyExpiredRes.data ?? [],
    topUsers:         topUserIds,
    wholesaleRevenue,
    wholesaleBatches: wholesaleRes.data?.length ?? 0,
  })
}
