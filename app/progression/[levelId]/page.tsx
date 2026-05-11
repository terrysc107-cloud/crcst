'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, Question } from '@/lib/questions'
import { getLevelById, ProgressionLevel, XpBreakdown, getXpTier, getBadgeById } from '@/lib/progression-config'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Heading, Label, Numeric } from '@/components/ui/typography'

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = 'start' | 'quiz' | 'results'

interface IncorrectItem {
  questionId: string
  questionText: string
  selectedAnswer: number
  correctAnswer: number
  explanation: string
  domain: string
}

interface AttemptResult {
  passed: boolean
  score: number
  correct: number
  total: number
  incorrectItems: IncorrectItem[]
  bonusUnlocked: string[]
  nextLevelUnlocked: number | null
  xpBreakdown: XpBreakdown
  totalXp: number
  badgesEarned: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function XpRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-[0.78rem]">
      <span className="text-white/45 font-mono">{label}</span>
      <span className="text-amber font-mono font-semibold">+{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LevelPage() {
  const router = useRouter()
  const { levelId: levelIdStr } = useParams<{ levelId: string }>()
  const levelId = parseInt(levelIdStr)
  const level: ProgressionLevel | undefined = getLevelById(levelId)

  // Screen state
  const [screen, setScreen] = useState<Screen>('start')

  // Auth / access check
  const [accessChecked, setAccessChecked] = useState(false)

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  // Results state
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)

  // Retry countdown (fail path)
  const [retryCountdown, setRetryCountdown] = useState(30)
  const [retryActive, setRetryActive] = useState(false)

  // Accordion: expanded explanation ids
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Study guide toggle
  const [showGuide, setShowGuide] = useState(false)

  // Start time for session duration tracking
  const [quizStartedAt, setQuizStartedAt] = useState<number>(0)

  // ─── Access check on mount ────────────────────────────────────────────────

  useEffect(() => {
    if (!level) {
      router.push('/progression')
      return
    }

    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/progression')
        return
      }
      const user = session.user

      // Check subscription — progression is Pro+ only
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, tier_expires_at')
        .eq('id', user.id)
        .maybeSingle()

      const tier = profile?.tier ?? 'free'
      const expiresAt = profile?.tier_expires_at
      const isPaid = (tier === 'pro' || tier === 'triple_crown') &&
        (!expiresAt || new Date(expiresAt) > new Date())

      if (!isPaid) {
        router.push('/pricing')
        return
      }

      const { data } = await supabase
        .from('user_levels')
        .select('status')
        .eq('user_id', user.id)
        .eq('level_id', levelId)
        .maybeSingle()

      if (!data || data.status === 'locked') {
        router.push('/progression')
        return
      }

      setAccessChecked(true)
    }

    checkAccess()
  }, [level, levelId, router])

  // ─── Retry countdown ──────────────────────────────────────────────────────

  useEffect(() => {
    if (screen !== 'results' || submitting) return
    if (!result || result.passed) return

    // Start 30-second countdown
    setRetryCountdown(30)
    setRetryActive(false)

    const interval = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setRetryActive(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [screen, submitting, result])

  // ─── Submit answers ───────────────────────────────────────────────────────

  const submitAnswers = useCallback(async (finalAnswers: Record<string, number>) => {
    setScreen('results')
    setSubmitting(true)

    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token

    const durationSeconds = quizStartedAt > 0
      ? Math.round((Date.now() - quizStartedAt) / 1000)
      : 0

    const res = await fetch('/api/progression/attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ levelId, answers: finalAnswers, durationSeconds }),
    })

    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }, [levelId, quizStartedAt])

  // ─── Begin level ─────────────────────────────────────────────────────────

  function beginLevel() {
    if (!level) return

    const pool = QUESTIONS.filter(q => level.domains.includes(q.domain))
    const shuffled = fisherYates(pool)
    const selected = shuffled.slice(0, 15)

    setQuestions(selected)
    setCurrentIndex(0)
    setAnswers({})
    setResult(null)
    setExpandedIds(new Set())
    setQuizStartedAt(Date.now())
    setScreen('quiz')
  }

  // ─── Handle answer selection ──────────────────────────────────────────────

  function handleAnswer(optionIndex: number) {
    const question = questions[currentIndex]
    const newAnswers = { ...answers, [question.id]: optionIndex }
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Last question answered — submit
      submitAnswers(newAnswers)
    }
  }

  // ─── Retake ───────────────────────────────────────────────────────────────

  function retake() {
    setResult(null)
    setScreen('start')
    setExpandedIds(new Set())
  }

  // ─── Toggle accordion ─────────────────────────────────────────────────────

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ─── Guard ────────────────────────────────────────────────────────────────

  if (!level) return null
  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-white/40 text-sm tracking-[0.08em] font-mono">
          Verifying access...
        </div>
      </div>
    )
  }

  // ─── START SCREEN ─────────────────────────────────────────────────────────

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-[560px]">

          {/* Back link */}
          <Link
            href="/progression"
            className="inline-flex items-center gap-[0.35rem] text-white/40 text-[0.8rem] no-underline mb-10 tracking-[0.04em] hover:text-white/70 transition-colors"
          >
            ← Back to Progression
          </Link>

          {/* Level label */}
          <Label color="teal" size="sm" className="mb-3">
            Level {level.id}
          </Label>

          {/* Level name */}
          <Heading as="h1" size="3xl" className="text-white mb-4 text-[clamp(2rem,6vw,3rem)]">
            {level.name}
          </Heading>

          {/* Description */}
          <p className="text-white/65 text-base leading-[1.65] mb-6">
            {level.description}
          </p>

          {/* Domain tags */}
          <div className="flex flex-wrap gap-2 mb-7">
            {level.domains.map(domain => (
              <span
                key={domain}
                className="bg-teal/[12%] border border-teal/30 rounded-full px-3 py-[0.2rem] text-teal text-xs tracking-[0.04em]"
              >
                {domain}
              </span>
            ))}
          </div>

          {/* Meta line */}
          <div className="text-white/40 text-[0.8rem] mb-6 tracking-[0.02em]">
            15 questions · Pass with 80% to unlock the next level
          </div>

          {/* Study Guide */}
          <div className="border border-teal/20 rounded-[10px] mb-7 overflow-hidden">
            <button
              onClick={() => setShowGuide(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-teal/[7%] border-none cursor-pointer text-teal font-mono text-[0.72rem] tracking-[0.1em] uppercase"
            >
              <span>Key Concepts — Study Before You Begin</span>
              <span
                className="text-[0.9rem] transition-transform duration-200"
                style={{ transform: showGuide ? 'rotate(180deg)' : 'none' }}
              >
                ▾
              </span>
            </button>
            {showGuide && (
              <div className="py-2">
                {level.studyGuide.keyConcepts.map((concept, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 ${i === 0 ? '' : 'border-t border-white/[6%]'}`}
                  >
                    <div className="font-mono text-[0.78rem] font-bold text-amber mb-1">
                      {concept.term}
                    </div>
                    <div className="text-[0.82rem] text-white/60 leading-[1.55]">
                      {concept.definition}
                    </div>
                  </div>
                ))}
                <div className="mx-4 mt-2 mb-1 px-[0.85rem] py-[0.65rem] bg-teal/[6%] border-l-[3px] border-teal rounded-r-md">
                  <Label color="teal" size="xs" className="mb-[0.2rem]">Focus Tip</Label>
                  <div className="text-[0.8rem] text-white/55 leading-[1.55]">{level.studyGuide.focusTip}</div>
                </div>
              </div>
            )}
          </div>

          {/* Begin button */}
          <Button
            onClick={beginLevel}
            variant="default"
            className="w-full py-4 text-base font-bold tracking-[0.04em] font-mono rounded-[10px]"
          >
            Begin Level
          </Button>
        </div>
      </div>
    )
  }

  // ─── QUIZ SCREEN ──────────────────────────────────────────────────────────

  if (screen === 'quiz') {
    const question = questions[currentIndex]
    const progressPct = ((currentIndex) / 15) * 100

    return (
      <div className="min-h-screen bg-navy flex flex-col">

        {/* Progress bar */}
        <Progress
          value={progressPct}
          color="teal"
          className="rounded-none h-[3px] flex-shrink-0"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[7%] flex-shrink-0">
          <div className="text-white/45 text-[0.78rem] font-mono">
            {level.name}
          </div>
          <div className="text-teal text-[0.8rem] font-mono font-semibold">
            Question {currentIndex + 1} of 15
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          <div className="w-full max-w-[640px]">

            {/* Question text */}
            <p className="text-white text-[clamp(1.05rem,3vw,1.3rem)] leading-[1.6] mb-8 font-display">
              {question.question}
            </p>

            {/* Option buttons */}
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

  // ─── RESULTS SCREEN ───────────────────────────────────────────────────────

  // Loading state while submitting
  if (submitting) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-teal/25 border-t-teal rounded-full animate-spin" />
        <div className="text-white/50 text-[0.9rem] font-mono">
          Calculating your score...
        </div>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="min-h-screen bg-navy px-5 py-8 flex flex-col items-center">
      <div className="w-full max-w-[640px]">

        {/* Score block */}
        <div className="text-center mb-8 px-6 py-10 bg-white/[3%] border border-white/[8%] rounded-[14px]">

          {/* Score number */}
          <Numeric
            size="5xl"
            color={result.passed ? 'teal' : 'amber'}
            className="text-[clamp(3rem,10vw,5rem)] block mb-3"
          >
            {Math.round(result.score)}%
          </Numeric>

          {/* Pass / fail badge */}
          {result.passed ? (
            <span className="inline-block bg-green-500/15 border border-green-500/40 rounded-full px-[0.9rem] py-1 text-green-400 text-[0.78rem] font-bold font-mono tracking-[0.08em] uppercase mb-5">
              Level Complete
            </span>
          ) : (
            <span className="inline-block bg-amber/[12%] border border-amber/35 rounded-full px-[0.9rem] py-1 text-amber text-[0.78rem] font-bold font-mono tracking-[0.08em] uppercase mb-5">
              Not quite — 80% required to advance
            </span>
          )}

          {/* Correct count */}
          <div className="text-white/45 text-[0.85rem] font-mono">
            {result.correct} of {result.total} correct
          </div>
        </div>

        {/* PASS extras */}
        {result.passed && (
          <>
            {/* Study Module card */}
            <div className="mb-4 px-5 py-4 rounded-[10px] bg-amber/[6%] border border-amber/30">
              <div className="text-[0.68rem] font-mono tracking-[0.12em] text-amber uppercase mb-2">
                Study Module Unlocked
              </div>
              <p className="text-white/65 text-[0.85rem] leading-[1.55] mb-3">
                Review the 5 key concepts for Level {level.id} and complete the CEU assessment.
                Completion is tracked for future credentialing.
              </p>
              <Link
                href={`/progression/${levelId}/study`}
                className="inline-block bg-amber/[15%] border border-amber/50 text-amber no-underline px-4 py-[0.45rem] rounded-[8px] text-[0.8rem] font-bold font-mono tracking-[0.03em]"
              >
                Open Study Module →
              </Link>
            </div>

            {/* Next level unlocked */}
            {result.nextLevelUnlocked && (
              <div className="mb-4 px-5 py-4 rounded-[10px] bg-teal/[6%] border border-teal/45 relative overflow-hidden">
                <style>{`
                  @keyframes borderReveal {
                    from { border-color: rgba(20,189,172,0.0); }
                    to   { border-color: rgba(20,189,172,0.45); }
                  }
                `}</style>
                <Label color="teal" className="mb-[0.3rem]">Unlocked</Label>
                <div className="text-white text-[0.95rem] font-semibold">
                  Level {result.nextLevelUnlocked} unlocked!
                </div>
              </div>
            )}

            {/* Bonus unlocked */}
            {result.bonusUnlocked.length > 0 && (
              <div className="mb-4 px-5 py-[0.85rem] rounded-[10px] bg-amber/[8%] border border-amber/30">
                <Label color="amber" as="span">Bonus Unlocked:{' '}</Label>
                <span className="text-white text-[0.9rem]">
                  {result.bonusUnlocked.join(', ')}
                </span>
              </div>
            )}
          </>
        )}

        {/* Badges earned */}
        {result.badgesEarned?.length > 0 && (
          <div className="mb-4 px-5 py-4 rounded-[10px] bg-teal/[6%] border border-teal/30">
            <Label color="teal" className="mb-3">
              {result.badgesEarned.length === 1 ? 'Badge Unlocked' : 'Badges Unlocked'}
            </Label>
            <div className="flex flex-col gap-2">
              {result.badgesEarned.map(id => {
                const badge = getBadgeById(id)
                if (!badge) return null
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${badge.color}20`, border: `1px solid ${badge.color}60` }}
                    >
                      {badge.icon}
                    </span>
                    <div>
                      <div className="text-white text-[0.88rem] font-semibold">{badge.name}</div>
                      <div className="text-white/45 text-xs">{badge.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* XP earned block */}
        {result.xpBreakdown && (
          <div className="mb-4 px-5 py-4 rounded-[10px] bg-amber/[6%] border border-amber/25">
            <div className="flex items-center justify-between mb-[0.6rem]">
              <Label color="amber">XP Earned</Label>
              <Numeric size="lg" color="amber">+{result.xpBreakdown.total}</Numeric>
            </div>
            <div className="flex flex-col gap-[0.3rem]">
              {result.xpBreakdown.attempt > 0 && (
                <XpRow label="Attempted" value={result.xpBreakdown.attempt} />
              )}
              {result.xpBreakdown.pass > 0 && (
                <XpRow label="Level passed" value={result.xpBreakdown.pass} />
              )}
              {result.xpBreakdown.firstPass > 0 && (
                <XpRow label="First pass bonus" value={result.xpBreakdown.firstPass} />
              )}
              {result.xpBreakdown.precision > 0 && (
                <XpRow label="Precision bonus (90%+)" value={result.xpBreakdown.precision} />
              )}
            </div>
            <div className="mt-3 pt-[0.6rem] border-t border-amber/[15%] flex items-center justify-between">
              <span className="text-xs text-white/40 font-mono">Total XP</span>
              <span
                className="text-[0.85rem] font-bold font-mono"
                style={{ color: getXpTier(result.totalXp).color }}
              >
                {result.totalXp} · {getXpTier(result.totalXp).label}
              </span>
            </div>
          </div>
        )}

        {/* FAIL retry button */}
        {!result.passed && (
          <div className="mb-4">
            <Button
              onClick={retryActive ? beginLevel : undefined}
              disabled={!retryActive}
              className={`w-full py-[0.85rem] rounded-[10px] text-[0.9rem] font-bold font-mono tracking-[0.04em] ${retryActive ? '' : 'cursor-not-allowed'}`}
              variant={retryActive ? 'default' : 'outline'}
            >
              {retryActive
                ? 'Retry Level'
                : `Retry available in ${retryCountdown}s...`}
            </Button>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col gap-[0.6rem] mb-8">
          <Button
            asChild
            variant={result.passed ? 'default' : 'ghost'}
            className="w-full py-[0.85rem] rounded-[10px] text-[0.9rem] font-bold font-mono tracking-[0.04em]"
          >
            <Link href="/progression">Return to Dashboard</Link>
          </Button>

          {result.passed && (
            <Button
              onClick={retake}
              variant="ghost"
              className="w-full py-[0.85rem] rounded-[10px] text-[0.85rem] font-mono tracking-[0.04em] text-white/45 border border-white/10"
            >
              Retake this level
            </Button>
          )}
        </div>

        {/* ─── Remediation section (fail only) ─── */}
        {!result.passed && result.incorrectItems.length > 0 && (
          <div>
            <Label color="muted" className="mb-4">
              Review wrong answers ({result.incorrectItems.length})
            </Label>

            <div className="flex flex-col gap-3">
              {result.incorrectItems.map((item) => {
                const isExpanded = expandedIds.has(item.questionId)
                // Look up options from local QUESTIONS (safe: server sends IDs)
                const q = QUESTIONS.find(q => q.id === item.questionId)
                const selectedLabel = q?.options[item.selectedAnswer] ?? `Option ${item.selectedAnswer + 1}`
                const correctLabel = q?.options[item.correctAnswer] ?? `Option ${item.correctAnswer + 1}`

                return (
                  <div
                    key={item.questionId}
                    className="bg-white/[3%] border border-white/[8%] rounded-[10px] overflow-hidden"
                  >
                    {/* Question + domain tag */}
                    <div className="px-5 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="text-white text-[0.9rem] leading-[1.55] m-0 flex-1">
                          {item.questionText}
                        </p>
                        <span className="flex-shrink-0 bg-teal/10 border border-teal/20 rounded-full px-[0.6rem] py-[0.15rem] text-teal text-[0.68rem] tracking-[0.04em] whitespace-nowrap">
                          {item.domain}
                        </span>
                      </div>

                      {/* Your answer */}
                      <div className="flex items-start gap-2 mb-[0.4rem] text-[0.82rem]">
                        <span className="text-white/35 font-mono flex-shrink-0">Your answer:</span>
                        <span className="text-red-400">{selectedLabel}</span>
                      </div>

                      {/* Correct answer */}
                      <div className="flex items-start gap-2 text-[0.82rem]">
                        <span className="text-white/35 font-mono flex-shrink-0">Correct answer:</span>
                        <span className="text-green-400">{correctLabel}</span>
                      </div>
                    </div>

                    {/* Accordion toggle */}
                    <button
                      onClick={() => toggleExpanded(item.questionId)}
                      className="w-full px-5 py-[0.6rem] bg-white/[3%] border-none border-t border-white/[7%] text-white/45 text-[0.78rem] cursor-pointer text-left font-mono tracking-[0.04em] flex items-center gap-[0.4rem] hover:text-teal transition-colors"
                    >
                      <span
                        className="inline-block transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ›
                      </span>
                      Why?
                    </button>

                    {/* Explanation */}
                    {isExpanded && (
                      <div className="px-5 py-[0.85rem] border-t border-white/[7%] text-white/70 text-[0.85rem] leading-[1.65] bg-teal/[4%]">
                        {item.explanation}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  )
}
