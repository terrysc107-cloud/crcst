'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, Question } from '@/lib/questions'
import { getLevelById, ProgressionLevel } from '@/lib/progression-config'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/typography'

type Screen = 'study' | 'quiz' | 'complete'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface CompleteResult {
  score: number
  correct: number
  total: number
  ceuEarned: number
  alreadyCompleted: boolean
}

export default function StudyModulePage() {
  const router = useRouter()
  const { levelId: levelIdStr } = useParams<{ levelId: string }>()
  const levelId = parseInt(levelIdStr)
  const level: ProgressionLevel | undefined = getLevelById(levelId)

  const [screen, setScreen] = useState<Screen>('study')
  const [accessChecked, setAccessChecked] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [startedAt, setStartedAt] = useState<number>(0)

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<CompleteResult | null>(null)

  // ─── Access check ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!level) {
      router.push('/progression')
      return
    }

    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/progression'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, tier_expires_at')
        .eq('id', session.user.id)
        .maybeSingle()

      const tier = profile?.tier ?? 'free'
      const exp = profile?.tier_expires_at
      const isPaid = (tier === 'pro' || tier === 'triple_crown') && (!exp || new Date(exp) > new Date())
      if (!isPaid) { router.push('/pricing'); return }

      // Level must be completed
      const { data: levelRow } = await supabase
        .from('user_levels')
        .select('status')
        .eq('user_id', session.user.id)
        .eq('level_id', levelId)
        .maybeSingle()

      if (!levelRow || levelRow.status !== 'completed') {
        router.push('/progression')
        return
      }

      // Check prior completion
      const { data: ceuMod } = await supabase
        .from('ceu_modules')
        .select('id')
        .eq('level_id', levelId)
        .maybeSingle()

      if (ceuMod) {
        const { data: existing } = await supabase
          .from('user_ceu_completions')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('module_id', ceuMod.id)
          .maybeSingle()

        if (existing) setAlreadyCompleted(true)
      }

      setAccessChecked(true)
    }

    check()
  }, [level, levelId, router])

  // ─── Begin quiz ───────────────────────────────────────────────────────────

  function beginQuiz() {
    if (!level) return
    const pool = QUESTIONS.filter(q => level.domains.includes(q.domain))
    const selected = fisherYates(pool).slice(0, 15)
    setQuestions(selected)
    setCurrentIndex(0)
    setAnswers({})
    setStartedAt(Date.now())
    setScreen('quiz')
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const submitAnswers = useCallback(async (finalAnswers: Record<string, number>) => {
    setScreen('complete')
    setSubmitting(true)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const durationSeconds = Math.round((Date.now() - startedAt) / 1000)

    const res = await fetch('/api/progression/ceu-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ levelId, answers: finalAnswers, durationSeconds }),
    })

    const data = await res.json()
    setResult({ ...data, alreadyCompleted })
    setSubmitting(false)
  }, [levelId, startedAt, alreadyCompleted])

  // ─── Answer handler ───────────────────────────────────────────────────────

  function handleAnswer(optionIndex: number) {
    const question = questions[currentIndex]
    const newAnswers = { ...answers, [question.id]: optionIndex }
    setAnswers(newAnswers)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      submitAnswers(newAnswers)
    }
  }

  if (!level) return null

  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white/40 text-sm tracking-[0.08em] font-mono">Verifying access...</div>
      </div>
    )
  }

  // ─── STUDY SCREEN ─────────────────────────────────────────────────────────

  if (screen === 'study') {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center px-5 py-8">
        <div className="w-full max-w-[600px]">
          <Link
            href={`/progression/${levelId}`}
            className="inline-flex items-center gap-[0.35rem] text-white/40 text-[0.8rem] no-underline mb-10 tracking-[0.04em] hover:text-white/70 transition-colors"
          >
            ← Back to Level
          </Link>

          {/* Header */}
          <div className="mb-8">
            <Label color="teal" size="sm" className="mb-2">
              Study Module · Level {level.id}
            </Label>
            <h1 className="font-serif text-[clamp(1.6rem,5vw,2.2rem)] font-bold text-white mb-3 leading-tight">
              {level.name}
            </h1>
            <p className="text-white/55 text-[0.9rem] leading-[1.6]">
              {level.description}
            </p>
          </div>

          {/* Already completed notice */}
          {alreadyCompleted && (
            <div className="mb-6 px-4 py-3 bg-teal/[8%] border border-teal/30 rounded-[10px] text-[0.82rem] text-teal/80 font-mono">
              You have already completed this module. Retaking does not affect your CEU record.
            </div>
          )}

          {/* Key Concepts */}
          <div className="mb-7">
            <div className="text-[0.68rem] font-mono tracking-[0.12em] text-white/40 uppercase mb-3">
              5 Key Concepts
            </div>
            <div className="bg-white/[4%] border border-white/[8%] rounded-[12px] overflow-hidden">
              {level.studyGuide.keyConcepts.map((concept, i) => (
                <div
                  key={i}
                  className={`px-5 py-4 ${i > 0 ? 'border-t border-white/[7%]' : ''}`}
                >
                  <div className="font-mono text-[0.8rem] font-bold text-amber mb-[0.35rem]">
                    {concept.term}
                  </div>
                  <div className="text-[0.84rem] text-white/65 leading-[1.6]">
                    {concept.definition}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Tip */}
          <div className="mb-8 px-4 py-4 bg-teal/[6%] border-l-[3px] border-teal rounded-r-[10px]">
            <div className="text-[0.68rem] font-mono tracking-[0.12em] text-teal uppercase mb-[0.4rem]">
              Focus Tip
            </div>
            <p className="text-[0.84rem] text-white/60 leading-[1.6] m-0">
              {level.studyGuide.focusTip}
            </p>
          </div>

          {/* Domain tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {level.domains.map(domain => (
              <span
                key={domain}
                className="bg-teal/[10%] border border-teal/25 rounded-full px-3 py-[0.2rem] text-teal text-xs tracking-[0.04em]"
              >
                {domain}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={beginQuiz}
            className="w-full py-4 text-base font-bold tracking-[0.04em] font-mono rounded-[10px] mb-4"
          >
            Begin 15-Question Assessment →
          </Button>

          {/* CEU notice */}
          <p className="text-center text-[0.72rem] text-white/30 font-mono leading-[1.6]">
            Completion will count toward your CEU record when providers are confirmed.
          </p>
        </div>
      </div>
    )
  }

  // ─── QUIZ SCREEN ──────────────────────────────────────────────────────────

  if (screen === 'quiz') {
    const question = questions[currentIndex]
    const progressPct = (currentIndex / 15) * 100

    return (
      <div className="min-h-screen bg-navy flex flex-col">
        <Progress value={progressPct} color="teal" className="rounded-none h-[3px] flex-shrink-0" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[7%] flex-shrink-0">
          <div className="text-white/45 text-[0.78rem] font-mono">
            Study Module · {level.name}
          </div>
          <div className="text-teal text-[0.8rem] font-mono font-semibold">
            Question {currentIndex + 1} of 15
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-[640px]">
            <p className="text-white text-[clamp(1.05rem,3vw,1.3rem)] leading-[1.6] mb-8 font-display">
              {question.question}
            </p>
            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="flex items-start gap-4 w-full px-5 py-4 bg-white/[4%] border border-white/[12%] rounded-[10px] text-white text-[0.95rem] cursor-pointer text-left leading-[1.5] transition-all hover:bg-teal/10 hover:border-teal/40"
                >
                  <span className="flex-shrink-0 w-[1.6rem] h-[1.6rem] rounded-full bg-teal/[15%] text-teal text-xs font-bold font-mono flex items-center justify-center mt-[0.05rem]">
                    {OPTION_LABELS[idx]}
                  </span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── COMPLETE SCREEN ──────────────────────────────────────────────────────

  if (submitting) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-teal/25 border-t-teal rounded-full animate-spin" />
        <div className="text-white/50 text-[0.9rem] font-mono">Recording completion...</div>
      </div>
    )
  }

  if (!result) return null

  const passedQuiz = result.score >= 80

  return (
    <div className="min-h-screen bg-navy px-5 py-8 flex flex-col items-center">
      <div className="w-full max-w-[540px]">

        {/* Score */}
        <div className="text-center mb-8 px-6 py-10 bg-white/[3%] border border-white/[8%] rounded-[14px]">
          <div
            className="font-serif font-bold text-[clamp(3rem,10vw,4.5rem)] mb-3 leading-none"
            style={{ color: passedQuiz ? '#14BDAC' : '#DAA520' }}
          >
            {Math.round(result.score)}%
          </div>
          <div className="text-white/50 text-[0.85rem] font-mono mb-5">
            {result.correct} of {result.total} correct
          </div>

          {/* CEU record notice */}
          <div className="bg-teal/[8%] border border-teal/30 rounded-[10px] px-4 py-4">
            <div className="text-[0.68rem] font-mono tracking-[0.12em] text-teal uppercase mb-2">
              Study Module Complete
            </div>
            <p className="text-[0.82rem] text-white/60 leading-[1.55] m-0">
              This completion will count toward your CEU record when providers are confirmed.
              Your progress is saved.
            </p>
          </div>
        </div>

        {/* CEU earned */}
        <div className="mb-4 px-5 py-4 rounded-[10px] bg-amber/[6%] border border-amber/25 flex items-center justify-between">
          <div>
            <div className="text-[0.68rem] font-mono tracking-[0.12em] text-amber uppercase mb-1">
              Contact Hours Logged
            </div>
            <div className="text-white/60 text-[0.82rem]">Level {level.id} · {level.name}</div>
          </div>
          <div className="font-serif font-bold text-[1.6rem] text-amber">
            {result.ceuEarned.toFixed(1)}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-[0.6rem] mb-6">
          <Button asChild className="w-full py-[0.85rem] rounded-[10px] text-[0.9rem] font-bold font-mono tracking-[0.04em]">
            <Link href="/progression">Return to Progression</Link>
          </Button>
          <button
            onClick={() => setScreen('study')}
            className="w-full py-[0.85rem] rounded-[10px] text-[0.85rem] font-mono tracking-[0.04em] text-white/40 border border-white/10 bg-transparent cursor-pointer hover:text-white/60 transition-colors"
          >
            Review concepts again
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[0.7rem] text-white/25 font-mono leading-[1.7]">
          Will count toward CEU record when providers are confirmed.{' '}
          Contact hours are tracked but not yet submitted to any credentialing body.
        </p>
      </div>
    </div>
  )
}
