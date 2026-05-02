'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { BADGE_DEFINITIONS } from '@/lib/dal/badges'
import StreakFreezeModal from '@/components/StreakFreezeModal'
import { CelebrationBanner } from '@/components/Celebration'
import type { XpState } from '@/lib/dal/xp'

interface Certification {
  id: string
  name: string
  fullName: string
  description: string
  questionCount: number
  bgGradient: string
  href: string
}

const certifications: Certification[] = [
  {
    id: 'crcst',
    name: 'CRCST',
    fullName: 'Certified Registered Central Service Technician',
    description: 'Master sterile processing fundamentals, decontamination, sterilization, and instrument handling',
    questionCount: 400,
    bgGradient: 'from-teal to-teal-2',
    href: '/crcst',
  },
  {
    id: 'chl',
    name: 'CHL',
    fullName: 'Certified Healthcare Leader',
    description: 'Master leadership, management, communication, and human resources in sterile processing',
    questionCount: 240,
    bgGradient: 'from-amber to-yellow-500',
    href: '/chl',
  },
  {
    id: 'cer',
    name: 'CER',
    fullName: 'Certified Endoscope Reprocessor',
    description: 'Master endoscope anatomy, reprocessing procedures, microbiology, and quality assurance',
    questionCount: 147,
    bgGradient: 'from-blue-500 to-blue-600',
    href: '/cer',
  },
]

const totalQuestions = 400 + 240 + 147

interface GamificationState {
  streak: number
  longestStreak: number
  freezeCredits: number
  streakBroken: boolean
  xp: XpState | null
  earnedBadgeIds: string[]
  hasDoneChallenge: boolean
  totalQuestionsAnswered: number
  weakestDomain: string | null
  readinessPct: number | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [earnedCerts, setEarnedCerts] = useState<{ cert: string }[]>([])
  const sub = useSubscription()
  const [gamification, setGamification] = useState<GamificationState>({
    streak: 0,
    longestStreak: 0,
    freezeCredits: 0,
    streakBroken: false,
    xp: null,
    earnedBadgeIds: [],
    hasDoneChallenge: false,
    totalQuestionsAnswered: 0,
    weakestDomain: null,
    readinessPct: null,
  })
  const [showFreezeModal, setShowFreezeModal] = useState(false)
  const [celebration, setCelebration] = useState<{ type: 'level_up' | 'badge' | 'streak'; title: string; subtitle?: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/crcst'); return }

      const onboardingDone = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (!onboardingDone) { router.push('/onboarding'); return }

      const { data: certs } = await supabase
        .from('certified_users')
        .select('cert')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: true })
      if (certs) setEarnedCerts(certs)

      // Load gamification data
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      const [streakRes, xpRes, badgesRes, challengeRes, resultsRes] = await Promise.allSettled([
        supabase.from('user_streaks').select('current_streak, longest_streak, freeze_credits, last_activity_date').eq('user_id', user.id).single(),
        supabase.from('user_xp').select('total_xp, current_level, level_progress_pct').eq('user_id', user.id).single(),
        supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
        fetch('/api/daily-challenge', { headers }).then(r => r.json()).catch(() => null),
        supabase.from('crcst_quiz_results').select('percentage, domains').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])

      const streakData = streakRes.status === 'fulfilled' ? streakRes.value.data : null
      const xpData     = xpRes.status === 'fulfilled' ? xpRes.value.data : null
      const badgesData = badgesRes.status === 'fulfilled' ? badgesRes.value.data : null
      const challengeData = challengeRes.status === 'fulfilled' ? challengeRes.value : null
      const resultsData   = resultsRes.status === 'fulfilled' ? resultsRes.value.data : null

      // Detect streak broken
      const lastActivity = streakData?.last_activity_date
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const streakBroken = !!lastActivity && lastActivity < yesterday && (streakData?.current_streak ?? 0) > 0

      // Compute readiness + weak domain from recent quiz results
      let readinessPct: number | null = null
      let weakestDomain: string | null = null
      if (resultsData && resultsData.length > 0) {
        const recent5 = resultsData.slice(0, 5)
        readinessPct = Math.round(recent5.reduce((s: number, r: { percentage: number }) => s + r.percentage, 0) / recent5.length)

        const domainMap: Record<string, { correct: number; total: number }> = {}
        for (const r of resultsData) {
          if (!r.domains) continue
          for (const d of r.domains) {
            if (!domainMap[d.name]) domainMap[d.name] = { correct: 0, total: 0 }
            domainMap[d.name].correct += d.correct
            domainMap[d.name].total   += d.total
          }
        }
        let worstPct = 101; let worstName: string | null = null
        for (const [name, { correct, total }] of Object.entries(domainMap)) {
          if (total < 3) continue
          const pct = (correct / total) * 100
          if (pct < worstPct) { worstPct = pct; worstName = name }
        }
        weakestDomain = worstName
      }

      // Compute total questions answered
      const { data: txData } = await supabase.from('xp_transactions').select('amount').eq('user_id', user.id).in('reason', ['quiz_complete', 'daily_challenge'])
      const totalQ = Math.round((txData ?? []).reduce((s, t) => s + (t.amount ?? 0), 0) / 8)

      // XP state from DB
      let xpState: XpState | null = null
      if (xpData) {
        const { computeLevel } = await import('@/lib/dal/xp')
        xpState = computeLevel(xpData.total_xp)
      }

      setGamification({
        streak: streakBroken ? 0 : (streakData?.current_streak ?? 0),
        longestStreak: streakData?.longest_streak ?? 0,
        freezeCredits: streakData?.freeze_credits ?? 0,
        streakBroken,
        xp: xpState,
        earnedBadgeIds: (badgesData ?? []).map((b: { badge_id: string }) => b.badge_id),
        hasDoneChallenge: !!challengeData?.userResult,
        totalQuestionsAnswered: totalQ,
        weakestDomain,
        readinessPct,
      })
    }
    load()
  }, [router])

  // Next badge to earn
  const nextBadge = BADGE_DEFINITIONS.find(b => !gamification.earnedBadgeIds.includes(b.id))

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center font-serif text-xl font-bold">SP</div>
            <div>
              <div className="font-serif text-lg font-bold">SPD Cert Companion</div>
              <div className="text-xs text-teal-3">Sterile Processing Certification Prep</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!sub.loading && (
              <span style={{
                fontSize: '0.75rem', padding: '0.25rem 0.7rem', borderRadius: '100px',
                background: sub.plan === 'triple_crown' ? 'rgba(218,165,32,0.2)' : sub.plan === 'pro' ? 'rgba(20,189,172,0.2)' : 'rgba(255,255,255,0.08)',
                color: sub.plan === 'triple_crown' ? '#DAA520' : sub.plan === 'pro' ? '#14BDAC' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${sub.plan === 'triple_crown' ? 'rgba(218,165,32,0.4)' : sub.plan === 'pro' ? 'rgba(20,189,172,0.4)' : 'rgba(255,255,255,0.15)'}`,
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              }}>
                {sub.plan === 'triple_crown' ? 'Triple Crown' : sub.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            )}
            <Link href="/account" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Account</Link>
          </div>
        </div>
      </header>

      {/* ── TOP FOLD: Gamification Widgets ── */}
      <div className="bg-gradient-to-b from-navy to-navy-2 text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Celebration banner */}
          {celebration && (
            <CelebrationBanner
              type={celebration.type}
              title={celebration.title}
              subtitle={celebration.subtitle}
              onDone={() => setCelebration(null)}
            />
          )}

          {/* 5-widget top row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">

            {/* 1. Streak */}
            <div
              onClick={() => gamification.streakBroken && gamification.freezeCredits > 0 ? setShowFreezeModal(true) : undefined}
              style={{
                background: gamification.streak >= 7 ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${gamification.streak >= 7 ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '1rem',
                cursor: gamification.streakBroken && gamification.freezeCredits > 0 ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.4rem' }}>Streak</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🔥</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: gamification.streak >= 7 ? '#f97316' : '#fff' }}>
                  {gamification.streak}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>
                {gamification.streakBroken && gamification.freezeCredits > 0
                  ? '❄️ Tap to freeze'
                  : `Best: ${gamification.longestStreak}`}
              </div>
            </div>

            {/* 2. Daily Challenge */}
            <Link
              href="/daily-challenge"
              style={{
                background: gamification.hasDoneChallenge ? 'rgba(16,185,129,0.1)' : 'rgba(218,165,32,0.1)',
                border: `1px solid ${gamification.hasDoneChallenge ? 'rgba(16,185,129,0.3)' : 'rgba(218,165,32,0.35)'}`,
                borderRadius: 12, padding: '1rem', textDecoration: 'none', display: 'block',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.4rem' }}>Today</div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.15rem' }}>{gamification.hasDoneChallenge ? '✅' : '📅'}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: gamification.hasDoneChallenge ? '#10B981' : '#DAA520' }}>
                {gamification.hasDoneChallenge ? 'Done!' : 'Challenge'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>10 questions</div>
            </Link>

            {/* 3. Next Badge */}
            {nextBadge && (
              <Link
                href="/account#badges"
                style={{
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: 12, padding: '1rem', textDecoration: 'none', display: 'block',
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.4rem' }}>Next Badge</div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.15rem' }}>🔒</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a78bfa' }}>{nextBadge.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>{nextBadge.description}</div>
              </Link>
            )}

            {/* 4. Readiness */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '1rem',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.4rem' }}>Readiness</div>
              {gamification.readinessPct !== null ? (
                <>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: gamification.readinessPct >= 70 ? '#10B981' : '#f59e0b' }}>
                    {gamification.readinessPct}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>last 5 quizzes</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.2rem', opacity: 0.4 }}>—</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>take a quiz</div>
                </>
              )}
            </div>

            {/* 5. Weak Domain */}
            <div style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '1rem',
            }}>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: '0.4rem' }}>Weak Domain</div>
              {gamification.weakestDomain ? (
                <>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.15rem' }}>⚠️</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fca5a5', lineHeight: 1.3 }}>
                    {gamification.weakestDomain.length > 20
                      ? gamification.weakestDomain.slice(0, 20) + '…'
                      : gamification.weakestDomain}
                  </div>
                  <Link href="/crcst" style={{ fontSize: '0.65rem', color: '#14BDAC', marginTop: '0.3rem', display: 'block' }}>Drill it →</Link>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.2rem', opacity: 0.4 }}>—</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>no data yet</div>
                </>
              )}
            </div>
          </div>

          {/* XP Progress Bar */}
          {gamification.xp && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12,
              padding: '0.85rem 1.25rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14BDAC' }}>
                    Level {gamification.xp.current_level}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }}>
                    {gamification.xp.level_name}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                  {gamification.xp.total_xp.toLocaleString()} XP
                  {gamification.xp.next_level_xp ? ` / ${gamification.xp.next_level_xp.toLocaleString()}` : ''}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0D7377, #14BDAC)',
                  borderRadius: 3,
                  width: `${gamification.xp.level_progress_pct}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certification Cards */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Earned Certifications */}
        {earnedCerts.length > 0 && (
          <div style={{ background: 'rgba(20,189,172,0.06)', border: '1px solid rgba(20,189,172,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
            <p style={{ color: '#14BDAC', fontSize: '0.68rem', letterSpacing: '0.1em', fontFamily: 'monospace', marginBottom: '0.6rem' }}>YOUR CERTIFICATIONS</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {earnedCerts.map((c, i) => (
                <span key={i} style={{ background: 'rgba(20,189,172,0.12)', border: '1px solid #14BDAC', borderRadius: 100, padding: '0.25rem 0.75rem', color: '#14BDAC', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace' }}>
                  {c.cert} ✓
                </span>
              ))}
            </div>
          </div>
        )}

        {/* I Passed Button */}
        <Link href="/passed">
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.85rem 1.4rem', borderRadius: 12,
            border: '2px solid #DAA520', background: 'rgba(218,165,32,0.08)',
            color: '#DAA520', fontSize: '0.95rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.02em',
            width: '100%', marginBottom: '1.5rem', justifyContent: 'center',
          }}>
            I Passed My Exam — Claim Your Badge
          </button>
        </Link>

        {/* Free tier usage */}
        {!sub.loading && sub.plan === 'free' && (
          <div style={{
            background: 'rgba(20,189,172,0.04)', border: '1px solid rgba(20,189,172,0.2)',
            borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#14BDAC', letterSpacing: '0.1em', marginBottom: '0.3rem', fontFamily: 'monospace' }}>FREE TIER — HOURLY USAGE</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span>Questions: <strong>{sub.usage?.questionsThisHour ?? 0} / {sub.usage?.questionsLimit ?? 20}</strong></span>
                <span>AI Chat: <strong>{sub.usage?.aiChatsToday ?? 0} / {sub.usage?.aiChatsLimit ?? 5}</strong></span>
              </div>
            </div>
            <Link href="/pricing" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'monospace', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Upgrade to Pro — $19
            </Link>
          </div>
        )}

        <div className="text-xs tracking-widest text-text-3 mb-6 text-center">SELECT YOUR CERTIFICATION</div>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {certifications.map((cert) => {
            const requiresTripleCrown = cert.id === 'chl' || cert.id === 'cer'
            const isLocked = requiresTripleCrown && !sub.canAccessCHL
            if (isLocked) {
              return (
                <div key={cert.id} onClick={() => router.push('/pricing')} className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300">
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-600 text-white text-xs font-mono px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 11h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V12z"/></svg>
                    Triple Crown
                  </div>
                  <div className={`bg-gradient-to-r ${cert.bgGradient} p-6 text-white grayscale`}>
                    <div className="font-serif text-3xl font-bold mb-1">{cert.name}</div>
                    <div className="text-sm opacity-90">{cert.fullName}</div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-text-3 mb-4 leading-relaxed">{cert.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-navy/50">Triple Crown only</span>
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <Link key={cert.id} href={cert.href} className="group bg-white border-2 border-cream-2 rounded-xl overflow-hidden hover:border-teal hover:shadow-xl transition-all duration-300">
                <div className={`bg-gradient-to-r ${cert.bgGradient} p-6 text-white`}>
                  <div className="font-serif text-3xl font-bold mb-1">{cert.name}</div>
                  <div className="text-sm opacity-90">{cert.fullName}</div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-text-3 mb-4 leading-relaxed">{cert.description}</p>
                  <div className="flex items-center justify-end">
                    <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {/* SJT Card */}
          {sub.isPaid ? (
            <div onClick={() => router.push('/quiz/scenarios')} className="group bg-white border-2 border-cream-2 rounded-xl overflow-hidden hover:border-amber hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="bg-gradient-to-r from-amber to-yellow-500 p-6 text-white">
                <div className="font-serif text-3xl font-bold mb-1">SJT</div>
                <div className="text-sm opacity-90">Situational Judgment</div>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3 mb-4 leading-relaxed">Real-world scenarios. Build decision-making skills beyond the exam.</p>
                <div className="flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center group-hover:bg-amber group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div onClick={() => router.push('/pricing')} className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-navy text-white text-xs font-mono px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                Premium
              </div>
              <div className="bg-gradient-to-r from-amber to-yellow-500 p-6 text-white grayscale">
                <div className="font-serif text-3xl font-bold mb-1">SJT</div>
                <div className="text-sm opacity-90">Situational Judgment</div>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3 mb-4 leading-relaxed">Real-world scenarios. Build decision-making skills beyond the exam.</p>
                <span className="text-xs font-mono text-navy/50">Upgrade to unlock</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-cream-2 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs tracking-widest text-text-3 mb-6 text-center">STUDY FEATURES</div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: '1', title: 'Practice Quiz',  desc: 'Instant feedback on 20 questions' },
              { icon: '2', title: 'Flashcards',     desc: 'Flip through cards to memorize' },
              { icon: '3', title: 'Mock Exam',      desc: 'Timed simulation of real exam' },
              { icon: '4', title: 'Custom Quiz',    desc: 'Build your own by domain' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-teal/10 text-teal rounded-full flex items-center justify-center font-serif text-xl font-bold mx-auto mb-3">
                  {feature.icon}
                </div>
                <div className="font-serif font-bold text-navy mb-1">{feature.title}</div>
                <div className="text-xs text-text-3">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Service Card */}
      <div className="px-6 py-6 border-t border-cream-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-cream rounded-xl p-5 border-l-4" style={{ borderLeftColor: '#14BDAC' }}>
            <div className="text-2xl flex-shrink-0">📄</div>
            <div className="flex-1 min-w-0">
              <div className="font-serif font-bold text-navy text-sm mb-0.5">Turn your certification into your next opportunity</div>
              <div className="text-xs text-text-3">Expert-written, ATS-optimized resumes for healthcare professionals · 87% interview rate · Starting at $29</div>
            </div>
            <a href="https://www.myqualifiedresume.com/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-xs font-mono tracking-widest px-4 py-2.5 rounded-lg text-white transition hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)' }}>
              GET YOUR RESUME →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-serif text-lg mb-2">SPD Cert Companion</div>
          <div className="text-xs text-teal-3">Helping sterile processing professionals pass their certification exams</div>
        </div>
      </footer>

      {/* Streak Freeze Modal */}
      {showFreezeModal && (
        <StreakFreezeModal
          freezeCredits={gamification.freezeCredits}
          currentStreak={gamification.streak}
          streakBroken={gamification.streakBroken}
          onClose={() => setShowFreezeModal(false)}
          onFreezeUsed={(newStreak, creditsLeft) => {
            setGamification(g => ({ ...g, streak: newStreak, freezeCredits: creditsLeft, streakBroken: false }))
            setShowFreezeModal(false)
          }}
        />
      )}
    </div>
  )
}
