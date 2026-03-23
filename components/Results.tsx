'use client'

interface ResultsProps {
  results: {
    correct: number
    total: number
    percentage: number
    elapsed: number
    mode: string
    answers?: (number | null)[]
    questions?: any[]
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
    </div>
  )
}

function DomainBreakdown({
  questions,
  answers,
}: {
  questions: any[]
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
