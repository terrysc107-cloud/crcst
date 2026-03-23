'use client'

import { useState, useEffect } from 'react'
import type { Question } from '@/lib/questions'
import { supabase } from '@/lib/supabase'

interface QuizData {
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  startTime: number
}

interface QuizProps {
  quizData: QuizData
  mode: 'practice' | 'flashcards' | 'mock' | 'custom'
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
  const [timeLeft, setTimeLeft] = useState(mode === 'mock' ? 50 * 60 : 0) // 50 minutes for mock
  const [isPausing, setIsPausing] = useState(false)
  const [pauseSaved, setPauseSaved] = useState(false)

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

  const selectAnswer = (idx: number) => {
    if (mode === 'mock' && hasAnswered) return // No changing answers in mock mode
    const newAnswers = [...answers]
    newAnswers[current] = idx
    setAnswers(newAnswers)

    // Silent question attempts tracking
    supabase.from('question_attempts').insert({
      user_id: user?.id ?? null,
      question_id: q.id,
      cert: 'crcst',
      was_correct: idx === q.correct_answer,
      selected_answer: String.fromCharCode(65 + idx).toLowerCase(),
    }).then(() => {})

    if (mode === 'practice') {
      setShowExplanation(true)
    }
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
                onClick={() => {
                  const newAnswers = [...answers]
                  newAnswers[current] = -1 // Mark as "didn't know"
                  setAnswers(newAnswers)
                }}
                className="flex-1 px-4 py-3 bg-wrong-bg border-2 border-wrong text-wrong rounded-lg font-mono text-sm hover:bg-wrong/20 transition"
              >
                ✗ Didn't Know
              </button>
              <button
                onClick={() => {
                  const newAnswers = [...answers]
                  newAnswers[current] = q.correct_answer // Mark as "knew it"
                  setAnswers(newAnswers)
                }}
                className="flex-1 px-4 py-3 bg-correct-bg border-2 border-correct text-correct rounded-lg font-mono text-sm hover:bg-correct/20 transition"
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
              'w-full text-left px-4 py-3 rounded-lg border-2 transition font-mono text-sm'

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

        {/* Explanation (practice mode only) */}
        {mode === 'practice' && showExplanation && (
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
            disabled={mode === 'practice' && !showExplanation && !hasAnswered}
            className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 disabled:opacity-50 transition"
          >
            {current === quizData.questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
