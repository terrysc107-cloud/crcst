'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function shortDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

// ── UI primitives ─────────────────────────────────────────────────────────────

function Stat({
  label, value, sub, accent, highlight,
}: {
  label: string; value: string | number; sub?: string; accent?: string; highlight?: boolean
}) {
  return (
    <div className={`border rounded-xl p-4 ${highlight ? 'bg-teal/10 border-teal/30' : 'bg-white/5 border-white/10'}`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function BarChart({
  data, valueKey, labelKey, color = 'bg-teal/60', height = 48,
}: {
  data: Record<string, any>[]
  valueKey: string
  labelKey: string
  color?: string
  height?: number
}) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1)
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end group relative">
            <div
              className={`${color} rounded-sm transition-all`}
              style={{ height: `${Math.max((d[valueKey] / max) * 100, d[valueKey] > 0 ? 4 : 0)}%`, minHeight: d[valueKey] > 0 ? 2 : 0 }}
            />
            {d[valueKey] > 0 && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                {d[valueKey]}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex mt-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            {(i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1) && (
              <span className="text-[0.6rem] text-gray-600">{shortDate(d[labelKey])}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setError('Not logged in.'); setLoading(false); return }
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) { setError('Access denied — admin only.'); setLoading(false); return }
      setStats(await res.json())
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-gray-400">
      Loading…
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-red-400">
      {error}
    </div>
  )

  const convRate = stats.totalUsers > 0
    ? Math.round(((stats.tiers.pro + stats.tiers.triple_crown) / stats.totalUsers) * 100)
    : 0

  const issues = [
    ...stats.recentlyExpired.map((u: any) => ({
      type: 'expired',
      label: `Paid user lapsed (${u.tier.replace('_', ' ')})`,
      sub: `Expired ${fmtDate(u.tier_expires_at)}`,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    })),
    ...stats.expiringSoon.map((u: any) => ({
      type: 'expiring',
      label: `${u.tier.replace('_', ' ')} expiring soon`,
      sub: `${daysUntil(u.tier_expires_at)} days left`,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    })),
  ]

  // Reverse so newest is on the right (chart order oldest→newest)
  const signupsChartData  = [...(stats.signupsByDay ?? [])].reverse()
  const questionsChartData = [...(stats.questionsByDay ?? [])].reverse()

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Admin</h1>
          <p className="text-xs text-gray-400">SPD Cert Prep</p>
        </div>
        <nav className="flex gap-3 text-sm">
          <span className="text-white font-medium">Overview</span>
          <Link href="/admin/wholesale" className="text-gray-400 hover:text-white transition-colors">Wholesale</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">App →</Link>
        </nav>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Issues at a glance</h2>
            <div className="space-y-2">
              {issues.map((issue, i) => (
                <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${issue.bg}`}>
                  <span className={`text-lg leading-none mt-0.5 ${issue.color}`}>
                    {issue.type === 'expired' ? '⚠' : '⏰'}
                  </span>
                  <div>
                    <div className={`text-sm font-medium ${issue.color}`}>{issue.label}</div>
                    <div className="text-xs text-gray-400">{issue.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users by tier */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Users by tier</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Stat label="Total users"   value={stats.totalUsers} />
            <Stat label="Free"          value={stats.tiers.free} sub={`${Math.round(stats.tiers.free / stats.totalUsers * 100)}% of users`} />
            <Stat label="Pro (active)"  value={stats.tiers.pro} accent="text-teal-400" highlight />
            <Stat label="Triple Crown"  value={stats.tiers.triple_crown} accent="text-amber-400" />
            <Stat
              label="Conversion"
              value={`${convRate}%`}
              sub="free → paid"
              accent={convRate >= 15 ? 'text-emerald-400' : convRate >= 8 ? 'text-amber-400' : 'text-red-400'}
            />
          </div>
        </div>

        {/* 24h Pulse */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Last 24 hours</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              label="Questions answered"
              value={stats.questions24h.toLocaleString()}
              sub="last 24h"
              accent="text-teal-400"
              highlight
            />
            <Stat
              label="Active users"
              value={stats.questions24hUsers}
              sub="answered ≥1 question"
            />
            <Stat
              label="Correct rate"
              value={`${stats.correctPct24h}%`}
              sub="of all answers"
              accent={stats.correctPct24h >= 70 ? 'text-emerald-400' : stats.correctPct24h >= 50 ? 'text-amber-400' : 'text-red-400'}
            />
            <Stat
              label="New signups today"
              value={stats.signupsByDay?.[0]?.count ?? 0}
              sub={shortDate(stats.signupsByDay?.[0]?.date ?? new Date().toISOString())}
            />
          </div>
        </div>

        {/* Charts: sign-ups + activity side by side */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Daily sign-ups */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">New sign-ups</div>
                <div className="text-xs text-gray-600 mt-0.5">last 14 days</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{stats.newUsers7}</div>
                <div className="text-xs text-gray-500">this week</div>
              </div>
            </div>
            <BarChart
              data={signupsChartData}
              valueKey="count"
              labelKey="date"
              color="bg-teal/60"
              height={56}
            />
            <div className="mt-4 border-t border-white/5 pt-4 max-h-40 overflow-y-auto space-y-1">
              {(stats.signupsByDay ?? []).map((d: any) => (
                <div key={d.date} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-gray-400">{shortDate(d.date)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-teal/50 rounded-full"
                        style={{ width: `${Math.min((d.count / Math.max(...(stats.signupsByDay ?? []).map((x: any) => x.count), 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`font-mono w-4 text-right ${d.count > 10 ? 'text-teal-400' : 'text-gray-300'}`}>
                      {d.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Questions answered</div>
                <div className="text-xs text-gray-600 mt-0.5">last 14 days</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{stats.totalQuestions.toLocaleString()}</div>
                <div className="text-xs text-gray-500">all time</div>
              </div>
            </div>
            <BarChart
              data={questionsChartData}
              valueKey="questions"
              labelKey="date"
              color="bg-amber-500/50"
              height={56}
            />
            <div className="mt-4 border-t border-white/5 pt-4 max-h-40 overflow-y-auto space-y-1">
              {(stats.questionsByDay ?? []).map((d: any) => (
                <div key={d.date} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-gray-400">{shortDate(d.date)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{d.users} users</span>
                    <div className="w-20 bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-500/50 rounded-full"
                        style={{ width: `${Math.min((d.questions / Math.max(...(stats.questionsByDay ?? []).map((x: any) => x.questions), 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`font-mono w-6 text-right ${d.questions > 100 ? 'text-amber-400' : 'text-gray-300'}`}>
                      {d.questions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Engagement summary */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Engagement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Active (7d)"  value={stats.active7}  sub={`${Math.round(stats.active7  / stats.totalUsers * 100)}% of users`} />
            <Stat label="Active (30d)" value={stats.active30} sub={`${Math.round(stats.active30 / stats.totalUsers * 100)}% of users`} />
            <Stat label="New users (7d)"  value={stats.newUsers7} />
            <Stat label="New users (30d)" value={stats.newUsers30} />
          </div>
        </div>

        {/* Free power users — conversion targets */}
        {stats.freePowerUsers?.length > 0 && (
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-1">Free power users</h2>
            <p className="text-xs text-gray-600 mb-3">
              High-activity free accounts — these are your best upgrade targets. Consider a direct email or in-app prompt.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {stats.freePowerUsers.map((u: any, i: number) => (
                <div key={u.user_id} className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-4 font-mono text-xs">{i + 1}</span>
                    <span className="font-mono text-xs text-gray-400">{u.user_id.slice(0, 8)}…</span>
                    <span className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-500">free</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-semibold text-amber-400">{u.questions_30d}</span>
                      <span className="text-gray-400 ml-1 text-xs">questions / 30d</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top active users overall */}
        {stats.topUsers.length > 0 && (
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Most active users (last 30d)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {stats.topUsers.map((u: any, i: number) => (
                <div key={u.user_id} className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-4 font-mono text-xs">{i + 1}</span>
                    <span className="font-mono text-xs text-gray-400">{u.user_id.slice(0, 8)}…</span>
                  </div>
                  <div>
                    <span className="font-semibold">{u.questions_30d.toLocaleString()}</span>
                    <span className="text-gray-400 ml-1 text-xs">questions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wholesale */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Wholesale</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Batches sold</span>
              <span className="font-semibold">{stats.wholesaleBatches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue</span>
              <span className="font-semibold text-emerald-400">
                ${Number(stats.wholesaleRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <Link
            href="/admin/wholesale"
            className="mt-4 block text-center text-xs text-teal hover:text-teal/80 transition-colors"
          >
            Manage codes →
          </Link>
        </div>

      </div>
    </div>
  )
}
