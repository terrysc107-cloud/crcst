'use client'

import { useState } from 'react'
import type { Question } from '@/lib/questions'

interface ResultsProps {
  results: {
    correct: number
    total: number
    percentage: number
    elapsed: number
    mode: string
    answers?: (number | null)[]
    questions?: Question[]
  }
  onRetry: () => void
  onHome: () => void
}

export default function Results({ results, onRetry, onHome }: ResultsProps) {
  const getBadge = (pct: number) => {
    if (pct >= 90) return { emoji: '👑', name: 'Gold Badge', message: 'Outstanding! You\'re exam ready!' }
    if (pct >= 75) return { emoji: '🥈', name: 'Silver Badge', message: 'Great job! Almost there!' }
    if (pct >= 60) return { emoji: '🥉', name: 'Bronze Badge', message: 'Good progress! Keep studying!' }
    return { emoji: '⭐', name: 'Rising Star', message: 'Keep practicing, you\'ll get there!' }
  }

  const badge = getBadge(results.percentage)
  const mins = Math.floor(results.elapsed / 60)
  const secs = results.elapsed % 60
  const passed = results.percentage >= 70

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Badge */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-4 bounce-in">{badge.emoji}</div>
        <h2 className="font-serif text-3xl text-navy mb-2">{badge.name}</h2>
        <p className="text-sm text-text-3">{badge.message}</p>
      </div>

      {/* Score Card */}
      <div className="bg-white border-2 border-cream-2 rounded-xl p-8 mb-8 text-center shadow-lg">
        <div
          className={`font-serif text-6xl mb-2 ${
            passed ? 'text-correct' : 'text-wrong'
          }`}
        >
          {results.percentage}%
        </div>
        <div className="text-sm text-text-3 mb-6">
          {results.correct} of {results.total} correct
        </div>

        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="font-serif text-2xl text-navy">
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-text-3 uppercase tracking-wider">
              Time
            </div>
          </div>
          <div className="w-px bg-cream-2" />
          <div>
            <div className="font-serif text-2xl text-navy capitalize">
              {results.mode}
            </div>
            <div className="text-xs text-text-3 uppercase tracking-wider">
              Mode
            </div>
          </div>
        </div>
      </div>

      {/* Pass/Fail Banner */}
      <div
        className={`rounded-lg p-4 mb-8 text-center ${
          passed
            ? 'bg-correct-bg border border-correct text-correct'
            : 'bg-wrong-bg border border-wrong text-wrong'
        }`}
      >
        <div className="font-serif text-lg font-bold">
          {passed ? '🎉 You Passed!' : 'Keep Practicing'}
        </div>
        <div className="text-sm mt-1">
          {passed
            ? 'Great work! You\'re on track for certification.'
            : 'The passing score is 70%. Review the material and try again.'}
        </div>
      </div>

      {/* Resume Service Banner — shown only on passing score */}
      {passed && (
        <div className="rounded-lg px-4 py-3 mb-6 flex items-center gap-3" style={{ background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(20,189,172,0.35)' }}>
          <span className="text-xl flex-shrink-0">📄</span>
          <p className="text-sm text-text leading-snug flex-1">
            Great score! Make sure your resume reflects your expertise.{' '}
            <a
              href="https://www.myqualifiedresume.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal underline underline-offset-2 font-medium hover:opacity-80 transition"
            >
              Get a professional resume in 48 hours →
            </a>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 bg-teal text-white py-4 rounded-lg font-mono text-sm tracking-widest hover:bg-teal-2 transition"
        >
          RETAKE QUIZ
        </button>
        <button
          onClick={onHome}
          className="flex-1 bg-cream-2 text-text py-4 rounded-lg font-mono text-sm tracking-widest hover:bg-cream transition"
        >
          BACK HOME
        </button>
      </div>

      {/* Domain Breakdown (if available) */}
      {results.questions && results.answers && (
        <div className="mt-8">
          <h3 className="font-serif text-lg text-navy mb-4">
            Domain Performance
          </h3>
          <DomainBreakdown
            questions={results.questions}
            answers={results.answers}
          />
        </div>
      )}

      {/* Missed Questions Review */}
      {results.questions && results.answers && (
        <MissedQuestionsReview
          questions={results.questions}
          answers={results.answers}
        />
      )}
    </div>
  )
}

function MissedQuestionsReview({
  questions,
  answers,
}: {
  questions: Question[]
  answers: (number | null)[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const missed = questions
    .map((q, i) => ({ q, i, selected: answers[i] }))
    .filter(({ q, selected }) => selected !== q.correct_answer)

  if (missed.length === 0) {
    return (
      <div className="mt-8 p-6 bg-correct-bg border border-correct rounded-xl text-center">
        <div className="font-serif text-lg text-correct mb-1">Perfect Score!</div>
        <div className="text-sm text-text-3">You answered every question correctly. Nothing to review.</div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-navy">Review Missed Questions</h3>
        <span className="text-xs font-mono bg-wrong-bg border border-wrong text-wrong px-3 py-1 rounded-full">
          {missed.length} {missed.length === 1 ? 'question' : 'questions'} to review
        </span>
      </div>

      <div className="space-y-3">
        {missed.map(({ q, i, selected }, reviewIdx) => {
          const isOpen = openIndex === reviewIdx
          const selectedLabel =
            selected !== null && selected >= 0
              ? String.fromCharCode(65 + selected)
              : null

          return (
            <div
              key={i}
              className="bg-white border-2 border-cream-2 rounded-xl overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : reviewIdx)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-cream/40 transition"
              >
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-wrong-bg border border-wrong text-wrong text-xs flex items-center justify-center font-mono">
                  ✗
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-teal tracking-widest mb-1">
                    Q{i + 1} · {q.domain} · {q.difficulty}
                  </div>
                  <div className="font-serif text-sm text-navy leading-snug">
                    {q.question}
                  </div>
                </div>
                <span className="flex-shrink-0 text-text-3 text-sm ml-2 mt-1">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="border-t border-cream-2 px-5 py-4 space-y-3">
                  {/* All answer options */}
                  <div className="space-y-2">
                    {q.options.map((opt: string, idx: number) => {
                      const letter = String.fromCharCode(65 + idx)
                      const isCorrect = idx === q.correct_answer
                      const isSelected = idx === selected

                      let cls = 'flex items-start gap-3 px-3 py-2.5 rounded-lg border text-sm'
                      if (isCorrect) {
                        cls += ' border-correct bg-correct-bg text-correct'
                      } else if (isSelected) {
                        cls += ' border-wrong bg-wrong-bg text-wrong'
                      } else {
                        cls += ' border-cream-2 text-text-3'
                      }

                      return (
                        <div key={idx} className={cls}>
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/60 border border-current text-center text-xs leading-5 font-mono">
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                          {isCorrect && (
                            <span className="flex-shrink-0 text-xs font-mono font-bold">Correct</span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="flex-shrink-0 text-xs font-mono font-bold">Your answer</span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-navy/5 border border-navy/10 rounded-lg px-4 py-3">
                    <div className="text-xs font-mono text-teal tracking-widest mb-1">EXPLANATION</div>
                    <div className="text-sm text-text leading-relaxed">{q.explanation}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DomainBreakdown({
  questions,
  answers,
}: {
  questions: Question[]
  answers: (number | null)[]
}) {
  // Calculate per-domain scores
  const domainScores: Record<string, { correct: number; total: number }> = {}

  questions.forEach((q, i) => {
    if (!domainScores[q.domain]) {
      domainScores[q.domain] = { correct: 0, total: 0 }
    }
    domainScores[q.domain].total++
    if (answers[i] === q.correct_answer) {
      domainScores[q.domain].correct++
    }
  })

  return (
    <div className="space-y-3">
      {Object.entries(domainScores).map(([domain, scores]) => {
        const pct = Math.round((scores.correct / scores.total) * 100)
        return (
          <div
            key={domain}
            className="bg-white rounded-lg p-4 border border-cream-2"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-serif text-sm text-navy">{domain}</div>
              <div className="text-xs text-text-3">
                {scores.correct}/{scores.total} ({pct}%)
              </div>
            </div>
            <div className="w-full h-2 bg-cream-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct >= 70 ? 'bg-correct' : pct >= 50 ? 'bg-amber' : 'bg-wrong'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
