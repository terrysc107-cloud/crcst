'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface StatusData {
  plan: 'free' | 'pro' | 'triple_crown'
  status: string
  currentPeriodEnd: string | null
  usage: {
    questionsThisHour: number
    aiChatsToday: number
    questionsLimit: number | null
    aiChatsLimit: number | null
  }
}

interface EarnedBadge {
  cert: string
  full_name: string
  pass_date: string
  claimed_at: string
}

interface QuizResult {
  id: string
  score: number
  total_questions: number
  percentage: number
  difficulty: string
  created_at: string
  cert_type: 'CRCST' | 'CHL' | 'CER'
}

const CERT_STYLES: Record<string, { bg: string; border: string; text: string; iconGradient: string }> = {
  CRCST: {
    bg: 'bg-[#0D7377]/[0.08]',
    border: 'border-[#14BDAC]/40',
    text: 'text-[#14BDAC]',
    iconGradient: 'bg-gradient-to-br from-[#0D7377] to-[#14BDAC]',
  },
  CHL: {
    bg: 'bg-[#1A4A8A]/[0.08]',
    border: 'border-[#4A90D9]/40',
    text: 'text-[#4A90D9]',
    iconGradient: 'bg-gradient-to-br from-[#1A4A8A] to-[#4A90D9]',
  },
  CER: {
    bg: 'bg-[#5B2D8E]/[0.08]',
    border: 'border-[#9B59D6]/40',
    text: 'text-[#9B59D6]',
    iconGradient: 'bg-gradient-to-br from-[#5B2D8E] to-[#9B59D6]',
  },
}

const DEFAULT_CERT_STYLE = {
  bg: 'bg-teal/[0.08]',
  border: 'border-teal/40',
  text: 'text-teal',
  iconGradient: 'bg-gradient-to-br from-teal-dark to-teal',
}

const PLAN_COLOR_CLASS = {
  free: 'text-white/40',
  pro: 'text-teal',
  triple_crown: 'text-amber',
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/'); return }
      setUser({ id: u.id, email: u.email! })

      const session = await supabase.auth.getSession()
      const res = await fetch('/api/payment/status', {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      })
      if (res.ok) setStatusData(await res.json())

      const { data: badges } = await supabase
        .from('certified_users')
        .select('cert, full_name, pass_date, claimed_at')
        .eq('user_id', u.id)
        .order('claimed_at', { ascending: false })
      if (badges) setEarnedBadges(badges)

      const results: QuizResult[] = []

      const { data: crcstResults } = await supabase
        .from('crcst_quiz_results')
        .select('id, score, total_questions, percentage, difficulty, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (crcstResults) {
        results.push(...crcstResults.map(r => ({ ...r, cert_type: 'CRCST' as const })))
      }

      const { data: chlResults } = await supabase
        .from('chl_quiz_results')
        .select('id, score, total_questions, percentage, difficulty, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (chlResults) {
        results.push(...chlResults.map(r => ({ ...r, cert_type: 'CHL' as const })))
      }

      const { data: cerResults } = await supabase
        .from('cer_quiz_results')
        .select('id, score, total_questions, percentage, difficulty, created_at')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (cerResults) {
        results.push(...cerResults.map(r => ({ ...r, cert_type: 'CER' as const })))
      }

      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setQuizResults(results.slice(0, 10))
    }
    load()
  }, [router])

  async function handleCancel() {
    if (!confirm('Cancel your Pro subscription? You will keep access until the end of your billing period.')) return
    setCancelling(true)
    try {
      const session = await supabase.auth.getSession()
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setCancelDone(true)
        if (statusData) setStatusData({ ...statusData, status: 'cancelled' })
      } else {
        alert(data.error || 'Failed to cancel.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user || !statusData) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center text-white font-sans">
        Loading…
      </div>
    )
  }

  const planLabel = { free: 'Free', pro: 'Pro', triple_crown: 'Triple Crown' }[statusData.plan]
  const planColorClass = PLAN_COLOR_CLASS[statusData.plan]
  const isPaid = statusData.plan === 'pro' || statusData.plan === 'triple_crown'

  return (
    <div className="min-h-screen bg-navy text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[0.07]">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline text-white">
          <div className="w-9 h-9 bg-teal rounded-lg flex items-center justify-center font-bold text-sm">SP</div>
          <span className="font-semibold">SPD Cert Companion</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="bg-transparent border border-white/20 text-white/60 px-4 py-2 rounded-lg cursor-pointer text-sm"
        >
          Sign Out
        </button>
      </nav>

      <div className="max-w-[640px] mx-auto mt-12 px-8">
        <h1 className="text-[1.6rem] font-bold mb-8">My Account</h1>

        {/* Plan card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-white/40 tracking-[0.1em] uppercase mb-1">Current Plan</div>
              <div className="flex items-center gap-[0.6rem]">
                <span className={`text-[1.4rem] font-bold ${planColorClass}`}>{planLabel}</span>
                {statusData.status === 'cancelled' && (
                  <span className="text-xs bg-red-500/15 border border-red-500/30 text-red-400 px-[0.6rem] py-[0.2rem] rounded-full">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
            {statusData.plan === 'free' && (
              <Link
                href="/pricing"
                className="bg-gradient-to-br from-teal-dark to-teal text-white no-underline px-5 py-[0.6rem] rounded-lg font-semibold text-sm"
              >
                Upgrade
              </Link>
            )}
          </div>

          {statusData.plan === 'pro' && statusData.currentPeriodEnd && (
            <div className="text-sm text-white/50">
              {statusData.status === 'cancelled'
                ? `Access continues until ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
                : `Renews ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
              }
            </div>
          )}

          {statusData.plan === 'triple_crown' && (
            <div className="text-sm text-white/50">Permanent access — no renewal needed.</div>
          )}
        </div>

        {/* Usage card (free tier) */}
        {statusData.plan === 'free' && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 mb-6">
            <div className="text-xs text-white/40 tracking-[0.1em] uppercase mb-4">Current Usage</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-white/60 mb-1">Questions (per hour)</div>
                <div className="text-[1.2rem] font-semibold">
                  {statusData.usage.questionsThisHour}{' '}
                  <span className="text-white/40 text-sm">/ {statusData.usage.questionsLimit}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">AI Chat (per day)</div>
                <div className="text-[1.2rem] font-semibold">
                  {statusData.usage.aiChatsToday}{' '}
                  <span className="text-white/40 text-sm">/ {statusData.usage.aiChatsLimit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account info */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 mb-6">
          <div className="text-xs text-white/40 tracking-[0.1em] uppercase mb-4">Account</div>
          <div className="text-[0.9rem] text-white/70">{user.email}</div>
        </div>

        {/* Earned Badges Section */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-white/40 tracking-[0.1em] uppercase">My Certifications</div>
            {!isPaid && (
              <Link
                href="/pricing"
                className="flex items-center gap-1 bg-gradient-to-br from-teal-dark to-teal text-white no-underline px-3 py-[0.4rem] rounded-md font-semibold text-xs"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                Upgrade
              </Link>
            )}
          </div>

          {!isPaid && (
            <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal mb-3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-white/70 text-sm mb-3 text-center">Unlock badge history with Pro</p>
              <Link
                href="/pricing"
                className="bg-gradient-to-br from-teal-dark to-teal text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {earnedBadges.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/50 text-sm mb-3">No certifications claimed yet</p>
              <Link href="/passed" className="text-teal no-underline text-sm font-semibold">
                Passed an exam? Claim your badge →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {earnedBadges.map((badge, i) => {
                const cs = CERT_STYLES[badge.cert] ?? DEFAULT_CERT_STYLE
                return (
                  <div key={i} className={`flex items-center gap-4 p-3 ${cs.bg} border ${cs.border} rounded-[10px]`}>
                    <div className={`w-11 h-11 rounded-full ${cs.iconGradient} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                      {badge.cert}
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold ${cs.text} text-[0.95rem]`}>{badge.cert}</div>
                      <div className="text-xs text-white/50">
                        Passed {new Date(badge.pass_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-[1.2rem]">✓</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resume Service — shown only to badge holders */}
        {earnedBadges.length > 0 && (
          <div className="bg-teal/[0.05] border border-teal/20 rounded-2xl px-7 py-6 mb-6 flex gap-5 items-start flex-wrap">
            <div className="w-10 h-10 bg-teal/10 border border-teal/25 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0">
              📄
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs text-teal tracking-[0.1em] uppercase mb-1">Career Next Step</div>
              <div className="font-semibold text-white text-[0.92rem] mb-1 leading-snug">
                Your certification is on the record. Is your resume?
              </div>
              <p className="text-[0.82rem] text-white/45 leading-[1.55] mb-3">
                myqualifiedresume.com writes resumes for healthcare professionals in sterile processing — they know how to present SPD credentials to hiring managers.
              </p>
              <a
                href="https://www.myqualifiedresume.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal text-sm font-semibold no-underline"
              >
                Visit myqualifiedresume.com →
              </a>
            </div>
          </div>
        )}

        {/* Quiz Score History Section */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-7 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-white/40 tracking-[0.1em] uppercase">Recent Quiz Scores (Top 10)</div>
            {!isPaid && (
              <Link
                href="/pricing"
                className="flex items-center gap-1 bg-gradient-to-br from-teal-dark to-teal text-white no-underline px-3 py-[0.4rem] rounded-md font-semibold text-xs"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                Upgrade
              </Link>
            )}
          </div>

          {!isPaid && (
            <div className="absolute inset-0 bg-navy/85 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal mb-3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-white/70 text-sm mb-3 text-center">Track your progress with Pro</p>
              <Link
                href="/pricing"
                className="bg-gradient-to-br from-teal-dark to-teal text-white no-underline px-4 py-2 rounded-lg font-semibold text-sm"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {quizResults.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/50 text-sm mb-3">No quiz results yet</p>
              <Link href="/dashboard" className="text-teal no-underline text-sm font-semibold">
                Start practicing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {quizResults.map((result, i) => {
                const cs = CERT_STYLES[result.cert_type] ?? DEFAULT_CERT_STYLE
                const passed = result.percentage >= 70
                return (
                  <div key={result.id || i} className="flex items-center gap-3 px-3 py-[0.65rem] bg-white/[0.02] border border-white/[0.06] rounded-lg">
                    <div className={`w-9 h-9 rounded-md ${cs.bg} border ${cs.border} flex items-center justify-center text-[0.7rem] font-bold ${cs.text}`}>
                      {result.cert_type}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-[0.95rem] ${passed ? 'text-green-400' : 'text-amber'}`}>
                          {result.percentage}%
                        </span>
                        <span className="text-xs text-white/40">
                          {result.score}/{result.total_questions}
                        </span>
                        <span className="text-[0.68rem] text-white/30 capitalize bg-white/[0.05] px-[0.4rem] py-[0.15rem] rounded">
                          {result.difficulty}
                        </span>
                      </div>
                      <div className="text-[0.72rem] text-white/40">
                        {new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-base">{passed ? '✓' : '✗'}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cancel subscription */}
        {statusData.plan === 'pro' && statusData.status === 'active' && (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-7">
            <div className="text-sm text-white/40 mb-4">
              Want to cancel? You will keep Pro access until the end of your current billing period.
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-transparent border border-red-500/40 text-red-400 px-5 py-[0.6rem] rounded-lg text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {cancelDone && (
          <div className="mt-4 p-4 bg-teal/10 border border-teal/30 rounded-[10px] text-sm text-teal">
            Subscription cancelled. Your Pro access continues until your billing period ends.
          </div>
        )}
      </div>
    </div>
  )
}
