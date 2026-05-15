'use client'

import { useState, useEffect, useRef } from 'react'
import type { Question } from '@/lib/questions'
import { supabase } from '@/lib/supabase'
import { SmartUpsellModal } from '@/components/SmartUpsellModal'
import { FREE_LIMITS } from '@/lib/subscription'

interface QuizData {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
}

interface QuizProps {
  quizData: QuizData
  mode: 'practice' | 'flashcards' | 'custom' | 'quiz' | 'test' | 'homework'
  onComplete: (results: any) => void
  onExit: () => void
  onPause?: (sessionData: any) => void
  user?: any
}

export default function Quiz({ quizData, mode, onComplete, onExit, onPause, user }: QuizProps) {
  const [current, setCurrent] = useState(quizData.currentIndex || 0)
  const [answers, setAnswers] = useState<(number | null)[]>(quizData.answers)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [timeLeft, setTimeLeft] = useState(
    mode === 'quiz' ? 30 * 60 : mode === 'test' ? 180 * 60 : 0
  )
  const [isPausing, setIsPausing] = useState(false)
  const [pauseSaved, setPauseSaved] = useState(false)
  const [rateLimitReached, setRateLimitReached] = useState(false)
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; remaining: number } | null>(null)
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showUpsellModal, setShowUpsellModal] = useState(false)
  const [upsellDismissed, setUpsellDismissed] = useState(false)
  const incrementInFlight = useRef(false)

  const q = quizData.questions[current]
  const progress = ((current + 1) / quizData.questions.length) * 100
  const hasAnswered = answers[current] !== null
  const isCorrect = hasAnswered && answers[current] === q.correct_answer

  // Timer for timed exam modes — only depends on mode, not timeLeft (avoids restart on every tick)
  useEffect(() => {
    if (mode !== 'quiz' && mode !== 'test') return

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Shared usage increment — called once per question regardless of mode
  const incrementUsage = async () => {
    if (!user?.id || incrementInFlight.current) return
    incrementInFlight.current = true
    try {
      const session = await supabase.auth.getSession()
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
        if (!data.unlimited) {
          setRateLimitReached(true)
          setUsageInfo({ used: data.used || FREE_LIMITS.questionsPerDay, limit: data.limit || FREE_LIMITS.questionsPerDay, remaining: 0 })
        }
      } else if (data.used !== undefined && !data.unlimited) {
        setUsageInfo({
          used: data.used,
          limit: data.limit || FREE_LIMITS.questionsPerDay,
          remaining: data.remaining || 0,
        })
        if (data.remaining !== null && data.remaining <= 0) {
          setRateLimitReached(true)
        }
        // Show smart upsell modal at threshold — once per session
        if (!upsellDismissed && data.used >= FREE_LIMITS.upsellWallAt && !data.unlimited) {
          setShowUpsellModal(true)
        }
      }
    } catch (err) {
      console.error('[Quiz] Failed to increment usage:', err)
    } finally {
      incrementInFlight.current = false
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    if (current < quizData.questions.length - 1) {
      setCurrent(current + 1)
      setShowExplanation(false)
      setIsFlipped(false)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
      setShowExplanation(false)
      setIsFlipped(false)
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

  const handleCheckAnswer = () => {
    setShowExplanation(true)
  }

  const selectAnswer = async (idx: number) => {
    if (rateLimitReached) return
    if ((mode === 'practice' || mode === 'homework') && showExplanation) return
    const isFirstAnswer = !hasAnswered

    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)

    // Show micro-feedback animation on first answer
    if (isFirstAnswer) {
      setAnswerFeedback(idx === q.correct_answer ? 'correct' : 'wrong')
      setTimeout(() => setAnswerFeedback(null), 600)

      supabase.from('question_attempts').insert({
        user_id: user?.id ?? null,
        question_id: q.id,
        cert: 'crcst',
        was_correct: idx === q.correct_answer,
        selected_answer: String.fromCharCode(65 + idx).toLowerCase(),
      }).then(() => {})

      await incrementUsage()
    }
  }

  // Compute session stats for upsell modal
  const sessionAnswered = answers.filter((a) => a !== null).length
  const sessionCorrect  = answers.filter((a, i) => a !== null && a === quizData.questions[i]?.correct_answer).length
  const weakDomains = Array.from(
    new Set(
      answers
        .map((a, i) => (a !== null && a !== quizData.questions[i]?.correct_answer ? quizData.questions[i]?.domain : null))
        .filter(Boolean) as string[]
    )
  )

  // Smart upsell modal — fires mid-session at question 10
  if (showUpsellModal && !rateLimitReached) {
    return (
      <SmartUpsellModal
        isOpen
        onContinueFree={() => {
          setShowUpsellModal(false)
          setUpsellDismissed(true)
        }}
        sessionStats={{
          questionsAnswered: sessionAnswered,
          correctCount: sessionCorrect,
          weakDomains,
        }}
        dailyLimit={FREE_LIMITS.questionsPerDay}
        upsellAt={FREE_LIMITS.upsellWallAt}
      />
    )
  }

  // Hard rate limit screen — daily cap exhausted
  if (rateLimitReached) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6">
        <div className="text-6xl mb-6">&#128683;</div>
        <h2 className="font-serif text-2xl text-navy mb-4">
          Daily Limit Reached
        </h2>
        <p className="text-text-3 mb-6">
          You&apos;ve used all {usageInfo?.limit || FREE_LIMITS.questionsPerDay} free questions for today.
          Your limit resets at midnight, or upgrade to Pro for unlimited access.
        </p>

        {usageInfo && (
          <div className="bg-cream rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-3">Questions used today</span>
              <span className="text-navy font-mono">{usageInfo.used}/{usageInfo.limit}</span>
            </div>
            <div className="w-full h-2 bg-cream-2 rounded-full overflow-hidden">
              <div className="h-full bg-wrong" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {weakDomains.length > 0 && (
          <div className="bg-cream rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-text-3 font-mono uppercase tracking-wider mb-2">Weak spots this session</p>
            <div className="flex flex-wrap gap-2">
              {weakDomains.slice(0, 4).map((d) => (
                <span key={d} className="text-xs bg-wrong-bg border border-wrong/20 text-wrong rounded-full px-2.5 py-1">
                  {d}
                </span>
              ))}
            </div>
            <p className="text-xs text-text-3 mt-2">Pro tracks these across all your sessions and shows you exactly what to review.</p>
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
                  newAnswers[current] = -1
                  setAnswers(newAnswers)
                  await incrementUsage()
                }}
                disabled={rateLimitReached}
                className="flex-1 px-4 py-3 bg-wrong-bg border-2 border-wrong text-wrong rounded-lg font-mono text-sm hover:bg-wrong/20 transition disabled:opacity-50 active:scale-95"
              >
                ✗ Didn't Know
              </button>
              <button
                onClick={async () => {
                  if (rateLimitReached) return
                  const newAnswers = [...answers]
                  newAnswers[current] = q.correct_answer
                  setAnswers(newAnswers)
                  await incrementUsage()
                }}
                disabled={rateLimitReached}
                className="flex-1 px-4 py-3 bg-correct-bg border-2 border-correct text-correct rounded-lg font-mono text-sm hover:bg-correct/20 transition disabled:opacity-50 active:scale-95"
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

  // Quiz mode (practice, custom, quiz, test, homework)
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
        {(mode === 'quiz' || mode === 'test') && (
          <div className={`mx-4 font-mono text-sm ${timeLeft < 300 ? 'text-wrong' : 'text-amber'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
        {onPause && user && mode !== 'test' && (
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

      {/* Low-usage warning for free tier */}
      {usageInfo && !rateLimitReached && !showUpsellModal && usageInfo.remaining <= 5 && usageInfo.remaining > 0 && (
        <div className={`mx-6 mt-3 px-4 py-2.5 rounded-lg flex items-center justify-between gap-3 fadeUp ${
          usageInfo.remaining <= 2
            ? 'bg-wrong-bg border border-wrong/40'
            : 'bg-amber/10 border border-amber/40'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className={`font-mono text-xs font-semibold ${
              usageInfo.remaining <= 2 ? 'text-wrong' : 'text-amber'
            }`}>
              {usageInfo.remaining} free question{usageInfo.remaining !== 1 ? 's' : ''} left today
            </span>
          </div>
          <a
            href="/pricing"
            className="shrink-0 px-3 py-1 bg-teal text-white rounded-md font-mono text-xs hover:bg-teal-2 transition"
          >
            Go Unlimited
          </a>
        </div>
      )}

      {/* Question */}
      <div className="px-6 py-8">
        <div className="text-xs text-teal tracking-widest mb-2">
          {q.domain} • {q.difficulty}
        </div>
        <div className="font-serif text-xl text-navy mb-6 leading-relaxed">
          {q.question}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {q.options.map((opt, idx) => {
            let optionClass =
              'w-full text-left px-4 py-3 rounded-lg border-2 transition-all font-mono text-sm active:scale-[0.98]'

            const isSelected = answers[current] === idx
            const practiceReveal = (mode === 'practice' || mode === 'homework') && showExplanation

            if (practiceReveal) {
              if (idx === q.correct_answer) {
                optionClass += ' border-correct bg-correct-bg text-correct'
                if (isSelected) optionClass += ' correct-pop'
              } else if (isSelected && idx !== q.correct_answer) {
                optionClass += ' border-wrong bg-wrong-bg text-wrong shake'
              } else {
                optionClass += ' border-cream-2 text-text-3'
              }
            } else {
              if (isSelected) {
                optionClass += ' border-teal bg-teal/10 text-navy'
                if (answerFeedback === 'correct') optionClass += ' correct-pop'
                if (answerFeedback === 'wrong') optionClass += ' shake'
              } else {
                optionClass += ' border-cream-2 hover:border-teal hover:shadow-sm text-text'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                disabled={practiceReveal}
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

        {/* Check Answer button (practice/homework mode, after selecting but before confirming) */}
        {(mode === 'practice' || mode === 'homework') && hasAnswered && !showExplanation && (
          <button
            onClick={handleCheckAnswer}
            className="w-full py-3 px-6 rounded-lg bg-navy text-white font-mono text-sm tracking-wider uppercase hover:bg-navy-2 transition mb-6"
          >
            Check Answer
          </button>
        )}

        {/* Explanation (practice/homework mode) */}
        {(mode === 'practice' || mode === 'homework') && showExplanation && (
          <div
            className={`p-4 rounded-lg mb-6 fadeUp ${
              isCorrect ? 'bg-correct-bg border border-correct' : 'bg-wrong-bg border border-wrong'
            }`}
          >
            <div className="font-mono text-sm font-bold mb-2">
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <div className="text-sm leading-relaxed">{q.explanation}</div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="px-6 py-3 bg-cream-2 text-text rounded-lg font-mono disabled:opacity-50 hover:bg-cream transition"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={(mode === 'practice' || mode === 'homework') && !showExplanation}
            className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 disabled:opacity-50 transition"
          >
            {current === quizData.questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
