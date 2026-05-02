'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { formatCountdown, getCertPath } from '@/lib/plan'

interface Certification {
  id: string
  name: string
  fullName: string
  description: string
  questionCount: number
  color: string
  bgGradient: string
  href: string
}

interface StudyPlanData {
  examDate: string | null
  daysRemaining: number | null
  readinessScore: number
  weakDomain: string | null
  targetCert: string
  dueReviews: number
  weakDomainQuestions: number
  mockQuestions: number
  totalMinutes: number
  description: string
  planLabel: string
}

const certifications: Certification[] = [
  {
    id: 'crcst',
    name: 'CRCST',
    fullName: 'Certified Registered Central Service Technician',
    description: 'Master sterile processing fundamentals, decontamination, sterilization, and instrument handling',
    questionCount: 400,
    color: 'text-teal',
    bgGradient: 'from-teal to-teal-2',
    href: '/crcst',
  },
  {
    id: 'chl',
    name: 'CHL',
    fullName: 'Certified Healthcare Leader',
    description: 'Master leadership, management, communication, and human resources in sterile processing',
    questionCount: 240,
    color: 'text-amber',
    bgGradient: 'from-amber to-yellow-500',
    href: '/chl',
  },
  {
    id: 'cer',
    name: 'CER',
    fullName: 'Certified Endoscope Reprocessor',
    description: 'Master endoscope anatomy, reprocessing procedures, microbiology, and quality assurance',
    questionCount: 147,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500 to-blue-600',
    href: '/cer',
  },
]

const totalQuestions = 400 + 240 + 147

const URGENCY_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  critical: { bg: '#7F1D1D', border: 'rgba(252,165,165,0.3)', text: '#FCA5A5', badge: '#EF4444' },
  high: { bg: 'rgba(234,88,12,0.12)', border: 'rgba(234,88,12,0.3)', text: '#F97316', badge: '#F97316' },
  medium: { bg: 'rgba(233,196,106,0.08)', border: 'rgba(233,196,106,0.25)', text: '#e9c46a', badge: '#e9c46a' },
  low: { bg: 'rgba(20,189,172,0.06)', border: 'rgba(20,189,172,0.2)', text: '#14BDAC', badge: '#14BDAC' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [earnedCerts, setEarnedCerts] = useState<{cert: string}[]>([])
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const sub = useSubscription()

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/crcst')
        return
      }

      const onboardingDone = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (!onboardingDone) {
        router.push('/onboarding')
        return
      }

      const { data: certs } = await supabase
        .from('certified_users')
        .select('cert')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: true })
      if (certs) setEarnedCerts(certs)

      await loadStudyPlan(user.id)
    }
    loadDashboard()
  }, [router])

  async function loadStudyPlan(userId: string) {
    setPlanLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) return

      const res = await fetch('/api/study-plan', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setStudyPlan(data)
      }
    } catch {
      // Study plan is non-critical — dashboard works without it
    } finally {
      setPlanLoading(false)
    }
  }

  const certPath = studyPlan ? getCertPath(studyPlan.targetCert) : '/crcst'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center font-serif text-xl font-bold">
              SP
            </div>
            <div>
              <div className="font-serif text-lg font-bold">SPD Cert Companion</div>
              <div className="text-xs text-teal-3">Sterile Processing Certification Prep</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!sub.loading && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.7rem',
                borderRadius: '100px',
                background: sub.plan === 'triple_crown' ? 'rgba(218,165,32,0.2)' : sub.plan === 'pro' ? 'rgba(20,189,172,0.2)' : 'rgba(255,255,255,0.08)',
                color: sub.plan === 'triple_crown' ? '#DAA520' : sub.plan === 'pro' ? '#14BDAC' : 'rgba(255,255,255,0.5)',
                border: `1px solid ${sub.plan === 'triple_crown' ? 'rgba(218,165,32,0.4)' : sub.plan === 'pro' ? 'rgba(20,189,172,0.4)' : 'rgba(255,255,255,0.15)'}`,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}>
                {sub.plan === 'triple_crown' ? 'Triple Crown' : sub.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            )}
            <Link href="/account" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* Personalized top fold */}
      <div className="bg-gradient-to-b from-navy to-navy-2 text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Exam countdown */}
          {studyPlan?.examDate && (() => {
            const countdown = formatCountdown(studyPlan.examDate!)
            const colors = URGENCY_COLORS[countdown.urgency]
            return (
              <div style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '0.75rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  background: colors.badge,
                  color: '#fff',
                  borderRadius: 8,
                  padding: '0.3rem 0.7rem',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  minWidth: 56,
                  textAlign: 'center',
                }}>
                  {countdown.days}
                </div>
                <div>
                  <div style={{ color: colors.text, fontWeight: 700, fontSize: '0.95rem' }}>
                    {countdown.label}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>
                    {studyPlan.targetCert} exam ·{' '}
                    {new Date(studyPlan.examDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Daily quota CTA */}
          {!planLoading && studyPlan && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.7rem', color: '#14BDAC', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Today&apos;s Study Plan · {studyPlan.targetCert}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14BDAC', fontFamily: 'monospace' }}>{studyPlan.dueReviews}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reviews</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e9c46a', fontFamily: 'monospace' }}>{studyPlan.weakDomainQuestions}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weak Domain</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#9B59D6', fontFamily: 'monospace' }}>{studyPlan.mockQuestions}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mock</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{studyPlan.totalMinutes}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Min</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>{studyPlan.description}</p>
              <Link
                href={certPath}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '0.85rem 1.5rem',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                }}
              >
                Start Today&apos;s Session →
              </Link>
            </div>
          )}

          {/* Weak domain drill */}
          {studyPlan?.weakDomain && (
            <div style={{
              background: 'rgba(233,196,106,0.06)',
              border: '1px solid rgba(233,196,106,0.2)',
              borderRadius: 12,
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#e9c46a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Weakest Domain
                </div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{studyPlan.weakDomain}</div>
              </div>
              <Link
                href={`${certPath}?domain=${encodeURIComponent(studyPlan.weakDomain)}`}
                style={{
                  background: 'rgba(233,196,106,0.15)',
                  border: '1px solid rgba(233,196,106,0.4)',
                  color: '#e9c46a',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap' as const,
                }}
              >
                Drill this domain →
              </Link>
            </div>
          )}

          {/* Generic hero if no study plan yet */}
          {!studyPlan?.examDate && !planLoading && (
            <div className="text-center pt-4">
              <div className="text-xs tracking-widest text-teal-3 mb-4">
                STERILE PROCESSING DEPARTMENT
              </div>
              <h1 className="font-serif text-4xl md:text-5xl mb-4 text-balance">
                Pass your <em className="text-amber">certification exam</em> with confidence.
              </h1>
              <p className="text-teal-3 max-w-xl mx-auto mb-6">
                Comprehensive question banks, practice quizzes, and mock exams for CRCST, CHL, and CER certifications.
              </p>
              <Link
                href="/onboarding"
                style={{
                  display: 'inline-block',
                  background: 'rgba(20,189,172,0.15)',
                  border: '1px solid rgba(20,189,172,0.3)',
                  color: '#14BDAC',
                  textDecoration: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Set your exam date →
              </Link>
            </div>
          )}

          {studyPlan?.examDate && (
            <div className="flex justify-center gap-8 text-center mt-6">
              <div>
                <div className="font-serif text-3xl text-amber">{studyPlan.readinessScore}%</div>
                <div className="text-xs text-teal-3 uppercase tracking-wider">Readiness</div>
              </div>
              <div>
                <div className="font-serif text-3xl text-amber">{totalQuestions}+</div>
                <div className="text-xs text-teal-3 uppercase tracking-wider">Questions</div>
              </div>
              <div>
                <div className="font-serif text-3xl text-amber">3</div>
                <div className="text-xs text-teal-3 uppercase tracking-wider">Certs</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certification Cards */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Earned Certifications */}
        {earnedCerts.length > 0 && (
          <div style={{
            background: "rgba(20,189,172,0.06)",
            border: "1px solid rgba(20,189,172,0.2)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "1rem",
          }}>
            <p style={{
              color: "#14BDAC",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              fontFamily: "monospace",
              marginBottom: "0.6rem",
            }}>
              YOUR CERTIFICATIONS
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {earnedCerts.map((c, i) => (
                <span key={i} style={{
                  background: "rgba(20,189,172,0.12)",
                  border: "1px solid #14BDAC",
                  borderRadius: "100px",
                  padding: "0.25rem 0.75rem",
                  color: "#14BDAC",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  fontFamily: "monospace",
                }}>
                  {c.cert} ✓
                </span>
              ))}
            </div>
          </div>
        )}

        {/* I Passed Button */}
        <Link href="/passed">
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.85rem 1.4rem",
              borderRadius: "12px",
              border: "2px solid #DAA520",
              background: "rgba(218,165,32,0.08)",
              color: "#DAA520",
              fontSize: "0.95rem",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: "0.02em",
              width: "100%",
              marginBottom: "1.5rem",
              justifyContent: "center",
            }}
          >
            I Passed My Exam - Claim Your Badge
          </button>
        </Link>

        {/* Free tier usage + upgrade prompt */}
        {!sub.loading && sub.plan === 'free' && (
          <div style={{
            background: 'rgba(20,189,172,0.04)',
            border: '1px solid rgba(20,189,172,0.2)',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#14BDAC', letterSpacing: '0.1em', marginBottom: '0.3rem', fontFamily: 'monospace' }}>
                FREE TIER — HOURLY USAGE
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span>Questions: <strong>{sub.usage?.questionsThisHour ?? 0} / {sub.usage?.questionsLimit ?? 20}</strong></span>
                <span>AI Chat: <strong>{sub.usage?.aiChatsToday ?? 0} / {sub.usage?.aiChatsLimit ?? 5}</strong></span>
              </div>
            </div>
            <Link
              href="/pricing"
              style={{
                background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
                color: '#fff',
                padding: '0.5rem 1.1rem',
                borderRadius: 8,
                fontSize: '0.78rem',
                fontWeight: 600,
                whiteSpace: 'nowrap' as const,
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                textDecoration: 'none',
              }}
            >
              Upgrade to Pro — $19
            </Link>
          </div>
        )}

        <div className="text-xs tracking-widest text-text-3 mb-6 text-center">
          SELECT YOUR CERTIFICATION
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {certifications.map((cert) => {
            const requiresTripleCrown = cert.id === 'chl' || cert.id === 'cer'
            const isLocked = requiresTripleCrown && !sub.canAccessCHL

            if (isLocked) {
              return (
                <div
                  key={cert.id}
                  onClick={() => router.push('/pricing')}
                  className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300"
                >
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-600 text-white text-xs font-mono px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 11h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V12z"/>
                    </svg>
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
                      <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center">
                        <svg className="w-5 h-5 text-text-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={cert.id}
                href={cert.href}
                className="group bg-white border-2 border-cream-2 rounded-xl overflow-hidden hover:border-teal hover:shadow-xl transition-all duration-300"
              >
                <div className={`bg-gradient-to-r ${cert.bgGradient} p-6 text-white`}>
                  <div className="font-serif text-3xl font-bold mb-1">{cert.name}</div>
                  <div className="text-sm opacity-90">{cert.fullName}</div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-text-3 mb-4 leading-relaxed">{cert.description}</p>
                  <div className="flex items-center justify-end">
                    <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
          {/* Situational Judgment Card */}
          {sub.isPaid ? (
            <div
              onClick={() => router.push("/quiz/scenarios")}
              className="group bg-white border-2 border-cream-2 rounded-xl overflow-hidden hover:border-amber hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="bg-gradient-to-r from-amber to-yellow-500 p-6 text-white">
                <div className="font-serif text-3xl font-bold mb-1">SJT</div>
                <div className="text-sm opacity-90">Situational Judgment</div>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3 mb-4 leading-relaxed">
                  Real-world scenarios. Build decision-making skills beyond the exam.
                </p>
                <div className="flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center group-hover:bg-amber group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => router.push('/pricing')}
              className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300"
            >
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-navy text-white text-xs font-mono px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                Premium
              </div>
              <div className="bg-gradient-to-r from-amber to-yellow-500 p-6 text-white grayscale">
                <div className="font-serif text-3xl font-bold mb-1">SJT</div>
                <div className="text-sm opacity-90">Situational Judgment</div>
              </div>
              <div className="p-6">
                <p className="text-sm text-text-3 mb-4 leading-relaxed">
                  Real-world scenarios. Build decision-making skills beyond the exam.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-navy/50">Upgrade to unlock</span>
                  <div className="w-10 h-10 rounded-full bg-cream-2 flex items-center justify-center">
                    <svg className="w-5 h-5 text-text-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-cream-2 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs tracking-widest text-text-3 mb-6 text-center">
            STUDY FEATURES
          </div>
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: '1', title: 'Practice Quiz', desc: 'Instant feedback on 20 questions' },
              { icon: '2', title: 'Flashcards', desc: 'Flip through cards to memorize' },
              { icon: '3', title: 'Mock Exam', desc: 'Timed simulation of real exam' },
              { icon: '4', title: 'Custom Quiz', desc: 'Build your own by domain' },
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
            <a
              href="https://www.myqualifiedresume.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-mono tracking-widest px-4 py-2.5 rounded-lg text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)' }}
            >
              GET YOUR RESUME →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="font-serif text-lg mb-2">SPD Cert Companion</div>
          <div className="text-xs text-teal-3">
            Helping sterile processing professionals pass their certification exams
          </div>
        </div>
      </footer>
    </div>
  )
}
