'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, Question } from '@/lib/questions'
import { getLevelById, ProgressionLevel, XpBreakdown, getXpTier, getBadgeById } from '@/lib/progression-config'

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
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
      <span style={{ color: 'rgba(245,240,232,0.45)', fontFamily: 'monospace' }}>{label}</span>
      <span style={{ color: '#DAA520', fontFamily: 'monospace', fontWeight: 600 }}>+{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LevelPage({ params }: { params: { levelId: string } }) {
  const router = useRouter()
  const levelId = parseInt(params.levelId)
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

  // ─── Access check on mount ────────────────────────────────────────────────

  useEffect(() => {
    if (!level) {
      router.push('/progression')
      return
    }

    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/progression')
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

    const res = await fetch('/api/progression/attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ levelId, answers: finalAnswers }),
    })

    const data = await res.json()
    setResult(data)
    setSubmitting(false)
  }, [levelId])

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
      <div style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: '0.85rem', letterSpacing: '0.08em' }}>
          Verifying access...
        </div>
      </div>
    )
  }

  // ─── START SCREEN ─────────────────────────────────────────────────────────

  if (screen === 'start') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* Back link */}
          <Link href="/progression" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'rgba(245,240,232,0.4)',
            fontSize: '0.8rem',
            textDecoration: 'none',
            marginBottom: '2.5rem',
            letterSpacing: '0.04em',
            transition: 'color 0.15s',
          }}>
            ← Back to Progression
          </Link>

          {/* Level label */}
          <div style={{
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            color: '#14BDAC',
            fontFamily: 'monospace',
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
          }}>
            Level {level.id}
          </div>

          {/* Level name */}
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 700,
            color: '#F5F0E8',
            margin: '0 0 1rem 0',
            lineHeight: 1.15,
          }}>
            {level.name}
          </h1>

          {/* Description */}
          <p style={{
            color: 'rgba(245,240,232,0.65)',
            fontSize: '1rem',
            lineHeight: 1.65,
            margin: '0 0 1.5rem 0',
          }}>
            {level.description}
          </p>

          {/* Domain tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
            {level.domains.map(domain => (
              <span key={domain} style={{
                background: 'rgba(20,189,172,0.12)',
                border: '1px solid rgba(20,189,172,0.3)',
                borderRadius: '100px',
                padding: '0.2rem 0.7rem',
                color: '#14BDAC',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
              }}>
                {domain}
              </span>
            ))}
          </div>

          {/* Meta line */}
          <div style={{
            color: 'rgba(245,240,232,0.4)',
            fontSize: '0.8rem',
            marginBottom: '1.5rem',
            letterSpacing: '0.02em',
          }}>
            15 questions · Pass with 80% to unlock the next level
          </div>

          {/* Study Guide */}
          <div style={{
            border: '1px solid rgba(20,189,172,0.2)',
            borderRadius: '10px',
            marginBottom: '1.75rem',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowGuide(v => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(20,189,172,0.07)',
                border: 'none',
                cursor: 'pointer',
                color: '#14BDAC',
                fontFamily: 'monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
              }}
            >
              <span>Key Concepts — Study Before You Begin</span>
              <span style={{ fontSize: '0.9rem', transition: 'transform 0.2s', transform: showGuide ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {showGuide && (
              <div style={{ padding: '0.25rem 0 0.5rem' }}>
                {level.studyGuide.keyConcepts.map((concept, i) => (
                  <div key={i} style={{
                    padding: '0.75rem 1rem',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#DAA520',
                      marginBottom: '0.25rem',
                    }}>
                      {concept.term}
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: 'rgba(245,240,232,0.6)',
                      lineHeight: 1.55,
                    }}>
                      {concept.definition}
                    </div>
                  </div>
                ))}
                <div style={{
                  margin: '0.5rem 1rem 0.25rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(20,189,172,0.06)',
                  borderLeft: '3px solid #14BDAC',
                  borderRadius: '0 6px 6px 0',
                }}>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#14BDAC', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>FOCUS TIP</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(245,240,232,0.55)', lineHeight: 1.55 }}>{level.studyGuide.focusTip}</div>
                </div>
              </div>
            )}
          </div>

          {/* Begin button */}
          <button
            onClick={beginLevel}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#14BDAC',
              color: '#0D1B2A',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              fontFamily: 'monospace',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Begin Level
          </button>
        </div>
      </div>
    )
  }

  // ─── QUIZ SCREEN ──────────────────────────────────────────────────────────

  if (screen === 'quiz') {
    const question = questions[currentIndex]
    const progressPct = ((currentIndex) / 15) * 100

    return (
      <div style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'rgba(245,240,232,0.08)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: '#14BDAC',
            transition: 'width 0.25s ease',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(245,240,232,0.07)',
          flexShrink: 0,
        }}>
          <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            {level.name}
          </div>
          <div style={{ color: '#14BDAC', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>
            Question {currentIndex + 1} of 15
          </div>
        </div>

        {/* Question area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.25rem',
        }}>
          <div style={{ width: '100%', maxWidth: '640px' }}>

            {/* Question text */}
            <p style={{
              color: '#F5F0E8',
              fontSize: 'clamp(1.05rem, 3vw, 1.3rem)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              fontFamily: 'Georgia, serif',
            }}>
              {question.question}
            </p>

            {/* Option buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    width: '100%',
                    padding: '1rem 1.25rem',
                    background: 'rgba(245,240,232,0.04)',
                    border: '1px solid rgba(245,240,232,0.12)',
                    borderRadius: '10px',
                    color: '#F5F0E8',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    lineHeight: 1.5,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(20,189,172,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(20,189,172,0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(245,240,232,0.04)'
                    e.currentTarget.style.borderColor = 'rgba(245,240,232,0.12)'
                  }}
                >
                  <span style={{
                    flexShrink: 0,
                    width: '1.6rem',
                    height: '1.6rem',
                    borderRadius: '50%',
                    background: 'rgba(20,189,172,0.15)',
                    color: '#14BDAC',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '0.05rem',
                  }}>
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
      <div style={{
        minHeight: '100vh',
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: '2.5rem',
          height: '2.5rem',
          border: '2px solid rgba(20,189,172,0.25)',
          borderTopColor: '#14BDAC',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: 'rgba(245,240,232,0.5)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
          Calculating your score...
        </div>
      </div>
    )
  }

  if (!result) return null

  const scoreColor = result.passed ? '#14BDAC' : '#DAA520'
  const scoreDisplay = `${Math.round(result.score)}%`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      padding: '2rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>

        {/* Score block */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2.5rem 1.5rem',
          background: 'rgba(245,240,232,0.03)',
          border: '1px solid rgba(245,240,232,0.08)',
          borderRadius: '14px',
        }}>

          {/* Score number */}
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
            marginBottom: '0.75rem',
          }}>
            {scoreDisplay}
          </div>

          {/* Pass / fail badge */}
          {result.passed ? (
            <span style={{
              display: 'inline-block',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: '100px',
              padding: '0.25rem 0.9rem',
              color: '#4ade80',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Level Complete
            </span>
          ) : (
            <span style={{
              display: 'inline-block',
              background: 'rgba(218,165,32,0.12)',
              border: '1px solid rgba(218,165,32,0.35)',
              borderRadius: '100px',
              padding: '0.25rem 0.9rem',
              color: '#DAA520',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              Not quite — 80% required to advance
            </span>
          )}

          {/* Correct count */}
          <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
            {result.correct} of {result.total} correct
          </div>
        </div>

        {/* PASS extras */}
        {result.passed && (
          <>
            {/* Next level unlocked */}
            {result.nextLevelUnlocked && (
              <div style={{
                marginBottom: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                background: 'rgba(20,189,172,0.06)',
                border: '1px solid rgba(20,189,172,0.0)',
                animation: 'borderReveal 0.6s ease forwards 0.3s',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <style>{`
                  @keyframes borderReveal {
                    from { border-color: rgba(20,189,172,0.0); }
                    to   { border-color: rgba(20,189,172,0.45); }
                  }
                `}</style>
                <div style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.12em',
                  color: '#14BDAC',
                  fontFamily: 'monospace',
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                }}>
                  Unlocked
                </div>
                <div style={{ color: '#F5F0E8', fontSize: '0.95rem', fontWeight: 600 }}>
                  Level {result.nextLevelUnlocked} unlocked!
                </div>
              </div>
            )}

            {/* Bonus unlocked */}
            {result.bonusUnlocked.length > 0 && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                background: 'rgba(218,165,32,0.08)',
                border: '1px solid rgba(218,165,32,0.3)',
              }}>
                <span style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: '#DAA520', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                  Bonus Unlocked:{' '}
                </span>
                <span style={{ color: '#F5F0E8', fontSize: '0.9rem' }}>
                  {result.bonusUnlocked.join(', ')}
                </span>
              </div>
            )}
          </>
        )}

        {/* Badges earned */}
        {result.badgesEarned?.length > 0 && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(20,189,172,0.06)',
            border: '1px solid rgba(20,189,172,0.3)',
          }}>
            <div style={{
              fontSize: '0.68rem',
              letterSpacing: '0.12em',
              color: '#14BDAC',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              {result.badgesEarned.length === 1 ? 'Badge Unlocked' : 'Badges Unlocked'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.badgesEarned.map(id => {
                const badge = getBadgeById(id)
                if (!badge) return null
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${badge.color}20`,
                      border: `1px solid ${badge.color}60`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}>{badge.icon}</span>
                    <div>
                      <div style={{ color: '#F5F0E8', fontSize: '0.88rem', fontWeight: 600 }}>{badge.name}</div>
                      <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: '0.75rem' }}>{badge.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* XP earned block */}
        {result.xpBreakdown && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            background: 'rgba(218,165,32,0.06)',
            border: '1px solid rgba(218,165,32,0.25)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.6rem',
            }}>
              <div style={{
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                color: '#DAA520',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}>
                XP Earned
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#DAA520',
                fontFamily: 'monospace',
              }}>
                +{result.xpBreakdown.total}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
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
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.6rem',
              borderTop: '1px solid rgba(218,165,32,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,232,0.4)', fontFamily: 'monospace' }}>
                Total XP
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getXpTier(result.totalXp).color, fontFamily: 'monospace' }}>
                {result.totalXp} · {getXpTier(result.totalXp).label}
              </span>
            </div>
          </div>
        )}

        {/* FAIL retry button */}
        {!result.passed && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={retryActive ? beginLevel : undefined}
              disabled={!retryActive}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: retryActive ? '#14BDAC' : 'rgba(20,189,172,0.1)',
                color: retryActive ? '#0D1B2A' : 'rgba(20,189,172,0.4)',
                border: `1px solid ${retryActive ? '#14BDAC' : 'rgba(20,189,172,0.2)'}`,
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: retryActive ? 'pointer' : 'not-allowed',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
            >
              {retryActive
                ? 'Retry Level'
                : `Retry available in ${retryCountdown}s...`}
            </button>
          </div>
        )}

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
          <Link href="/progression" style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.85rem',
            background: result.passed ? '#14BDAC' : 'rgba(245,240,232,0.05)',
            color: result.passed ? '#0D1B2A' : 'rgba(245,240,232,0.6)',
            border: result.passed ? 'none' : '1px solid rgba(245,240,232,0.12)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}>
            Return to Dashboard
          </Link>

          {result.passed && (
            <button
              onClick={retake}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'transparent',
                color: 'rgba(245,240,232,0.45)',
                border: '1px solid rgba(245,240,232,0.1)',
                borderRadius: '10px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            >
              Retake this level
            </button>
          )}
        </div>

        {/* ─── Remediation section (fail only) ─── */}
        {!result.passed && result.incorrectItems.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.68rem',
              letterSpacing: '0.12em',
              color: 'rgba(245,240,232,0.35)',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              Review wrong answers ({result.incorrectItems.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.incorrectItems.map((item) => {
                const isExpanded = expandedIds.has(item.questionId)
                // Look up options from local QUESTIONS (safe: server sends IDs)
                const q = QUESTIONS.find(q => q.id === item.questionId)
                const selectedLabel = q?.options[item.selectedAnswer] ?? `Option ${item.selectedAnswer + 1}`
                const correctLabel = q?.options[item.correctAnswer] ?? `Option ${item.correctAnswer + 1}`

                return (
                  <div
                    key={item.questionId}
                    style={{
                      background: 'rgba(245,240,232,0.03)',
                      border: '1px solid rgba(245,240,232,0.08)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Question + domain tag */}
                    <div style={{ padding: '1rem 1.25rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <p style={{
                          color: '#F5F0E8',
                          fontSize: '0.9rem',
                          lineHeight: 1.55,
                          margin: 0,
                          flex: 1,
                        }}>
                          {item.questionText}
                        </p>
                        <span style={{
                          flexShrink: 0,
                          background: 'rgba(20,189,172,0.1)',
                          border: '1px solid rgba(20,189,172,0.2)',
                          borderRadius: '100px',
                          padding: '0.15rem 0.6rem',
                          color: '#14BDAC',
                          fontSize: '0.68rem',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.domain}
                        </span>
                      </div>

                      {/* Your answer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.4rem',
                        fontSize: '0.82rem',
                      }}>
                        <span style={{ color: 'rgba(245,240,232,0.35)', fontFamily: 'monospace', flexShrink: 0 }}>
                          Your answer:
                        </span>
                        <span style={{ color: '#f87171' }}>{selectedLabel}</span>
                      </div>

                      {/* Correct answer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '0.82rem',
                      }}>
                        <span style={{ color: 'rgba(245,240,232,0.35)', fontFamily: 'monospace', flexShrink: 0 }}>
                          Correct answer:
                        </span>
                        <span style={{ color: '#4ade80' }}>{correctLabel}</span>
                      </div>
                    </div>

                    {/* Accordion toggle */}
                    <button
                      onClick={() => toggleExpanded(item.questionId)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 1.25rem',
                        background: 'rgba(245,240,232,0.03)',
                        border: 'none',
                        borderTop: '1px solid rgba(245,240,232,0.07)',
                        color: 'rgba(245,240,232,0.45)',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#14BDAC')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.45)')}
                    >
                      <span style={{
                        display: 'inline-block',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}>
                        ›
                      </span>
                      Why?
                    </button>

                    {/* Explanation */}
                    {isExpanded && (
                      <div style={{
                        padding: '0.85rem 1.25rem',
                        borderTop: '1px solid rgba(245,240,232,0.07)',
                        color: 'rgba(245,240,232,0.7)',
                        fontSize: '0.85rem',
                        lineHeight: 1.65,
                        background: 'rgba(20,189,172,0.04)',
                      }}>
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
        <div style={{ height: '3rem' }} />
      </div>
    </div>
  )
}
