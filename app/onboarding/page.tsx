'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

const CERTS = [
  {
    id: 'CRCST' as CertGoal,
    name: 'CRCST',
    fullName: 'Certified Registered Central Service Technician',
    desc: 'The foundational cert. Sterile processing, decontamination, instrument handling.',
    selectedBg: 'bg-[#0D7377]/[0.18]',
    selectedBorder: 'border-[#14BDAC]',
    unselectedBorder: 'border-white/10',
    iconGradient: 'bg-gradient-to-br from-[#0D7377] to-[#14BDAC]',
    accent: 'text-[#14BDAC]',
    checkBg: 'bg-[#14BDAC]',
    questions: 400,
  },
  {
    id: 'CHL' as CertGoal,
    name: 'CHL',
    fullName: 'Certified Healthcare Leader',
    desc: 'Leadership, management, and regulatory expertise in sterile processing.',
    selectedBg: 'bg-[#1A4A8A]/[0.18]',
    selectedBorder: 'border-[#4A90D9]',
    unselectedBorder: 'border-white/10',
    iconGradient: 'bg-gradient-to-br from-[#1A4A8A] to-[#4A90D9]',
    accent: 'text-[#4A90D9]',
    checkBg: 'bg-[#4A90D9]',
    questions: 240,
  },
  {
    id: 'CER' as CertGoal,
    name: 'CER',
    fullName: 'Certified Endoscope Reprocessor',
    desc: 'Specialist cert for endoscope reprocessing protocols and microbiology.',
    selectedBg: 'bg-[#5B2D8E]/[0.18]',
    selectedBorder: 'border-[#9B59D6]',
    unselectedBorder: 'border-white/10',
    iconGradient: 'bg-gradient-to-br from-[#5B2D8E] to-[#9B59D6]',
    accent: 'text-[#9B59D6]',
    checkBg: 'bg-[#9B59D6]',
    questions: 147,
  },
]

const EXPERIENCE_OPTIONS = [
  { id: 'new' as ExperienceLevel, label: 'New to SPD', desc: 'Just starting out or recently entered the field', icon: '🌱' },
  { id: 'some' as ExperienceLevel, label: '1–3 Years Experience', desc: 'Working in sterile processing, studying for first cert', icon: '⚙️' },
  { id: 'experienced' as ExperienceLevel, label: '3+ Years Experience', desc: 'Seasoned professional, adding to your credentials', icon: '🏅' },
]

const FEATURES = [
  { icon: '📝', title: 'Practice Quizzes', desc: 'Instant feedback on 20 randomized questions from the full question bank.', href: '/crcst' },
  { icon: '🧠', title: 'AI Study Chat', desc: 'Ask anything. Get expert explanations powered by Claude AI.', href: '/crcst' },
  { icon: '🃏', title: 'Flashcards', desc: 'Flip through key concepts to memorize definitions and procedures.', href: '/crcst' },
  { icon: '⏱️', title: 'Mock Exam', desc: 'Full timed simulation of the real certification exam format.', href: '/crcst' },
]

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-7 bg-teal'
              : i < current
              ? 'w-2 bg-teal/40'
              : 'w-2 bg-white/15'
          }`}
        />
      ))}
    </div>
  )
}

function CertCard({ cert, selected, onClick }: { cert: typeof CERTS[number]; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-2 rounded-[14px] p-5 cursor-pointer transition-all duration-quick flex items-start gap-4 ${
        selected
          ? `${cert.selectedBg} ${cert.selectedBorder}`
          : `bg-white/[0.04] ${cert.unselectedBorder} hover:border-white/25`
      }`}
    >
      <div className={`w-12 h-12 rounded-[10px] ${cert.iconGradient} flex items-center justify-center text-base font-bold text-white flex-shrink-0`}>
        {cert.name}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-white text-[0.95rem]">{cert.fullName}</span>
          {selected && (
            <span className={`w-[22px] h-[22px] rounded-full ${cert.checkBg} flex items-center justify-center text-xs text-white flex-shrink-0 ml-2`}>
              ✓
            </span>
          )}
        </div>
        <div className="text-[0.8rem] text-white/50 leading-relaxed">{cert.desc}</div>
        <div className={`text-[0.72rem] ${cert.accent} mt-1 font-mono`}>{cert.questions} questions</div>
      </div>
    </button>
  )
}

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

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/crcst'); return }
      setUserEmail(user.email ?? '')
      setUserId(user.id)

      const localCompleted = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (localCompleted === 'true') { router.push('/dashboard'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('target_cert')
        .eq('id', user.id)
        .single()

      if (profile?.target_cert) {
        localStorage.setItem(`onboarding_complete_${user.id}`, 'true')
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router])

  function toggleCert(certId: CertGoal) {
    setData((d) => {
      const already = d.certGoals.includes(certId)
      return {
        ...d,
        certGoals: already ? d.certGoals.filter((c) => c !== certId) : [...d.certGoals, certId],
      }
    })
  }

  async function saveOnboarding() {
    setSaving(true)
    try {
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

      const primaryCert = data.certGoals[0] ?? null
      await supabase.from('profiles').upsert({
        id: userId,
        target_cert: primaryCert,
        onboarding_completed: true,
      })
    } catch {
      // Silently ignore if table doesn't exist yet
    }
    localStorage.setItem(`onboarding_complete_${userId}`, 'true')
    setSaving(false)
    router.push('/dashboard')
  }

  function handleSkip() {
    if (userId) localStorage.setItem(`onboarding_complete_${userId}`, 'true')
    router.push('/dashboard')
  }

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

  const primaryCert = data.certGoals[0]
  const primaryCertData = CERTS.find((c) => c.id === primaryCert)

  return (
    <div className="min-h-screen bg-navy text-white font-sans flex flex-col items-center py-8 px-5">
      {/* Logo + skip */}
      <div className="w-full max-w-[520px] flex items-center justify-between mb-10">
        <div className="flex items-center gap-[0.6rem]">
          <div className="w-8 h-8 bg-teal rounded-[7px] flex items-center justify-center font-bold text-[0.8rem]">SP</div>
          <span className="font-semibold text-[0.9rem] text-white/80">SPD Cert Companion</span>
        </div>
        {step < TOTAL_STEPS - 1 && (
          <button
            onClick={handleSkip}
            className="bg-transparent border-none text-white/35 text-[0.8rem] cursor-pointer"
          >
            Skip setup →
          </button>
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-[520px] bg-white/[0.04] border border-white/10 rounded-[20px] p-9">
        <StepDots current={step} total={TOTAL_STEPS} />

        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div>
            <div className="text-center mb-8">
              <div className="text-[2.5rem] mb-4">👋</div>
              <h1 className="text-[1.6rem] font-bold mb-3 leading-tight font-serif">
                Welcome to<br />
                <em className="text-teal italic">SPD Cert Companion</em>
              </h1>
              <p className="text-white/55 text-[0.9rem] leading-relaxed">
                Let&apos;s get you set up in 2 minutes. We&apos;ll personalize your study plan so you can focus on what matters most.
              </p>
            </div>

            {userEmail && (
              <div className="bg-teal/[0.08] border border-teal/20 rounded-[10px] px-4 py-3 mb-6 text-[0.82rem] text-white/60">
                Signed in as <strong className="text-teal">{userEmail}</strong>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[0.78rem] text-white/50 tracking-[0.08em] mb-2 uppercase">
                What should we call you? (optional)
              </label>
              <input
                type="text"
                value={data.displayName}
                onChange={(e) => setData((d) => ({ ...d, displayName: e.target.value }))}
                placeholder={userEmail ? userEmail.split('@')[0] : 'Your name'}
                className="w-full bg-white/[0.06] border border-white/15 rounded-[10px] px-4 py-3 text-white text-[0.95rem] outline-none box-border placeholder:text-white/30 focus:border-teal/50"
              />
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 mb-6">
              <div className="text-[0.72rem] text-white/40 tracking-[0.1em] mb-3 uppercase">
                What you&apos;ll set up
              </div>
              {[
                "Which certification you're studying for",
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
            <h2 className="text-[1.35rem] font-bold mb-2 font-serif">
              Which certification are you<br />
              <em className="text-teal italic">studying for?</em>
            </h2>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-relaxed">
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
            <h2 className="text-[1.35rem] font-bold mb-2 font-serif">
              How much SPD experience<br />
              <em className="text-teal italic">do you have?</em>
            </h2>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-relaxed">
              This helps us tailor explanations and difficulty to where you are.
            </p>
            <div className="flex flex-col gap-3">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const selected = data.experienceLevel === opt.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => setData((d) => ({ ...d, experienceLevel: opt.id }))}
                    className={`text-left border-2 rounded-[14px] px-5 py-4 cursor-pointer flex items-center gap-4 w-full transition-all duration-quick ${
                      selected
                        ? 'bg-teal/12 border-teal'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className="text-[1.75rem] flex-shrink-0">{opt.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-[0.95rem] mb-[0.2rem] ${selected ? 'text-teal' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[0.8rem] text-white/50 leading-snug">{opt.desc}</div>
                    </div>
                    {selected && (
                      <div className="w-[22px] h-[22px] rounded-full bg-teal flex items-center justify-center text-xs text-white flex-shrink-0">
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
            <h2 className="text-[1.35rem] font-bold mb-2 font-serif">
              Plan your<br />
              <em className="text-amber italic">study schedule</em>
            </h2>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-relaxed">
              Optional — but knowing your exam date helps you stay on track.
            </p>

            <div className="mb-6">
              <label className="block text-[0.78rem] text-white/50 tracking-[0.08em] mb-2 uppercase">
                Target exam date (optional)
              </label>
              <input
                type="date"
                value={data.examDate}
                onChange={(e) => setData((d) => ({ ...d, examDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-white/[0.06] border border-white/15 rounded-[10px] px-4 py-3 text-[0.95rem] outline-none box-border [color-scheme:dark] focus:border-teal/50 ${data.examDate ? 'text-white' : 'text-white/30'}`}
              />
              {data.examDate && (
                <div className="mt-2 text-[0.8rem] text-teal">
                  {Math.ceil((new Date(data.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days to go
                </div>
              )}
            </div>

            <div>
              <label className="block text-[0.78rem] text-white/50 tracking-[0.08em] mb-3 uppercase">
                Days per week you can study
              </label>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5, 6, 7] as StudyDays[]).map((day) => (
                  <button
                    key={day}
                    onClick={() => setData((d) => ({ ...d, studyDaysPerWeek: day }))}
                    className={`flex-1 aspect-square rounded-[10px] border-2 text-[0.9rem] cursor-pointer transition-all duration-snap ${
                      data.studyDaysPerWeek === day
                        ? 'bg-teal/20 border-teal text-teal font-bold'
                        : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-white/25'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[0.72rem] text-white/30">casual</span>
                <span className="text-[0.72rem] text-white/30">every day</span>
              </div>
            </div>

            <div className="mt-6 bg-amber/[0.08] border border-amber/20 rounded-[10px] px-4 py-[0.85rem]">
              <div className="text-[0.72rem] text-amber tracking-[0.08em] uppercase mb-1">Study tip</div>
              <div className="text-[0.82rem] text-white/60 leading-relaxed">
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
            <h2 className="text-[1.35rem] font-bold mb-2 font-serif">
              Here&apos;s how to<br />
              <em className="text-teal italic">study effectively</em>
            </h2>
            <p className="text-white/50 text-[0.85rem] mb-7 leading-relaxed">
              Four study modes designed to build real exam confidence.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white/[0.04] border border-white/[0.08] rounded-xl p-4"
                >
                  <div className="text-[1.5rem] flex-shrink-0 leading-none">{f.icon}</div>
                  <div>
                    <div className="font-semibold text-white text-[0.9rem] mb-[0.2rem]">{f.title}</div>
                    <div className="text-[0.8rem] text-white/50 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {primaryCertData && (
              <div className={`${primaryCertData.selectedBg} border ${primaryCertData.selectedBorder}/30 rounded-xl px-5 py-4`}>
                <div className={`text-[0.72rem] ${primaryCertData.accent} tracking-[0.08em] uppercase mb-1`}>
                  Your focus
                </div>
                <div className="text-[0.88rem] text-white/70 leading-relaxed">
                  You&apos;ll start with{' '}
                  <strong className={primaryCertData.accent}>{data.certGoals.join(', ')}</strong>
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
            <button
              onClick={back}
              className="flex-1 py-[0.85rem] rounded-xl border border-white/15 bg-transparent text-white/50 text-[0.9rem] cursor-pointer"
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext() || saving}
            className={`py-[0.85rem] rounded-xl border-none text-[0.9rem] font-semibold transition-all duration-quick ${
              step === 0 ? 'flex-1' : 'flex-[2]'
            } ${
              canNext() && !saving
                ? 'bg-gradient-to-br from-teal-dark to-teal text-white cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
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

      <p className="mt-6 text-xs text-white/25 text-center">
        You can update your preferences anytime in Account settings.
      </p>
    </div>
  )
}
