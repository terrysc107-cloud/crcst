'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type CertGoal = 'CRCST' | 'CHL' | 'CER' | 'multiple'
type ExperienceLevel = 'new' | 'some' | 'experienced'
type StudyDays = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface OnboardingData {
  displayName: string
  certGoals: CertGoal[]
  experienceLevel: ExperienceLevel | null
  examDate: string
  studyDaysPerWeek: StudyDays
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CERTS = [
  {
    id: 'CRCST' as CertGoal,
    name: 'CRCST',
    fullName: 'Certified Registered Central Service Technician',
    desc: 'The foundational cert. Sterile processing, decontamination, instrument handling.',
    color: '#0D7377',
    accent: '#14BDAC',
    questions: 400,
  },
  {
    id: 'CHL' as CertGoal,
    name: 'CHL',
    fullName: 'Certified Healthcare Leader',
    desc: 'Leadership, management, and regulatory expertise in sterile processing.',
    color: '#1A4A8A',
    accent: '#4A90D9',
    questions: 240,
  },
  {
    id: 'CER' as CertGoal,
    name: 'CER',
    fullName: 'Certified Endoscope Reprocessor',
    desc: 'Specialist cert for endoscope reprocessing protocols and microbiology.',
    color: '#5B2D8E',
    accent: '#9B59D6',
    questions: 147,
  },
]

const EXPERIENCE_OPTIONS = [
  {
    id: 'new' as ExperienceLevel,
    label: 'New to SPD',
    desc: 'Just starting out or recently entered the field',
    icon: '🌱',
  },
  {
    id: 'some' as ExperienceLevel,
    label: '1–3 Years Experience',
    desc: 'Working in sterile processing, studying for first cert',
    icon: '⚙️',
  },
  {
    id: 'experienced' as ExperienceLevel,
    label: '3+ Years Experience',
    desc: 'Seasoned professional, adding to your credentials',
    icon: '🏅',
  },
]

const FEATURES = [
  {
    icon: '📝',
    title: 'Practice Quizzes',
    desc: 'Instant feedback on 20 randomized questions from the full question bank.',
    href: '/crcst',
  },
  {
    icon: '🧠',
    title: 'AI Study Chat',
    desc: 'Ask anything. Get expert explanations powered by Claude AI.',
    href: '/crcst',
  },
  {
    icon: '🃏',
    title: 'Flashcards',
    desc: 'Flip through key concepts to memorize definitions and procedures.',
    href: '/crcst',
  },
  {
    icon: '⏱️',
    title: 'Mock Exam',
    desc: 'Full timed simulation of the real certification exam format.',
    href: '/crcst',
  },
]

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 28 : 8,
            height: 8,
            borderRadius: 100,
            background: i === current
              ? '#14BDAC'
              : i < current
                ? 'rgba(20,189,172,0.4)'
                : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

// ─── CERT CARD ────────────────────────────────────────────────────────────────

function CertCard({
  cert,
  selected,
  onClick,
}: {
  cert: typeof CERTS[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: selected
          ? `linear-gradient(135deg, ${cert.color}30, ${cert.color}15)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${selected ? cert.accent : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 14,
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${cert.color}, ${cert.accent})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {cert.name}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{cert.fullName}</span>
          {selected && (
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: cert.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: '#fff',
              flexShrink: 0,
              marginLeft: '0.5rem',
            }}>
              ✓
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{cert.desc}</div>
        <div style={{ fontSize: '0.72rem', color: cert.accent, marginTop: '0.4rem', fontFamily: 'monospace' }}>
          {cert.questions} questions
        </div>
      </div>
    </button>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    certGoals: [],
    experienceLevel: null,
    examDate: '',
    studyDaysPerWeek: 3,
  })

  const TOTAL_STEPS = 5

  // ── Auth guard ──
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to auth page if not logged in
        router.push('/crcst')
        return
      }
      setUserEmail(user.email ?? '')
      setUserId(user.id)

      // Check localStorage first (fast path)
      const localCompleted = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (localCompleted === 'true') {
        router.push('/dashboard')
        return
      }

      // Check database for existing onboarding data (for returning users on new devices)
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_cert')
        .eq('id', user.id)
        .single()

      if (profile?.target_cert) {
        // User already completed onboarding - sync localStorage and redirect
        localStorage.setItem(`onboarding_complete_${user.id}`, 'true')
        router.push('/dashboard')
        return
      }
    }
    checkAuth()
  }, [router])

  // ── Toggle cert selection ──
  function toggleCert(certId: CertGoal) {
    setData((d) => {
      const already = d.certGoals.includes(certId)
      return {
        ...d,
        certGoals: already
          ? d.certGoals.filter((c) => c !== certId)
          : [...d.certGoals, certId],
      }
    })
  }

  // ── Save onboarding data ──
  async function saveOnboarding() {
    setSaving(true)
    try {
      // Save to Supabase (best effort — table may or may not exist)
      await supabase.from('user_profiles').upsert({
        user_id: userId,
        display_name: data.displayName || userEmail.split('@')[0],
        cert_goals: data.certGoals,
        experience_level: data.experienceLevel,
        exam_date: data.examDate || null,
        study_days_per_week: data.studyDaysPerWeek,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      // Also upsert into profiles so the app can detect onboarding completion
      // on new devices (app reads target_cert from profiles table)
      const primaryCert = data.certGoals[0] ?? null
      await supabase.from('profiles').upsert({
        id: userId,
        target_cert: primaryCert,
        onboarding_completed: true,
      })
    } catch {
      // Silently ignore if table doesn't exist yet
    }
    // Always mark complete locally
    localStorage.setItem(`onboarding_complete_${userId}`, 'true')
    setSaving(false)
    router.push('/dashboard')
  }

  // ── Skip entirely ──
  function handleSkip() {
    if (userId) {
      localStorage.setItem(`onboarding_complete_${userId}`, 'true')
    }
    router.push('/dashboard')
  }

  // ── Navigation ──
  function canNext(): boolean {
    if (step === 1) return data.certGoals.length > 0
    if (step === 2) return data.experienceLevel !== null
    return true
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
    else saveOnboarding()
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  // ── Determine primary cert for personalization ──
  const primaryCert = data.certGoals[0]
  const primaryCertData = CERTS.find((c) => c.id === primaryCert)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#021B3A',
      color: '#fff',
      fontFamily: 'DM Mono, monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1.25rem',
    }}>
      {/* Logo + skip */}
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, background: '#14BDAC', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
            SP
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>SPD Cert Companion</span>
        </div>
        {step < TOTAL_STEPS - 1 && (
          <button
            onClick={handleSkip}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Skip setup →
          </button>
        )}
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '2.25rem',
      }}>
        <StepDots current={step} total={TOTAL_STEPS} />

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👋</div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2, fontFamily: 'Libre Baskerville, serif' }}>
                Welcome to<br />
                <em style={{ color: '#14BDAC', fontStyle: 'italic' }}>SPD Cert Companion</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Let&apos;s get you set up in 2 minutes. We&apos;ll personalize your study plan so you can focus on what matters most.
              </p>
            </div>

            {userEmail && (
              <div style={{
                background: 'rgba(20,189,172,0.08)',
                border: '1px solid rgba(20,189,172,0.2)',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.6)',
              }}>
                Signed in as <strong style={{ color: '#14BDAC' }}>{userEmail}</strong>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                What should we call you? (optional)
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => setData((d) => ({ ...d, displayName: e.target.value }))}
                placeholder={userEmail ? userEmail.split('@')[0] : 'Your name'}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* What you'll get */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                What you&apos;ll set up
              </div>
              {[
                'Which certification you\'re studying for',
                'Your experience level',
                'Your exam timeline',
                'A quick tour of study tools',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(20,189,172,0.2)', border: '1px solid rgba(20,189,172,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#14BDAC', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Cert Goals ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Libre Baskerville, serif' }}>
              Which certification are you<br />
              <em style={{ color: '#14BDAC', fontStyle: 'italic' }}>studying for?</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Select all that apply — you can study for multiple certs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {CERTS.map((cert) => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  selected={data.certGoals.includes(cert.id)}
                  onClick={() => toggleCert(cert.id)}
                />
              ))}
            </div>
            {data.certGoals.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '0.5rem' }}>
                Select at least one certification to continue
              </p>
            )}
          </div>
        )}

        {/* ── STEP 2: Experience Level ── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Libre Baskerville, serif' }}>
              How much SPD experience<br />
              <em style={{ color: '#14BDAC', fontStyle: 'italic' }}>do you have?</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              This helps us tailor explanations and difficulty to where you are.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {EXPERIENCE_OPTIONS.map((opt) => {
                const selected = data.experienceLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setData((d) => ({ ...d, experienceLevel: opt.id }))}
                    style={{
                      textAlign: 'left',
                      background: selected ? 'rgba(20,189,172,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${selected ? '#14BDAC' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 14,
                      padding: '1rem 1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      width: '100%',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: selected ? '#14BDAC' : '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                        {opt.desc}
                      </div>
                    </div>
                    {selected && (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#14BDAC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#fff', flexShrink: 0 }}>
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Exam Date + Study Schedule ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Libre Baskerville, serif' }}>
              Plan your<br />
              <em style={{ color: '#e9c46a', fontStyle: 'italic' }}>study schedule</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Optional — but knowing your exam date helps you stay on track.
            </p>

            {/* Exam date */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Target exam date (optional)
              </label>
              <input
                type="date"
                value={data.examDate}
                onChange={(e) => setData((d) => ({ ...d, examDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  color: data.examDate ? '#fff' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  colorScheme: 'dark',
                }}
              />
              {data.examDate && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#14BDAC' }}>
                  {Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to go
                </div>
              )}
            </div>

            {/* Days per week */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Days per week you can study
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {([1, 2, 3, 4, 5, 6, 7] as StudyDays[]).map((day) => (
                  <button
                    key={day}
                    onClick={() => setData((d) => ({ ...d, studyDaysPerWeek: day }))}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      borderRadius: 10,
                      background: data.studyDaysPerWeek === day
                        ? 'rgba(20,189,172,0.2)'
                        : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${data.studyDaysPerWeek === day ? '#14BDAC' : 'rgba(255,255,255,0.1)'}`,
                      color: data.studyDaysPerWeek === day ? '#14BDAC' : 'rgba(255,255,255,0.5)',
                      fontWeight: data.studyDaysPerWeek === day ? 700 : 400,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                      padding: '0.5rem 0',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>casual</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>every day</span>
              </div>
            </div>

            {/* Study tip */}
            <div style={{ marginTop: '1.5rem', background: 'rgba(233,196,106,0.08)', border: '1px solid rgba(233,196,106,0.2)', borderRadius: 10, padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#e9c46a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Study tip</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {data.studyDaysPerWeek >= 5
                  ? 'Daily practice is the fastest path to passing. Even 20 minutes counts.'
                  : data.studyDaysPerWeek >= 3
                    ? '3–4 days/week is the sweet spot for most students. Consistency beats cramming.'
                    : 'Start small and build up. Regular practice is better than occasional marathon sessions.'}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Feature Tour ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Libre Baskerville, serif' }}>
              Here&apos;s how to<br />
              <em style={{ color: '#14BDAC', fontStyle: 'italic' }}>study effectively</em>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Four study modes designed to build real exam confidence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '1rem',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{f.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Personalized summary */}
            {primaryCertData && (
              <div style={{
                background: `linear-gradient(135deg, ${primaryCertData.color}20, ${primaryCertData.color}10)`,
                border: `1px solid ${primaryCertData.accent}30`,
                borderRadius: 12,
                padding: '1rem 1.25rem',
              }}>
                <div style={{ fontSize: '0.72rem', color: primaryCertData.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Your focus
                </div>
                <div style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  You&apos;ll start with{' '}
                  <strong style={{ color: primaryCertData.accent }}>
                    {data.certGoals.join(', ')}
                  </strong>
                  {data.examDate && (
                    <>
                      {' '}—{' '}
                      <strong style={{ color: '#e9c46a' }}>
                        {Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </strong>{' '}
                      to exam day
                    </>
                  )}
                  {'. '}
                  {data.studyDaysPerWeek >= 5
                    ? 'Daily practice will get you there.'
                    : `${data.studyDaysPerWeek} days/week is a solid plan.`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
          {step > 0 && (
            <button
              onClick={back}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext() || saving}
            style={{
              flex: step === 0 ? 1 : 2,
              padding: '0.85rem',
              borderRadius: 12,
              border: 'none',
              background: canNext() && !saving
                ? 'linear-gradient(135deg, #0D7377, #14BDAC)'
                : 'rgba(255,255,255,0.1)',
              color: canNext() && !saving ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: canNext() && !saving ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            {saving
              ? 'Saving…'
              : step === TOTAL_STEPS - 1
                ? "Let's go! →"
                : step === 0
                  ? 'Get started →'
                  : 'Continue →'}
          </button>
        </div>
      </div>

      {/* Bottom note */}
      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        You can update your preferences anytime in Account settings.
      </p>
    </div>
  )
}
