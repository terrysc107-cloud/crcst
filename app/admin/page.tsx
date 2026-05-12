'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ?? ''}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-teal/60 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0 }}
        />
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState('')
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

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-gray-400">Loading…</div>
  if (error)   return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-red-400">{error}</div>

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">Admin</h1>
          <p className="text-xs text-gray-400">SPD Cert Companion</p>
        </div>
        <nav className="flex gap-3 text-sm">
          <span className="text-white font-medium">Overview</span>
          <Link href="/admin/wholesale" className="text-gray-400 hover:text-white transition-colors">Wholesale</Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">App →</Link>
        </nav>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Issues at a glance */}
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

        {/* User tiers */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Users by tier</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Free" value={stats.tiers.free} sub={`${Math.round(stats.tiers.free / stats.totalUsers * 100)}% of users`} />
            <Stat label="Pro (active)" value={stats.tiers.pro} accent="text-teal" sub="90-day access" />
            <Stat label="Triple Crown" value={stats.tiers.triple_crown} accent="text-amber-400" sub="90-day access" />
            <Stat label="Expired paid" value={stats.tiers.expired} accent={stats.tiers.expired > 0 ? 'text-red-400' : ''} sub="re-engagement opp." />
          </div>
        </div>

        {/* Engagement */}
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Engagement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Total users" value={stats.totalUsers.toLocaleString()} />
            <Stat label="Active (7d)" value={stats.active7} sub={`${Math.round(stats.active7 / stats.totalUsers * 100)}% of users`} />
            <Stat label="Active (30d)" value={stats.active30} sub={`${Math.round(stats.active30 / stats.totalUsers * 100)}% of users`} />
            <Stat label="Questions answered" value={stats.totalQuestions.toLocaleString()} sub="all time" />
          </div>
        </div>

        {/* Signups trend + new users */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400 uppercase tracking-wider">New signups</div>
              <div className="text-xs text-gray-500">last 4 weeks</div>
            </div>
            <Sparkline data={stats.signupsByWeek} />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>4w ago</span><span>3w</span><span>2w</span><span>this week</span>
            </div>
            <div className="mt-3 flex gap-4 text-sm">
              <div><span className="text-white font-semibold">{stats.newUsers7}</span> <span className="text-gray-400">last 7d</span></div>
              <div><span className="text-white font-semibold">{stats.newUsers30}</span> <span className="text-gray-400">last 30d</span></div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
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

        {/* Most active users this month */}
        {stats.topUsers.length > 0 && (
          <div>
            <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Most active users (last 30d)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {stats.topUsers.map((u: any, i: number) => (
                <div key={u.user_id} className={`flex items-center justify-between px-5 py-3 text-sm ${i > 0 ? 'border-t border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 w-4">{i + 1}</span>
                    <span className="font-mono text-xs text-gray-400">{u.user_id.slice(0, 8)}…</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{u.questions_30d.toLocaleString()}</span>
                    <span className="text-gray-400 ml-1">questions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
