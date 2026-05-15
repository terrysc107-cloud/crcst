'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label, Heading, Numeric } from '@/components/ui/typography'
import { getXpTier } from '@/lib/progression-config'

function fmtStudyTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs === 0) return `${mins} min`
  return `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`
}

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

const CERT_COLORS: Record<string, { color: string; accent: string }> = {
  CRCST: { color: '#0D7377', accent: '#14BDAC' },
  CHL: { color: '#1A4A8A', accent: '#4A90D9' },
  CER: { color: '#5B2D8E', accent: '#9B59D6' },
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [studySeconds, setStudySeconds] = useState(0)
  const [xp, setXp] = useState(0)
  const [levelsCompleted, setLevelsCompleted] = useState(0)
  const [badgeCount, setBadgeCount] = useState(0)

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

      // Fetch earned badges
      const { data: badges } = await supabase
        .from('certified_users')
        .select('cert, full_name, pass_date, claimed_at')
        .eq('user_id', u.id)
        .order('claimed_at', { ascending: false })
      if (badges) setEarnedBadges(badges)

      // Fetch study stats
      const [profileRes, xpRes, levelsRes, badgesRes] = await Promise.all([
        supabase.from('profiles').select('total_study_seconds').eq('id', u.id).single(),
        supabase.from('user_xp').select('total_xp').eq('user_id', u.id).maybeSingle(),
        supabase.from('user_levels').select('status').eq('user_id', u.id),
        supabase.from('progression_badges').select('badge_id').eq('user_id', u.id),
      ])
      setStudySeconds(profileRes.data?.total_study_seconds ?? 0)
      setXp(xpRes.data?.total_xp ?? 0)
      setLevelsCompleted(levelsRes.data?.filter((l: any) => l.status === 'completed').length ?? 0)
      setBadgeCount(badgesRes.data?.length ?? 0)

      // Fetch quiz results from all cert types
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

      // Sort by date and take top 10
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
  const planColorClass = { free: 'text-white/40', pro: 'text-teal', triple_crown: 'text-amber' }[statusData.plan]
  const isPaid = statusData.plan === 'pro' || statusData.plan === 'triple_crown'

  return (
    <div className="min-h-screen bg-navy text-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/[7%]">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline text-white">
          <div className="w-9 h-9 bg-teal rounded-lg flex items-center justify-center font-bold text-navy">SP</div>
          <span className="font-semibold">SPD Cert Companion</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="text-white/60 border-white/20"
        >
          Sign Out
        </Button>
      </nav>

      <div className="max-w-[640px] mx-auto mt-12 px-8">
        <Heading as="h1" size="2xl" className="text-white mb-8">My Account</Heading>

        {/* Plan card */}
        <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label color="muted" className="mb-[0.3rem]">Current Plan</Label>
              <div className="flex items-center gap-[0.6rem]">
                <Numeric size="2xl" className={planColorClass}>{planLabel}</Numeric>
                {statusData.status === 'cancelled' && (
                  <span className="text-xs bg-red-500/15 border border-red-500/30 text-red-400 px-[0.6rem] py-[0.2rem] rounded-full">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
            {statusData.plan === 'free' && (
              <Button asChild variant="gradient" size="sm">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            )}
          </div>

          {statusData.plan === 'pro' && statusData.currentPeriodEnd && (
            <div className="text-[0.85rem] text-white/50">
              {statusData.status === 'cancelled'
                ? `Access continues until ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
                : `Renews ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
              }
            </div>
          )}

          {statusData.plan === 'triple_crown' && (
            <div className="text-[0.85rem] text-white/50">Permanent access — no renewal needed.</div>
          )}
        </div>

        {/* Usage card (free tier) */}
        {statusData.plan === 'free' && (
          <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6">
            <Label color="muted" className="mb-4">Current Usage</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[0.85rem] text-white/60 mb-[0.3rem]">Questions (per day)</div>
                <div className="text-xl font-semibold">
                  {statusData.usage.questionsToday}{' '}
                  <span className="text-white/40 text-[0.9rem]">/ {statusData.usage.questionsLimit}</span>
                </div>
              </div>
              <div>
                <div className="text-[0.85rem] text-white/60 mb-[0.3rem]">AI Chat (per day)</div>
                <div className="text-xl font-semibold">
                  {statusData.usage.aiChatsToday}{' '}
                  <span className="text-white/40 text-[0.9rem]">/ {statusData.usage.aiChatsLimit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account info */}
        <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6">
          <Label color="muted" className="mb-4">Account</Label>
          <div className="text-[0.9rem] text-white/70">{user.email}</div>
        </div>

        {/* Study Stats */}
        <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6">
          <Label color="muted" className="mb-4">Study Stats</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[0.78rem] text-white/40 uppercase tracking-wider mb-1">Verified Study Time</div>
              <div className="text-xl font-bold text-white">
                {studySeconds > 0 ? fmtStudyTime(studySeconds) : '—'}
              </div>
              <div className="text-[0.72rem] text-white/30 mt-0.5">across all sessions</div>
            </div>
            <div>
              <div className="text-[0.78rem] text-white/40 uppercase tracking-wider mb-1">XP Earned</div>
              <div className="text-xl font-bold" style={{ color: getXpTier(xp).color }}>
                {xp.toLocaleString()} XP
              </div>
              <div className="text-[0.72rem] mt-0.5" style={{ color: getXpTier(xp).color }}>
                {getXpTier(xp).label}
              </div>
            </div>
            <div>
              <div className="text-[0.78rem] text-white/40 uppercase tracking-wider mb-1">Levels Completed</div>
              <div className="text-xl font-bold text-white">{levelsCompleted} <span className="text-white/30 text-sm font-normal">/ 24</span></div>
              <div className="text-[0.72rem] text-white/30 mt-0.5">progression mode</div>
            </div>
            <div>
              <div className="text-[0.78rem] text-white/40 uppercase tracking-wider mb-1">Badges Earned</div>
              <div className="text-xl font-bold text-white">{badgeCount}</div>
              <div className="text-[0.72rem] text-white/30 mt-0.5">progression badges</div>
            </div>
          </div>
        </div>

        {/* Earned Badges Section */}
        <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <Label color="muted">My Certifications</Label>
            {!isPaid && (
              <Button asChild variant="gradient" size="sm">
                <Link href="/pricing" className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  Upgrade
                </Link>
              </Button>
            )}
          </div>

          {!isPaid && (
            <div className="absolute inset-0 bg-navy/85 backdrop-blur-[4px] flex flex-col items-center justify-center z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14BDAC" strokeWidth="2" className="mb-3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-white/70 text-[0.9rem] mb-3 text-center">Unlock badge history with Pro</p>
              <Button asChild variant="gradient" size="sm">
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          )}

          {earnedBadges.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/50 text-[0.9rem] mb-3">No certifications claimed yet</p>
              <Link href="/passed" className="text-teal no-underline text-[0.85rem] font-semibold">
                Passed an exam? Claim your badge →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {earnedBadges.map((badge, i) => {
                const colors = CERT_COLORS[badge.cert] || { color: '#14BDAC', accent: '#14BDAC' }
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-3 py-3 rounded-[10px]"
                    style={{ background: `${colors.color}15`, border: `1px solid ${colors.accent}40` }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-[0.85rem] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${colors.color}, ${colors.accent})` }}
                    >
                      {badge.cert}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[0.95rem]" style={{ color: colors.accent }}>{badge.cert}</div>
                      <div className="text-[0.78rem] text-white/50">
                        Passed {new Date(badge.pass_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-xl">✓</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resume Service — shown only to badge holders */}
        {earnedBadges.length > 0 && (
          <div className="bg-teal/[5%] border border-teal/20 rounded-2xl px-7 py-6 mb-6 flex gap-5 items-start flex-wrap">
            <div className="w-10 h-10 bg-teal/10 border border-teal/25 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0">
              📄
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label color="teal" className="mb-[0.35rem]">Career Next Step</Label>
              <div className="font-semibold text-white text-[0.92rem] mb-[0.4rem] leading-[1.3]">
                Your certification is on the record. Is your resume?
              </div>
              <p className="text-[0.82rem] text-white/45 leading-[1.55] mb-3">
                myqualifiedresume.com writes resumes for healthcare professionals in sterile processing — they know how to present SPD credentials to hiring managers.
              </p>
              <a
                href="https://www.myqualifiedresume.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal text-[0.85rem] font-semibold no-underline"
              >
                Visit myqualifiedresume.com →
              </a>
            </div>
          </div>
        )}

        {/* Quiz Score History Section */}
        <div className="bg-white/[4%] border border-white/10 rounded-2xl p-7 mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <Label color="muted">Recent Quiz Scores (Top 10)</Label>
            {!isPaid && (
              <Button asChild variant="gradient" size="sm">
                <Link href="/pricing" className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  Upgrade
                </Link>
              </Button>
            )}
          </div>

          {!isPaid && (
            <div className="absolute inset-0 bg-navy/85 backdrop-blur-[4px] flex flex-col items-center justify-center z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14BDAC" strokeWidth="2" className="mb-3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p className="text-white/70 text-[0.9rem] mb-3 text-center">Track your progress with Pro</p>
              <Button asChild variant="gradient" size="sm">
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          )}

          {quizResults.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-white/50 text-[0.9rem] mb-3">No quiz results yet</p>
              <Link href="/dashboard" className="text-teal no-underline text-[0.85rem] font-semibold">
                Start practicing →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {quizResults.map((result, i) => {
                const colors = CERT_COLORS[result.cert_type] || { color: '#14BDAC', accent: '#14BDAC' }
                const passed = result.percentage >= 70
                return (
                  <div
                    key={result.id || i}
                    className="flex items-center gap-3 px-3 py-[0.65rem] bg-white/[2%] border border-white/[6%] rounded-lg"
                  >
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center text-[0.7rem] font-bold"
                      style={{ background: `${colors.color}30`, color: colors.accent }}
                    >
                      {result.cert_type}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-[0.95rem] ${passed ? 'text-green-500' : 'text-amber'}`}>
                          {result.percentage}%
                        </span>
                        <span className="text-xs text-white/40">
                          {result.score}/{result.total_questions}
                        </span>
                        <span className="text-[0.68rem] text-white/30 capitalize bg-white/5 px-[0.4rem] py-[0.15rem] rounded">
                          {result.difficulty}
                        </span>
                      </div>
                      <div className="text-[0.72rem] text-white/40">
                        {new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-base">
                      {passed ? '✓' : '✗'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cancel subscription */}
        {statusData.plan === 'pro' && statusData.status === 'active' && (
          <div className="bg-white/[2%] border border-white/[7%] rounded-2xl p-7">
            <div className="text-[0.85rem] text-white/40 mb-4">
              Want to cancel? You will keep Pro access until the end of your current billing period.
            </div>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="outline"
              size="sm"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            >
              {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
            </Button>
          </div>
        )}

        {cancelDone && (
          <div className="mt-4 p-4 bg-teal/10 border border-teal/30 rounded-[10px] text-[0.875rem] text-teal">
            Subscription cancelled. Your Pro access continues until your billing period ends.
          </div>
        )}
      </div>
    </div>
  )
}
