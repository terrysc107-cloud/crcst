'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InstrumentImage {
  id: string
  label: string
  domain: string
  image_url: string
  license: string
  author: string | null
}

interface QuizQuestion {
  image: InstrumentImage
  options: string[]    // 4 labels, one correct
  correctIndex: number
}

interface Props {
  images: InstrumentImage[]
  onSessionEnd?: (score: number, total: number) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(images: InstrumentImage[], count = 10): QuizQuestion[] {
  const allLabels = [...new Set(images.map((img) => img.label))]
  const pool = shuffle(images).slice(0, count)

  return pool.map((image) => {
    const wrong = shuffle(allLabels.filter((l) => l !== image.label)).slice(0, 3)
    const options = shuffle([image.label, ...wrong])
    return { image, options, correctIndex: options.indexOf(image.label) }
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function InstrumentQuiz({ images, onSessionEnd }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const startSession = useCallback(() => {
    setQuestions(buildQuestions(images))
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }, [images])

  useEffect(() => {
    if (images.length >= 4) startSession()
  }, [images, startSession])

  if (images.length < 4) {
    return (
      <div className="text-center py-20 text-white/40 text-sm font-mono">
        Not enough instrument images loaded. Run the scraper to populate images.
      </div>
    )
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="text-6xl mb-6">{pct >= 80 ? '🏆' : pct >= 60 ? '📈' : '📚'}</div>
        <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          {score} / {questions.length}
        </h2>
        <p className="text-white/55 text-sm mb-8">
          {pct >= 80 ? 'Excellent instrument recognition!' : pct >= 60 ? 'Good — keep drilling the ones you missed.' : 'Keep practicing — instrument ID takes repetition.'}
        </p>
        <button
          onClick={startSession}
          className="px-8 py-3 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:-translate-y-0.5 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-2))' }}
        >
          Try Again →
        </button>
      </div>
    )
  }

  if (!questions.length) return null

  const q = questions[current]
  const isAnswered = selected !== null

  function handleSelect(idx: number) {
    if (isAnswered) return
    setSelected(idx)
    if (idx === q.correctIndex) setScore((s) => s + 1)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      onSessionEnd?.(score + (selected === q.correctIndex ? 1 : 0), questions.length)
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-white/35 text-xs tracking-widest">
          {current + 1} / {questions.length}
        </span>
        <span className="font-mono text-teal text-xs tracking-wider">
          {score} correct
        </span>
      </div>

      {/* Instrument image */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-8">
        <Image
          src={q.image.image_url}
          alt="Identify this instrument"
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, 600px"
          unoptimized
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {q.options.map((opt, idx) => {
          let cls = 'bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:border-white/20'
          if (isAnswered) {
            if (idx === q.correctIndex) cls = 'bg-teal/15 border-teal/50 text-teal'
            else if (idx === selected) cls = 'bg-red-500/15 border-red-500/40 text-red-400'
            else cls = 'bg-white/[0.02] border-white/6 text-white/35'
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-left transition-all ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback + next */}
      {isAnswered && (
        <div className="space-y-4">
          <div className={`rounded-xl px-4 py-3 text-sm border ${selected === q.correctIndex ? 'bg-teal/10 border-teal/30 text-teal' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {selected === q.correctIndex
              ? `✓ Correct — ${q.image.label}`
              : `✗ That's a ${q.image.label}`}
          </div>
          {q.image.author && (
            <p className="text-white/20 text-[0.65rem] font-mono text-center">
              Image: {q.image.author} · {q.image.license}
            </p>
          )}
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-2))' }}
          >
            {current + 1 >= questions.length ? 'See Results →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  )
}
