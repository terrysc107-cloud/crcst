'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Label, Heading } from '@/components/ui/typography'

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
    title: 'Full Exam',
    desc: '150-question, 3-hour timed simulation of the real certification exam.',
    href: '/crcst',
  },
]

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? 'w-7 bg-teal' : i < current ? 'w-2 bg-teal/40' : 'w-2 bg-white/15'
          }`}
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
      className="w-full text-left rounded-[14px] p-5 cursor-pointer transition-all duration-200 flex items-start gap-4 font-sans"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${cert.color}30, ${cert.color}15)`
          : 'rgba(255,255,255,0.04)',
        border: `2px solid ${selected ? cert.accent : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <div
        className="w-12 h-12 rounded-[10px] flex items-center justify-center text-base font-bold text-white flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${cert.color}, ${cert.accent})` }}
      >
        {cert.name}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-white text-[0.95rem]">{cert.fullName}</span>
          {selected && (
            <span
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 ml-2"
              style={{ background: cert.accent }}
            >
              ✓
            </span>
          )}
        </div>
        <div className="text-[0.8rem] text-white/50 leading-[1.5]">{cert.desc}</div>
        <div className="text-[0.72rem] mt-[0.4rem] font-mono" style={{ color: cert.accent }}>
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
    const pendingCode = sessionStorage.getItem('pending_redeem_code')
    if (pendingCode) {
      sessionStorage.removeItem('pending_redeem_code')
      router.push(`/redeem?code=${pendingCode}`)
      return
    }
    router.push('/dashboard')
  }

  // ── Skip entirely ──
  function handleSkip() {
    if (userId) {
      localStorage.setItem(`onboarding_complete_${userId}`, 'true')
    }
    const pendingCode = sessionStorage.getItem('pending_redeem_code')
    if (pendingCode) {
      sessionStorage.removeItem('pending_redeem_code')
      router.push(`/redeem?code=${pendingCode}`)
      return
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
    <div className="min-h-screen bg-navy text-white font-mono flex flex-col items-center px-5 py-8">
      {/* Logo + skip */}
      <div className="w-full max-w-[520px] flex items-center justify-between mb-10">
        <div className="flex items-center gap-[0.6rem]">
          <div className="w-8 h-8 bg-teal rounded-[7px] flex items-center justify-center font-bold text-[0.8rem] text-navy">
            SP
          </div>
          <span className="font-semibold text-[0.9rem] text-white/80">SPD Cert Companion</span>
        </div>
        {step < TOTAL_STEPS - 1 && (
          <button
            onClick={handleSkip}
            className="bg-transparent border-none text-white/35 text-[0.8rem] cursor-pointer font-mono"
          >
            Skip setup →
          </button>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-[520px] bg-white/[4%] border border-white/10 rounded-[20px] p-9">
        <StepDots current={step} total={TOTAL_STEPS} />

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-[2.5rem] mb-4">👋</div>
              <Heading as="h1" size="2xl" className="text-white mb-3 leading-[1.2]">
                Welcome to<br />
                <em className="text-teal italic">SPD Cert Companion</em>
              </Heading>
              <p className="text-white/55 text-[0.9rem] leading-[1.6]">
                Let&apos;s get you set up in 2 minutes. We&apos;ll personalize your study plan so you can focus on what matters most.
              </p>
            </div>

            {userEmail && (
              <div className="bg-teal/[8%] border border-teal/20 rounded-[10px] px-4 py-3 mb-6 text-[0.82rem] text-white/60">
                Signed in as <strong className="text-teal">{userEmail}</strong>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs text-white/50 tracking-[0.08em] mb-2 uppercase">
                What should we call you? (optional)
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => setData((d) => ({ ...d, displayName: e.target.value }))}
                placeholder={userEmail ? userEmail.split('@')[0] : 'Your name'}
                className="w-full bg-white/[6%] border border-white/[15%] rounded-[10px] px-4 py-3 text-white text-[0.95rem] font-mono outline-none box-border focus:border-teal/40"
              />
            </div>

            {/* What you'll get */}
            <div className="bg-white/[3%] rounded-xl p-4 mb-6">
              <Label color="muted" className="mb-3">What you&apos;ll set up</Label>
              {[
                'Which certification you\'re studying for',
                'Your experience level',
                'Your exam timeline',
                'A quick tour of study tools',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-[0.6rem] mb-2">
                  <div className="w-5 h-5 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center text-[0.65rem] text-teal flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-[0.85rem] text-white/65">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Cert Goals ── */}
        {step === 1 && (
          <div>
            <Heading as="h2" size="xl" className="text-white mb-2 font-display">
              Which certification are you<br />
              <em className="text-teal italic">studying for?</em>
            </Heading>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-[1.5]">
              Select all that apply — you can study for multiple certs.
            </p>
            <div className="flex flex-col gap-3 mb-4">
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
              <p className="text-[0.78rem] text-white/30 text-center mt-2">
                Select at least one certification to continue
              </p>
            )}
          </div>
        )}

        {/* ── STEP 2: Experience Level ── */}
        {step === 2 && (
          <div>
            <Heading as="h2" size="xl" className="text-white mb-2 font-display">
              How much SPD experience<br />
              <em className="text-teal italic">do you have?</em>
            </Heading>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-[1.5]">
              This helps us tailor explanations and difficulty to where you are.
            </p>
            <div className="flex flex-col gap-3">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const selected = data.experienceLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setData((d) => ({ ...d, experienceLevel: opt.id }))}
                    className={`text-left rounded-[14px] px-5 py-4 cursor-pointer flex items-center gap-4 w-full font-mono transition-all duration-200 border-2 ${
                      selected ? 'bg-teal/[12%] border-teal' : 'bg-white/[4%] border-white/10'
                    }`}
                  >
                    <span className="text-[1.75rem] flex-shrink-0">{opt.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-[0.95rem] mb-[0.2rem] ${selected ? 'text-teal' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[0.8rem] text-white/50 leading-[1.4]">
                        {opt.desc}
                      </div>
                    </div>
                    {selected && (
                      <div className="w-[22px] h-[22px] rounded-full bg-teal flex items-center justify-center text-xs text-navy flex-shrink-0">
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
            <Heading as="h2" size="xl" className="text-white mb-2 font-display">
              Plan your<br />
              <em className="text-amber italic">study schedule</em>
            </Heading>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-[1.5]">
              Optional — but knowing your exam date helps you stay on track.
            </p>

            {/* Exam date */}
            <div className="mb-6">
              <label className="block text-xs text-white/50 tracking-[0.08em] mb-2 uppercase">
                Target exam date (optional)
              </label>
              <input
                type="date"
                value={data.examDate}
                onChange={(e) => setData((d) => ({ ...d, examDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-white/[6%] border border-white/[15%] rounded-[10px] px-4 py-3 text-[0.95rem] font-mono outline-none box-border ${data.examDate ? 'text-white' : 'text-white/30'}`}
                style={{ colorScheme: 'dark' }}
              />
              {data.examDate && (
                <div className="mt-2 text-[0.8rem] text-teal">
                  {Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to go
                </div>
              )}
            </div>

            {/* Days per week */}
            <div>
              <label className="block text-xs text-white/50 tracking-[0.08em] mb-3 uppercase">
                Days per week you can study
              </label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5, 6, 7] as StudyDays[]).map((day) => (
                  <button
                    key={day}
                    onClick={() => setData((d) => ({ ...d, studyDaysPerWeek: day }))}
                    className={`flex-1 aspect-square rounded-[10px] font-mono text-[0.9rem] cursor-pointer transition-all duration-150 py-2 border-2 ${
                      data.studyDaysPerWeek === day
                        ? 'bg-teal/20 border-teal text-teal font-bold'
                        : 'bg-white/[4%] border-white/10 text-white/50 font-normal'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-[0.4rem]">
                <span className="text-[0.72rem] text-white/30">casual</span>
                <span className="text-[0.72rem] text-white/30">every day</span>
              </div>
            </div>

            {/* Study tip */}
            <div className="mt-6 bg-amber/[8%] border border-amber/20 rounded-[10px] px-4 py-[0.85rem]">
              <Label color="amber" className="mb-[0.4rem]">Study tip</Label>
              <div className="text-[0.82rem] text-white/60 leading-[1.5]">
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
            <Heading as="h2" size="xl" className="text-white mb-2 font-display">
              Here&apos;s how to<br />
              <em className="text-teal italic">study effectively</em>
            </Heading>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-[1.5]">
              Four study modes designed to build real exam confidence.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white/[4%] border border-white/[8%] rounded-xl p-4"
                >
                  <div className="text-[1.5rem] flex-shrink-0 leading-none">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-white text-[0.9rem] mb-[0.2rem]">{f.title}</div>
                    <div className="text-[0.8rem] text-white/50 leading-[1.5]">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Personalized summary */}
            {primaryCertData && (
              <div
                className="rounded-xl px-5 py-4"
                style={{
                  background: `linear-gradient(135deg, ${primaryCertData.color}20, ${primaryCertData.color}10)`,
                  border: `1px solid ${primaryCertData.accent}30`,
                }}
              >
                <div
                  className="text-[0.72rem] tracking-[0.08em] uppercase mb-[0.4rem] font-mono"
                  style={{ color: primaryCertData.accent }}
                >
                  Your focus
                </div>
                <div className="text-[0.88rem] text-white/70 leading-[1.5]">
                  You&apos;ll start with{' '}
                  <strong style={{ color: primaryCertData.accent }}>
                    {data.certGoals.join(', ')}
                  </strong>
                  {data.examDate && (
                    <>
                      {' '}—{' '}
                      <strong className="text-amber">
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
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              onClick={back}
              variant="outline"
              className="flex-1 py-[0.85rem] rounded-xl text-[0.9rem] font-mono"
            >
              ← Back
            </Button>
          )}
          <Button
            onClick={next}
            disabled={!canNext() || saving}
            variant={canNext() && !saving ? 'gradient' : 'ghost'}
            className="py-[0.85rem] rounded-xl text-[0.9rem] font-semibold font-mono transition-all duration-200"
            style={{ flex: step === 0 ? 1 : 2 }}
          >
            {saving
              ? 'Saving…'
              : step === TOTAL_STEPS - 1
                ? "Let's go! →"
                : step === 0
                  ? 'Get started →'
                  : 'Continue →'}
          </Button>
        </div>
      </div>

      {/* Bottom note */}
      <p className="mt-6 text-xs text-white/25 text-center">
        You can update your preferences anytime in Account settings.
      </p>
    </div>
  )
}
