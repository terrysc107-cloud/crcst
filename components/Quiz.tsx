'use client'

import { useState, useEffect, useRef } from 'react'
import type { Question } from '@/lib/questions'
import { getSupabase } from '@/lib/supabase'
import { updateState, DEFAULT_STATE, type QuestionState, type ConfidenceRating } from '@/lib/srs'
import { upsertQuestionState } from '@/lib/dal/srs'

interface QuizData {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
}

interface QuizProps {
  quizData: QuizData
  mode: 'practice' | 'flashcards' | 'mock' | 'custom'
  cert?: 'crcst' | 'chl' | 'cer'
  onComplete: (results: any) => void
  onExit: () => void
  onPause?: (sessionData: any) => void
  user?: any
}

export default function Quiz({ quizData, mode, cert = 'crcst', onComplete, onExit, onPause, user }: QuizProps) {
  const [current, setCurrent] = useState(quizData.currentIndex || 0)
  const [answers, setAnswers] = useState<(number | null)[]>(quizData.answers)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [timeLeft, setTimeLeft] = useState(mode === 'mock' ? 50 * 60 : 0) // 50 minutes for mock
  const [isPausing, setIsPausing] = useState(false)
  const [pauseSaved, setPauseSaved] = useState(false)
  const [rateLimitReached, setRateLimitReached] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; remaining: number } | null>(null)
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  const [confidencePicked, setConfidencePicked] = useState(false)
  const touchStartY = useRef<number | null>(null)

  const q = quizData.questions[current]
  const progress = ((current + 1) / quizData.questions.length) * 100
  const hasAnswered = answers[current] !== null
  const isCorrect = hasAnswered && answers[current] === q.correct_answer

  // Timer for mock exam
  useEffect(() => {
    if (mode !== 'mock' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [mode, timeLeft])

  // Keyboard shortcuts: 1-4 select options, Space/Enter advances
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1
        if (idx < q.options.length && !hasAnswered && !rateLimitReached) {
          selectAnswer(idx)
        }
        return
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (mode === 'flashcards') {
          setIsFlipped((f) => !f)
        } else if (mode === 'practice') {
          if (hasAnswered && showExplanation && confidencePicked) handleNext()
        } else {
          if (hasAnswered) handleNext()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current, hasAnswered, showExplanation, confidencePicked, mode, rateLimitReached])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const fireSrsUpdate = async (questionId: string, correct: boolean, confidence: ConfidenceRating) => {
    if (!user?.id) return
    const today = new Date()
    const currentState: QuestionState = questionStates[questionId] ?? {
      ...DEFAULT_STATE,
      next_due: today.toISOString().split('T')[0],
    }
    const newState = updateState(currentState, correct ? 'correct' : 'incorrect', confidence, today)
    setQuestionStates((prev) => ({ ...prev, [questionId]: newState }))
    await upsertQuestionState(
      user.id,
      questionId,
      { ...newState, last_result: correct ? 'correct' : 'incorrect' },
      getSupabase()
    )
  }

  const handleConfidencePick = (confidence: ConfidenceRating) => {
    setConfidencePicked(true)
    fireSrsUpdate(q.id, isCorrect, confidence)
  }

  const handleNext = () => {
    if (current < quizData.questions.length - 1) {
      setCurrent(current + 1)
      setShowExplanation(false)
      setIsFlipped(false)
      setConfidencePicked(false)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
      setShowExplanation(false)
      setIsFlipped(false)
      setConfidencePicked(false)
    }
  }

  const handlePause = async () => {
    if (!onPause || !user) return

    setIsPausing(true)
    const elapsedSeconds = Math.floor((Date.now() - quizData.startTime) / 1000)

    await onPause({
      mode,
      questionIds: quizData.questions.map((q) => q.id),
      answers,
      currentQuestionIndex: current,
      elapsedTimeSeconds: elapsedSeconds,
      timeLeftSeconds: timeLeft,
    })

    setIsPausing(false)
    setPauseSaved(true)

    // Navigate home after showing confirmation for 2 seconds
    setTimeout(() => {
      setPauseSaved(false)
    }, 3000)
  }

  const handleFinish = () => {
    const correct = answers.filter(
      (a, i) => a === quizData.questions[i].correct_answer
    ).length
    const elapsed = Math.floor((Date.now() - quizData.startTime) / 1000)

    // For mock mode, batch-fire SRS updates now that quiz is done
    if (mode === 'mock' && user?.id) {
      quizData.questions.forEach((q, i) => {
        const ans = answers[i]
        if (ans === null) return
        const wasCorrect = ans === q.correct_answer
        fireSrsUpdate(q.id, wasCorrect, wasCorrect ? 4 : 1)
      })
    }

    onComplete({
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100),
      elapsed,
      mode,
      answers,
      questions: quizData.questions,
    })
  }

  const selectAnswer = async (idx: number) => {
    if (mode === 'mock' && hasAnswered) return // No changing answers in mock mode
    if (hasAnswered) return // Don't count the same question twice
    if (rateLimitReached) return // Don't allow more answers if limit reached

    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)

    // Silent question attempts tracking
    getSupabase().from('question_attempts').insert({
      user_id: user?.id ?? null,
      question_id: q.id,
      cert,
      was_correct: idx === q.correct_answer,
      selected_answer: String.fromCharCode(65 + idx).toLowerCase(),
    }).then(() => {})

    // Increment daily usage count for rate limiting
    if (user?.id) {
      try {
        const session = await getSupabase().auth.getSession()
        const token = session.data.session?.access_token
        const res = await fetch('/api/usage/increment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ field: 'questions_attempted' }),
        })

        const data = await res.json()

        if (res.status === 429 || data.error === 'limit_reached') {
          // Rate limit reached - block further questions (only for free users)
          if (!data.unlimited) {
            setRateLimitReached(true)
            setUsageInfo({ used: data.used || 20, limit: data.limit || 20, remaining: 0 })
          }
        } else if (data.used !== undefined && !data.unlimited) {
          // Update usage info (only for free users with limits)
          setUsageInfo({
            used: data.used,
            limit: data.limit || 20,
            remaining: data.remaining || 0
          })

          // Check if we just hit the limit (free users only)
          if (data.remaining !== null && data.remaining <= 0) {
            setRateLimitReached(true)
          }
        }
      } catch (err) {
        console.error('[v0] Failed to increment usage:', err)
      }
    }

    if (mode === 'practice') {
      setShowExplanation(true)
    }

    // For custom mode, auto-fire SRS without a confidence picker
    if (mode === 'custom') {
      const wasCorrect = idx === q.correct_answer
      fireSrsUpdate(q.id, wasCorrect, wasCorrect ? 4 : 1)
    }
  }

  // Rate limit reached screen
  if (rateLimitReached) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6">
        <div className="text-6xl mb-6">&#9203;</div>
        <h2 className="font-serif text-2xl text-navy mb-4">
          Hourly Limit Reached
        </h2>
        <p className="text-text-3 mb-6">
          You&apos;ve used all {usageInfo?.limit || 20} free questions this hour.
          Your limit will reset in about an hour, or upgrade to Pro for unlimited access.
        </p>

        {usageInfo && (
          <div className="bg-cream rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-3">Questions used</span>
              <span className="text-navy font-mono">{usageInfo.used}/{usageInfo.limit}</span>
            </div>
            <div className="w-full h-2 bg-cream-2 rounded-full overflow-hidden">
              <div className="h-full bg-wrong" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onExit}
            className="flex-1 px-4 py-3 bg-cream-2 text-text rounded-lg font-mono text-sm hover:bg-cream transition"
          >
            Back to Home
          </button>
          <a
            href="/pricing"
            className="flex-1 px-4 py-3 bg-teal text-white rounded-lg font-mono text-sm text-center hover:bg-teal-2 transition"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    )
  }

  // Flashcard mode
  if (mode === 'flashcards') {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="bg-navy text-white px-6 py-3 sticky top-[60px] flex justify-between items-center">
          <div className="flex-1">
            <div className="w-full h-1 bg-navy-3 rounded overflow-hidden">
              <div
                className="h-full bg-teal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-teal-3 mt-1">
              {current + 1} / {quizData.questions.length}
            </div>
          </div>
      <button
        onClick={handlePause}
        disabled={isPausing}
        className="ml-3 px-4 py-2 bg-cream-2 text-text rounded-lg text-sm font-mono hover:bg-cream transition disabled:opacity-50"
      >
        {isPausing ? 'Saving...' : '⏸ Pause'}
      </button>
      <button
        onClick={onExit}
        className="ml-4 text-teal-3 hover:text-white transition"
      >
        ✕
      </button>
        </div>

        {/* Save confirmation banner */}
        {pauseSaved && (
          <div className="mx-6 mt-4 p-3 bg-correct-bg border border-correct rounded-lg flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-correct font-bold">Progress saved!</div>
              <div className="text-xs text-text-3">You can resume this quiz from the home screen.</div>
            </div>
            <button
              onClick={() => onExit()}
              className="ml-4 px-3 py-2 bg-teal text-white rounded-lg text-xs font-mono hover:bg-teal-2 transition"
            >
              Go Home
            </button>
          </div>
        )}

        {/* Flashcard */}
        <div className="px-6 py-8">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY }}
            onTouchEnd={(e) => {
              if (touchStartY.current === null) return
              const delta = e.changedTouches[0].clientY - touchStartY.current
              touchStartY.current = null
              if (Math.abs(delta) > 40) setIsFlipped(delta < 0 ? true : false)
            }}
            className="cursor-pointer min-h-[300px]"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front - Question */}
              <div
                className={`bg-white border-2 border-cream-2 rounded-xl p-8 shadow-lg min-h-[300px] flex flex-col justify-center ${
                  isFlipped ? 'hidden' : ''
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="text-xs text-teal tracking-widest mb-4">
                  {q.domain} • {q.difficulty}
                </div>
                <div className="font-serif text-xl text-navy leading-relaxed">
                  {q.question}
                </div>
                <div className="text-xs text-text-3 mt-6 text-center">
                  Tap to reveal answer
                </div>
              </div>

              {/* Back - Answer */}
              <div
                className={`absolute top-0 left-0 w-full bg-teal text-white rounded-xl p-8 shadow-lg min-h-[300px] flex flex-col justify-center ${
                  !isFlipped ? 'hidden' : ''
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-xs tracking-widest mb-4 text-teal-3">
                  ANSWER
                </div>
                <div className="font-serif text-xl leading-relaxed mb-4">
                  {q.options[q.correct_answer]}
                </div>
                <div className="text-sm text-teal-3 leading-relaxed">
                  {q.explanation}
                </div>
              </div>
            </div>
          </div>

          {/* Answer Buttons (shown after flip) */}
          {isFlipped && answers[current] === null && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  if (rateLimitReached) return
                  const newAnswers = [...answers]
                  newAnswers[current] = -1 // Mark as "didn't know"
                  setAnswers(newAnswers)
                  fireSrsUpdate(q.id, false, 1)

                  // Increment usage count for flashcard (counts toward hourly limit)
                  if (user?.id) {
                    try {
                      const session = await getSupabase().auth.getSession()
                      const token = session.data.session?.access_token
                      const res = await fetch('/api/usage/increment', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ field: 'questions_attempted' }),
                      })

                      const data = await res.json()
                      if (res.status === 429 || data.error === 'limit_reached') {
                        setRateLimitReached(true)
                        setUsageInfo({ used: data.used || 20, limit: data.limit || 20, remaining: 0 })
                      } else if (data.used !== undefined) {
                        setUsageInfo({
                          used: data.used,
                          limit: data.limit || 20,
                          remaining: data.remaining || 0
                        })
                        if (data.remaining !== null && data.remaining <= 0) {
                          setRateLimitReached(true)
                        }
                      }
                    } catch (err) {
                      console.error('[v0] Failed to increment flashcard usage:', err)
                    }
                  }
                }}
                disabled={rateLimitReached}
                className="flex-1 px-4 py-3 bg-wrong-bg border-2 border-wrong text-wrong rounded-lg font-mono text-sm hover:bg-wrong/20 transition disabled:opacity-50"
              >
                ✗ Didn't Know
              </button>
              <button
                onClick={async () => {
                  if (rateLimitReached) return
                  const newAnswers = [...answers]
                  newAnswers[current] = q.correct_answer // Mark as "knew it"
                  setAnswers(newAnswers)
                  fireSrsUpdate(q.id, true, 5)

                  // Increment usage count for flashcard (counts toward hourly limit)
                  if (user?.id) {
                    try {
                      const session = await getSupabase().auth.getSession()
                      const token = session.data.session?.access_token
                      const res = await fetch('/api/usage/increment', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ field: 'questions_attempted' }),
                      })

                      const data = await res.json()
                      if (res.status === 429 || data.error === 'limit_reached') {
                        setRateLimitReached(true)
                        setUsageInfo({ used: data.used || 20, limit: data.limit || 20, remaining: 0 })
                      } else if (data.used !== undefined) {
                        setUsageInfo({
                          used: data.used,
                          limit: data.limit || 20,
                          remaining: data.remaining || 0
                        })
                        if (data.remaining !== null && data.remaining <= 0) {
                          setRateLimitReached(true)
                        }
                      }
                    } catch (err) {
                      console.error('[v0] Failed to increment flashcard usage:', err)
                    }
                  }
                }}
                disabled={rateLimitReached}
                className="flex-1 px-4 py-3 bg-correct-bg border-2 border-correct text-correct rounded-lg font-mono text-sm hover:bg-correct/20 transition disabled:opacity-50"
              >
                ✓ Knew It
              </button>
            </div>
          )}

          {/* Show feedback after answering */}
          {isFlipped && answers[current] !== null && (
            <div className={`mt-6 p-3 rounded-lg text-center font-mono text-sm ${
              answers[current] === q.correct_answer
                ? 'bg-correct-bg border border-correct text-correct'
                : 'bg-wrong-bg border border-wrong text-wrong'
            }`}>
              {answers[current] === q.correct_answer ? '✓ Marked as Known' : '✗ Marked for Review'}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="px-6 py-3 bg-cream-2 text-text rounded-lg font-mono disabled:opacity-50 hover:bg-cream transition"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 transition"
            >
              {current === quizData.questions.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz mode (practice, mock, custom)
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="bg-navy text-white px-6 py-3 sticky top-[60px] flex justify-between items-center">
        <div className="flex-1">
          <div className="w-full h-1 bg-navy-3 rounded overflow-hidden">
            <div
              className="h-full bg-teal transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-teal-3 mt-1">
            {current + 1} / {quizData.questions.length}
          </div>
        </div>
        {mode === 'mock' && (
          <div className="mx-4 text-amber font-mono text-sm">
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
        {onPause && user && (
          <button
            onClick={handlePause}
            disabled={isPausing}
            className="ml-3 px-4 py-2 bg-cream-2 text-text rounded-lg text-sm font-mono hover:bg-cream transition disabled:opacity-50"
          >
            {isPausing ? 'Saving...' : 'Pause'}
          </button>
        )}
        <button
          onClick={onExit}
          className="ml-4 text-teal-3 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Save confirmation banner */}
      {pauseSaved && (
        <div className="mx-6 mt-4 p-3 bg-correct-bg border border-correct rounded-lg flex items-center justify-between">
          <div>
            <div className="font-mono text-sm text-correct font-bold">Progress saved!</div>
            <div className="text-xs text-text-3">You can resume this quiz from the home screen.</div>
          </div>
          <button
            onClick={() => onExit()}
            className="ml-4 px-3 py-2 bg-teal text-white rounded-lg text-xs font-mono hover:bg-teal-2 transition"
          >
            Go Home
          </button>
        </div>
      )}

      {/* Question */}
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        {/* Elevated question card */}
        <div className="bg-white rounded-2xl shadow-md border border-cream-2 p-5 sm:p-7 mb-5">
          <div className="text-xs text-teal tracking-widest mb-3 font-mono">
            {q.domain} • {q.difficulty}
          </div>
          <div className="font-serif text-xl text-navy leading-relaxed">
            {q.question}
          </div>
          {mode === 'practice' && !hasAnswered && (
            <div className="text-xs text-text-3 mt-4 hidden sm:block font-mono">
              Press 1–4 to select · Space to advance
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt, idx) => {
            let optionClass =
              'w-full text-left px-5 py-4 rounded-xl border-2 transition font-mono text-sm'

            if (mode === 'practice' && showExplanation) {
              if (idx === q.correct_answer) {
                optionClass += ' border-correct bg-correct-bg text-correct'
              } else if (idx === answers[current] && idx !== q.correct_answer) {
                optionClass += ' border-wrong bg-wrong-bg text-wrong'
              } else {
                optionClass += ' border-cream-2 text-text-3'
              }
            } else {
              if (answers[current] === idx) {
                optionClass += ' border-teal bg-teal/10 text-navy'
              } else {
                optionClass += ' border-cream-2 hover:border-teal text-text'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                disabled={mode === 'practice' && showExplanation}
                className={optionClass}
              >
                <span className="inline-block w-6 h-6 rounded-full bg-cream-2 text-center text-xs leading-6 mr-3">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Explanation + confidence picker (practice mode only) */}
        {mode === 'practice' && showExplanation && (
          <div className="mb-6">
            <div
              className={`p-4 rounded-lg fadeUp ${
                isCorrect ? 'bg-correct-bg border border-correct' : 'bg-wrong-bg border border-wrong'
              }`}
            >
              <div className="font-mono text-sm font-bold mb-2">
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="text-sm leading-relaxed">{q.explanation}</div>
            </div>

            {/* Confidence picker */}
            {!confidencePicked ? (
              <div className="mt-3 p-4 bg-white border border-cream-2 rounded-lg">
                <div className="text-xs tracking-widest text-text-3 mb-3">
                  HOW WELL DID YOU KNOW THIS?
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { label: 'Guessed', value: 1 as ConfidenceRating, color: 'border-wrong text-wrong hover:bg-wrong/10' },
                    { label: 'Unsure', value: 2 as ConfidenceRating, color: 'border-amber text-amber hover:bg-amber/10' },
                    { label: 'Confident', value: 4 as ConfidenceRating, color: 'border-teal text-teal hover:bg-teal/10' },
                    { label: 'Certain', value: 5 as ConfidenceRating, color: 'border-correct text-correct hover:bg-correct/10' },
                  ] as const).map(({ label, value, color }) => (
                    <button
                      key={value}
                      onClick={() => handleConfidencePick(value)}
                      className={`px-2 py-2 rounded-lg border-2 font-mono text-xs transition ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-cream rounded-lg text-center font-mono text-xs text-text-3">
                Review scheduled ✓
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-6 py-4 bg-cream-2 text-text rounded-xl font-mono disabled:opacity-50 hover:bg-cream transition min-w-[100px]"
          >
            ← Prev
          </button>
          <button
            onClick={handleNext}
            disabled={mode === 'practice' && (!showExplanation || !confidencePicked)}
            className="px-8 py-4 bg-teal text-white rounded-xl font-mono hover:bg-teal-2 disabled:opacity-50 transition min-w-[120px]"
          >
            {current === quizData.questions.length - 1 ? 'Finish ✓' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
