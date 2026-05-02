'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import BadgeLocker from '@/components/BadgeLocker'
import StreakHeatmap from '@/components/StreakHeatmap'
import { SoundToggle } from '@/components/Celebration'
import { computeLevel } from '@/lib/dal/xp'

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

interface GamBadge {
  badge_id: string
  earned_at: string
}

interface ActivityDay {
  date: string
  count: number
}

const CERT_COLORS: Record<string, { color: string; accent: string }> = {
  CRCST: { color: '#0D7377', accent: '#14BDAC' },
  CHL:   { color: '#1A4A8A', accent: '#4A90D9' },
  CER:   { color: '#5B2D8E', accent: '#9B59D6' },
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [gamBadges, setGamBadges] = useState<GamBadge[]>([])
  const [activityData, setActivityData] = useState<ActivityDay[]>([])
  const [streakState, setStreakState] = useState<{ current: number; longest: number; freezeCredits: number } | null>(null)
  const [xpData, setXpData] = useState<{ total_xp: number; current_level: number } | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/'); return }
      setUser({ id: u.id, email: u.email! })

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      const [statusRes, badgesRes, crcstRes, chlRes, cerRes, gamBadgesRes, activityRes, streakRes, xpRes] = await Promise.allSettled([
        fetch('/api/payment/status', { headers: authHeader }).then(r => r.json()),
        supabase.from('certified_users').select('cert, full_name, pass_date, claimed_at').eq('user_id', u.id).order('claimed_at', { ascending: false }),
        supabase.from('crcst_quiz_results').select('id, score, total_questions, percentage, difficulty, created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('chl_quiz_results').select('id, score, total_questions, percentage, difficulty, created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('cer_quiz_results').select('id, score, total_questions, percentage, difficulty, created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', u.id),
        supabase.from('user_daily_activity').select('activity_date, questions_answered').eq('user_id', u.id).gte('activity_date', new Date(Date.now() - 52 * 7 * 86400000).toISOString().split('T')[0]).order('activity_date', { ascending: true }),
        supabase.from('user_streaks').select('current_streak, longest_streak, freeze_credits').eq('user_id', u.id).single(),
        supabase.from('user_xp').select('total_xp, current_level').eq('user_id', u.id).single(),
      ])

      if (statusRes.status === 'fulfilled') setStatusData(statusRes.value)
      if (badgesRes.status === 'fulfilled' && badgesRes.value.data) setEarnedBadges(badgesRes.value.data)
      if (gamBadgesRes.status === 'fulfilled' && gamBadgesRes.value.data) setGamBadges(gamBadgesRes.value.data)

      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        setActivityData(activityRes.value.data.map((r: { activity_date: string; questions_answered: number }) => ({
          date: r.activity_date,
          count: r.questions_answered,
        })))
      }

      if (streakRes.status === 'fulfilled' && streakRes.value.data) {
        const s = streakRes.value.data
        setStreakState({ current: s.current_streak, longest: s.longest_streak, freezeCredits: s.freeze_credits })
      }

      if (xpRes.status === 'fulfilled' && xpRes.value.data) {
        setXpData(xpRes.value.data)
      }

      const results: QuizResult[] = []
      if (crcstRes.status === 'fulfilled' && crcstRes.value.data) {
        results.push(...crcstRes.value.data.map((r: Omit<QuizResult, 'cert_type'>) => ({ ...r, cert_type: 'CRCST' as const })))
      }
      if (chlRes.status === 'fulfilled' && chlRes.value.data) {
        results.push(...chlRes.value.data.map((r: Omit<QuizResult, 'cert_type'>) => ({ ...r, cert_type: 'CHL' as const })))
      }
      if (cerRes.status === 'fulfilled' && cerRes.value.data) {
        results.push(...cerRes.value.data.map((r: Omit<QuizResult, 'cert_type'>) => ({ ...r, cert_type: 'CER' as const })))
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
      <div style={{ minHeight: '100vh', background: '#021B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading…
      </div>
    )
  }

  const planLabel = { free: 'Free', pro: 'Pro', triple_crown: 'Triple Crown' }[statusData.plan]
  const planColor = { free: 'rgba(255,255,255,0.4)', pro: '#14BDAC', triple_crown: '#DAA520' }[statusData.plan]
  const isPaid = statusData.plan === 'pro' || statusData.plan === 'triple_crown'

  const earnedBadgeIds = gamBadges.map(b => b.badge_id)
  const earnedAtMap: Record<string, string> = {}
  for (const b of gamBadges) earnedAtMap[b.badge_id] = b.earned_at

  const xpState = xpData ? computeLevel(xpData.total_xp) : null

  return (
    <div style={{ minHeight: '100vh', background: '#021B3A', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: 36, height: 36, background: '#14BDAC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>SP</div>
          <span style={{ fontWeight: 600 }}>SPD Cert Companion</span>
        </Link>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>My Account</h1>

        {/* XP + Streak row */}
        {(xpState || streakState) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {xpState && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>XP &amp; Level</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14BDAC' }}>Lv.{xpState.current_level}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{xpState.level_name}</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginBottom: '0.3rem' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#0D7377,#14BDAC)', borderRadius: 3, width: `${xpState.level_progress_pct}%` }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                  {xpState.total_xp.toLocaleString()} XP {xpState.next_level_xp ? `/ ${xpState.next_level_xp.toLocaleString()}` : '(max level)'}
                </div>
              </div>
            )}
            {streakState && (
              <div style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Streak</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316' }}>{streakState.current}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>days</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>Best: {streakState.longest}</div>
                <div style={{ fontSize: '0.68rem', color: '#14BDAC' }}>❄️ {streakState.freezeCredits} freeze credit{streakState.freezeCredits !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>
        )}

        {/* Plan card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Current Plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: planColor }}>{planLabel}</span>
                {statusData.status === 'cancelled' && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(220,50,50,0.15)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '0.2rem 0.6rem', borderRadius: 100 }}>Cancelled</span>
                )}
              </div>
            </div>
            {statusData.plan === 'free' && (
              <Link href="/pricing" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>Upgrade</Link>
            )}
          </div>
          {statusData.plan === 'pro' && statusData.currentPeriodEnd && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              {statusData.status === 'cancelled'
                ? `Access continues until ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
                : `Renews ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`}
            </div>
          )}
          {statusData.plan === 'triple_crown' && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Permanent access — no renewal needed.</div>
          )}
        </div>

        {/* Usage card (free tier) */}
        {statusData.plan === 'free' && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Current Usage</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>Questions (per hour)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{statusData.usage.questionsThisHour} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>/ {statusData.usage.questionsLimit}</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>AI Chat (per day)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{statusData.usage.aiChatsToday} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>/ {statusData.usage.aiChatsLimit}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Account info + settings */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Account</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>{user.email}</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Celebration sounds</div>
            <SoundToggle />
          </div>
        </div>

        {/* Activity Heatmap */}
        {activityData.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Study Activity (Last 26 Weeks)</div>
            <StreakHeatmap activityData={activityData} weeks={26} />
          </div>
        )}

        {/* Badge Locker */}
        <div id="badges" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Badge Locker</div>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {earnedBadgeIds.length} / 13 earned
            </span>
          </div>
          <BadgeLocker earnedBadgeIds={earnedBadgeIds} earnedAtMap={earnedAtMap} />
        </div>

        {/* Earned Certifications */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>My Certifications</div>
            {!isPaid && (
              <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' }}>
                Upgrade
              </Link>
            )}
          </div>
          {!isPaid && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,27,58,0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.75rem', textAlign: 'center' }}>Unlock badge history with Pro</p>
              <Link href="/pricing" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' }}>Upgrade Now</Link>
            </div>
          )}
          {earnedBadges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>No certifications claimed yet</p>
              <Link href="/passed" style={{ color: '#14BDAC', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Passed an exam? Claim your badge →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {earnedBadges.map((badge, i) => {
                const colors = CERT_COLORS[badge.cert] || { color: '#14BDAC', accent: '#14BDAC' }
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: `${colors.color}15`, border: `1px solid ${colors.accent}40`, borderRadius: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.color}, ${colors.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{badge.cert}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: colors.accent, fontSize: '0.95rem' }}>{badge.cert}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                        Passed {new Date(badge.pass_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem' }}>✓</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Resume service */}
        {earnedBadges.length > 0 && (
          <div style={{ background: 'rgba(20,189,172,0.05)', border: '1px solid rgba(20,189,172,0.2)', borderRadius: 16, padding: '1.5rem 1.75rem', marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(20,189,172,0.1)', border: '1px solid rgba(20,189,172,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.7rem', color: '#14BDAC', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Career Next Step</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.92rem', marginBottom: '0.4rem', lineHeight: 1.3 }}>Your certification is on the record. Is your resume?</div>
              <a href="https://www.myqualifiedresume.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#14BDAC', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                Visit myqualifiedresume.com →
              </a>
            </div>
          </div>
        )}

        {/* Quiz Score History */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recent Quiz Scores</div>
            {!isPaid && (
              <Link href="/pricing" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontWeight: 600, fontSize: '0.75rem' }}>Upgrade</Link>
            )}
          </div>
          {!isPaid && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,27,58,0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Track your progress with Pro</p>
              <Link href="/pricing" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem' }}>Upgrade Now</Link>
            </div>
          )}
          {quizResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>No quiz results yet</p>
              <Link href="/dashboard" style={{ color: '#14BDAC', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>Start practicing →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quizResults.map((result, i) => {
                const colors = CERT_COLORS[result.cert_type] || { color: '#14BDAC', accent: '#14BDAC' }
                const passed = result.percentage >= 70
                return (
                  <div key={result.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: `${colors.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: colors.accent }}>{result.cert_type}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: passed ? '#10B981' : '#F59E0B', fontSize: '0.95rem' }}>{result.percentage}%</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{result.score}/{result.total_questions}</span>
                        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{result.difficulty}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                        {new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem' }}>{passed ? '✓' : '✗'}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cancel subscription */}
        {statusData.plan === 'pro' && statusData.status === 'active' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
              Want to cancel? You will keep Pro access until the end of your current billing period.
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{ background: 'none', border: '1px solid rgba(220,50,50,0.4)', color: '#f87171', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', opacity: cancelling ? 0.6 : 1 }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {cancelDone && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(20,189,172,0.1)', border: '1px solid rgba(20,189,172,0.3)', borderRadius: 10, fontSize: '0.875rem', color: '#14BDAC' }}>
            Subscription cancelled. Your Pro access continues until your billing period ends.
          </div>
        )}
      </div>
    </div>
  )
}
