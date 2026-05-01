'use client'

// Dashboard - certification selector
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'

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

export default function DashboardPage() {
  const router = useRouter()
  const [earnedCerts, setEarnedCerts] = useState<{cert: string}[]>([])
  const sub = useSubscription()

  useEffect(() => {
    async function loadCerts() {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Redirect to sign-in if not authenticated
      if (!user) {
        router.push('/crcst')
        return
      }

      // Redirect new users to onboarding if they haven't completed it
      const onboardingDone = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (!onboardingDone) {
        router.push('/onboarding')
        return
      }

      const { data } = await supabase
        .from("certified_users")
        .select("cert")
        .eq("user_id", user.id)
        .order("claimed_at", { ascending: true })
      if (data) setEarnedCerts(data)
    }
    loadCerts()
  }, [router])

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
              <span className={`text-xs px-3 py-1 rounded-full font-semibold tracking-[0.06em] uppercase border ${
                sub.plan === 'triple_crown'
                  ? 'bg-amber/20 text-amber border-amber/40'
                  : sub.plan === 'pro'
                  ? 'bg-teal/20 text-teal border-teal/40'
                  : 'bg-white/[0.08] text-white/50 border-white/15'
              }`}>
                {sub.plan === 'triple_crown' ? 'Triple Crown' : sub.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            )}
            <Link href="/account" className="text-[0.8rem] text-white/50 no-underline">
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-navy to-navy-2 text-white px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs tracking-widest text-teal-3 mb-4">
            STERILE PROCESSING DEPARTMENT
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-balance">
            Pass your <em className="text-amber">certification exam</em> with confidence.
          </h1>
          <p className="text-teal-3 max-w-xl mx-auto mb-8">
            Comprehensive question banks, practice quizzes, and mock exams for CRCST, CHL, and CER certifications.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="font-serif text-3xl text-amber">
                {totalQuestions}+
              </div>
              <div className="text-xs text-teal-3 uppercase tracking-wider">Questions</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-amber">3</div>
              <div className="text-xs text-teal-3 uppercase tracking-wider">Certifications</div>
            </div>
            <div>
              <div className="font-serif text-3xl text-amber">4</div>
              <div className="text-xs text-teal-3 uppercase tracking-wider">Study Modes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certification Cards */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Earned Certifications */}
        {earnedCerts.length > 0 && (
          <div className="bg-teal/[0.06] border border-teal/20 rounded-xl px-5 py-4 mb-4">
            <p className="text-[0.68rem] text-teal tracking-[0.1em] font-mono mb-[0.6rem]">
              YOUR CERTIFICATIONS
            </p>
            <div className="flex gap-2 flex-wrap">
              {earnedCerts.map((c, i) => (
                <span
                  key={i}
                  className="bg-teal/12 border border-teal rounded-full px-3 py-1 text-teal text-[0.82rem] font-bold font-mono"
                >
                  {c.cert} ✓
                </span>
              ))}
            </div>
          </div>
        )}

        {/* I Passed Button */}
        <Link href="/passed" className="block mb-6">
          <button className="flex items-center gap-[0.6rem] px-[1.4rem] py-[0.85rem] rounded-xl border-2 border-amber bg-amber/[0.08] text-amber text-[0.95rem] font-bold cursor-pointer font-mono tracking-[0.02em] w-full justify-center">
            I Passed My Exam - Claim Your Badge
          </button>
        </Link>

        {/* Free tier usage + upgrade prompt */}
        {!sub.loading && sub.plan === 'free' && (
          <div className="bg-teal/[0.04] border border-teal/20 rounded-xl px-5 py-4 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[0.72rem] text-teal tracking-[0.1em] mb-1 font-mono">
                FREE TIER — HOURLY USAGE
              </div>
              <div className="text-sm text-black/65 flex gap-5 flex-wrap">
                <span>Questions: <strong>{sub.usage?.questionsThisHour ?? 0} / {sub.usage?.questionsLimit ?? 20}</strong></span>
                <span>AI Chat: <strong>{sub.usage?.aiChatsToday ?? 0} / {sub.usage?.aiChatsLimit ?? 5}</strong></span>
              </div>
            </div>
            <Link
              href="/pricing"
              className="bg-gradient-to-br from-teal-dark to-teal text-white px-[1.1rem] py-2 rounded-lg text-[0.78rem] font-semibold whitespace-nowrap font-mono tracking-[0.04em] no-underline"
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
            // CHL and CER require Triple Crown access
            const requiresTripleCrown = cert.id === 'chl' || cert.id === 'cer'
            const isLocked = requiresTripleCrown && !sub.canAccessCHL

            if (isLocked) {
              return (
                <div
                  key={cert.id}
                  onClick={() => router.push('/pricing')}
                  className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300"
                >
                  {/* Lock Badge */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-600 text-white text-xs font-mono px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 11h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11V12z"/>
                    </svg>
                    Triple Crown
                  </div>
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${cert.bgGradient} p-6 text-white grayscale`}>
                    <div className="font-serif text-3xl font-bold mb-1">{cert.name}</div>
                    <div className="text-sm opacity-90">{cert.fullName}</div>
                  </div>
                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-sm text-text-3 mb-4 leading-relaxed">
                      {cert.description}
                    </p>
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
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${cert.bgGradient} p-6 text-white`}>
                  <div className="font-serif text-3xl font-bold mb-1">{cert.name}</div>
                  <div className="text-sm opacity-90">{cert.fullName}</div>
                </div>
                {/* Card Body */}
                <div className="p-6">
                  <p className="text-sm text-text-3 mb-4 leading-relaxed">
                    {cert.description}
                  </p>
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
              {/* Lock Badge */}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-cream rounded-xl p-5 border-l-4 border-l-teal">
            <div className="text-2xl flex-shrink-0">📄</div>
            <div className="flex-1 min-w-0">
              <div className="font-serif font-bold text-navy text-sm mb-0.5">Turn your certification into your next opportunity</div>
              <div className="text-xs text-text-3">Expert-written, ATS-optimized resumes for healthcare professionals · 87% interview rate · Starting at $29</div>
            </div>
            <a
              href="https://www.myqualifiedresume.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-mono tracking-widest px-4 py-2.5 rounded-lg text-white transition hover:opacity-90 bg-gradient-to-br from-teal-dark to-teal"
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
