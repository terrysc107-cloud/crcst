'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useSubscription } from '@/hooks/useSubscription'
import { getXpTier } from '@/lib/progression-config'
import { BookOpen, Layers, Clock, Sliders, FileText, LockOpen, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Certification {
  id: string
  name: string
  fullName: string
  description: string
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
    color: 'text-teal',
    bgGradient: 'from-teal to-teal-2',
    href: '/crcst',
  },
  {
    id: 'chl',
    name: 'CHL',
    fullName: 'Certified Healthcare Leader',
    description: 'Master leadership, management, communication, and human resources in sterile processing',
    color: 'text-amber',
    bgGradient: 'from-amber to-yellow-500',
    href: '/chl',
  },
  {
    id: 'cer',
    name: 'CER',
    fullName: 'Certified Endoscope Reprocessor',
    description: 'Master endoscope anatomy, reprocessing procedures, microbiology, and quality assurance',
    color: 'text-blue-500',
    bgGradient: 'from-blue-500 to-blue-600',
    href: '/cer',
  },
]

const totalQuestions = 400 + 240 + 147

export default function DashboardPage() {
  const router = useRouter()
  const [earnedCerts, setEarnedCerts] = useState<{ cert: string }[]>([])
  const [progXp, setProgXp] = useState<number>(0)
  const [progBadgeCount, setProgBadgeCount] = useState<number>(0)
  const [progLevelsCompleted, setProgLevelsCompleted] = useState<number>(0)
  const [progLoaded, setProgLoaded] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const sub = useSubscription()

  useEffect(() => {
    async function loadCerts() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/crcst')
        return
      }

      const user = session.user

      const onboardingDone = localStorage.getItem(`onboarding_complete_${user.id}`)
      if (!onboardingDone) {
        router.push('/onboarding')
        return
      }

      const { data } = await supabase
        .from('certified_users')
        .select('cert')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: true })
      if (data) setEarnedCerts(data)

      const [xpRes, badgeRes, levelsRes] = await Promise.all([
        supabase.from('user_xp').select('total_xp').eq('user_id', user.id).maybeSingle(),
        supabase.from('progression_badges').select('badge_id').eq('user_id', user.id),
        supabase.from('user_levels').select('status').eq('user_id', user.id),
      ])
      setProgXp(xpRes.data?.total_xp ?? 0)
      setProgBadgeCount(badgeRes.data?.length ?? 0)
      setProgLevelsCompleted(
        levelsRes.data?.filter((l: { status: string }) => l.status === 'completed').length ?? 0
      )
      setProgLoaded(true)
      setPageLoading(false)
    }
    loadCerts()
  }, [router])

  const tier = getXpTier(progXp)

  const planVariant = sub.plan === 'triple_crown' ? 'triple-crown' : sub.plan === 'pro' ? 'pro' : 'free'
  const planLabel = sub.plan === 'triple_crown' ? 'Triple Crown' : sub.plan === 'pro' ? 'Pro' : 'Free'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center font-serif text-xl font-bold flex-shrink-0">
              SP
            </div>
            <div className="min-w-0">
              <div className="font-serif text-lg font-bold truncate">SPD Cert Companion</div>
              <div className="text-xs text-teal-3 hidden sm:block">Sterile Processing Certification Prep</div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!sub.loading && (
              <Badge variant={planVariant}>{planLabel}</Badge>
            )}
            <Link href="/account" className="text-sm text-white/50 hover:text-white transition-colors">
              Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-navy to-navy-2 text-white px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest text-teal-3 mb-4 uppercase">
            Sterile Processing Department
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4 text-balance">
            Pass your <em className="text-amber">certification exam</em> with confidence.
          </h1>
          <p className="text-teal-3 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Comprehensive question banks, practice quizzes, and mock exams for CRCST, CHL, and CER certifications.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="font-serif text-3xl text-amber">{totalQuestions}+</div>
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

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Earned Certifications */}
        {earnedCerts.length > 0 && (
          <div className="bg-teal/6 border border-teal/20 rounded-xl px-5 py-4 mb-4">
            <p className="font-mono text-teal text-[0.68rem] tracking-[0.1em] uppercase mb-2.5">
              Your Certifications
            </p>
            <div className="flex gap-2 flex-wrap">
              {earnedCerts.map((c, i) => (
                <Badge key={i} variant="teal">{c.cert} ✓</Badge>
              ))}
            </div>
          </div>
        )}

        {/* I Passed Button */}
        <Link
          href="/passed"
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border-2 border-amber bg-amber/8 text-amber font-mono font-bold tracking-wide hover:bg-amber/15 transition-colors mb-6"
        >
          I Passed My Exam — Claim Your Badge
        </Link>

        {/* Free tier usage */}
        {!sub.loading && sub.plan === 'free' && (
          <div className="flex items-center justify-between flex-wrap gap-3 bg-teal/4 border border-teal/20 rounded-xl px-5 py-4 mb-5">
            <div>
              <p className="font-mono text-teal text-[0.72rem] tracking-[0.1em] uppercase mb-1">
                Free Tier — Hourly Usage
              </p>
              <p className="text-sm text-text-2 flex gap-5 flex-wrap">
                <span>Questions: <strong>{sub.usage?.questionsThisHour ?? 0} / {sub.usage?.questionsLimit ?? 20}</strong></span>
                <span>AI Chat: <strong>{sub.usage?.aiChatsToday ?? 0} / {sub.usage?.aiChatsLimit ?? 5}</strong></span>
              </p>
            </div>
            <Link
              href="/pricing"
              className="font-mono text-xs tracking-wide text-white bg-gradient-to-r from-teal-dark to-teal px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Upgrade to Pro — $19
            </Link>
          </div>
        )}

        <p className="font-mono text-xs tracking-widest text-text-3 mb-6 text-center uppercase">
          Select Your Certification
        </p>

        {/* Cert cards with skeleton */}
        {pageLoading ? (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-white border-2 border-cream-2 rounded-xl overflow-hidden">
                <Skeleton className="h-28 w-full rounded-none" />
                <div className="p-6 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
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
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="triple-crown">Triple Crown</Badge>
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
                          <ChevronRight className="w-5 h-5 text-text-3" />
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
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* SJT card */}
            {sub.isPaid ? (
              <div
                onClick={() => router.push('/quiz/scenarios')}
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
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => router.push('/pricing')}
                className="group relative bg-white border-2 border-cream-2 rounded-xl overflow-hidden cursor-pointer opacity-60 hover:opacity-75 transition-all duration-300"
              >
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="locked">Premium</Badge>
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
                      <ChevronRight className="w-5 h-5 text-text-3" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progression Widget */}
        {progLoaded && (
          <div className="flex items-center justify-between flex-wrap gap-3 bg-teal/4 border border-teal/20 rounded-xl px-5 py-4 mb-3">
            <div>
              <p className="font-mono text-teal text-[0.72rem] tracking-[0.1em] uppercase mb-1">
                Your Progression
              </p>
              <p className="text-sm text-text-2 flex gap-5 flex-wrap">
                <span>XP: <strong>{progXp}</strong> · <span className="font-semibold" style={{ color: tier.color }}>{tier.label}</span></span>
                <span>Badges: <strong>{progBadgeCount}</strong></span>
                <span>Levels: <strong>{progLevelsCompleted} / 5</strong></span>
              </p>
            </div>
            <Link
              href="/progression"
              className="font-mono text-xs tracking-wide text-white bg-gradient-to-r from-teal-dark to-teal px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              View Progression →
            </Link>
          </div>
        )}

        {/* Progression Mode Card */}
        <div className="flex items-center justify-between flex-wrap gap-6 bg-[#0B1F3A] border border-teal/25 border-l-4 border-l-teal rounded-2xl px-6 py-6 mt-2">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 bg-teal/12 border border-teal/30 rounded-[10px] flex items-center justify-center">
              <LockOpen className="w-5 h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[0.62rem] tracking-[0.12em] text-teal uppercase font-bold mb-1">
                New · Progression Mode
              </p>
              <p className="font-serif text-[1.15rem] font-bold text-[#F5F0E8] leading-snug mb-1">
                Unlock Challenge
              </p>
              <p className="text-sm text-[#F5F0E8]/55 leading-snug mb-1.5">
                Earn your way through 5 levels. Knowledge is earned, not accessed.
              </p>
              <p className="font-mono text-[0.68rem] text-teal/70 tracking-[0.06em]">
                5 levels · 15 questions each · 80% to advance
              </p>
            </div>
          </div>
          <Link
            href="/progression"
            className="flex-shrink-0 font-mono text-sm font-bold text-white bg-gradient-to-r from-teal-dark to-teal px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow-[0_2px_12px_rgba(20,189,172,0.25)]"
          >
            Start →
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-cream-2 px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-widest text-text-3 mb-6 text-center uppercase">
            Study Features
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: BookOpen, title: 'Practice Quiz', desc: 'Instant feedback on 20 questions' },
              { Icon: Layers, title: 'Flashcards', desc: 'Flip through cards to memorize' },
              { Icon: Clock, title: 'Mock Exam', desc: 'Timed simulation of real exam' },
              { Icon: Sliders, title: 'Custom Quiz', desc: 'Build your own by domain' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.Icon className="w-5 h-5" />
                </div>
                <div className="font-serif font-bold text-navy mb-1">{feature.title}</div>
                <div className="text-xs text-text-3">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Service Card */}
      <div className="px-4 sm:px-6 py-6 border-t border-cream-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-cream rounded-xl p-5 border-l-4 border-l-teal">
            <FileText className="w-7 h-7 flex-shrink-0 text-teal" />
            <div className="flex-1 min-w-0">
              <p className="font-serif font-bold text-navy text-sm mb-0.5">
                Turn your certification into your next opportunity
              </p>
              <p className="text-xs text-text-3">
                Expert-written, ATS-optimized resumes for healthcare professionals · 87% interview rate · Starting at $29
              </p>
            </div>
            <a
              href="https://www.myqualifiedresume.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 font-mono text-xs tracking-widest text-white bg-gradient-to-r from-teal-dark to-teal px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              GET YOUR RESUME →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-4 sm:px-6 py-8">
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
