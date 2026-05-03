'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { getSupabase } from '@/lib/supabase'

interface InstrumentImage {
  id: string
  name: string
  category: string
  domain: string
  storage_key: string
  attribution: string | null
}

interface QuizQuestion {
  image: InstrumentImage
  imageUrl: string
  options: string[]
  correctIndex: number
}

interface Props {
  domain?: string
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function InstrumentQuiz({ domain }: Props) {
  const [instruments, setInstruments] = useState<InstrumentImage[]>([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const fetchInstruments = useCallback(async () => {
    let query = getSupabase().from('instrument_images').select('*').eq('active', true)
    if (domain) query = query.eq('domain', domain)
    const { data, error } = await query
    if (!error && data) setInstruments(data)
    setLoading(false)
  }, [domain])

  useEffect(() => { fetchInstruments() }, [fetchInstruments])

  const buildQuestion = useCallback(async (pool: InstrumentImage[]) => {
    if (pool.length < 4) return

    const correct = pool[Math.floor(Math.random() * pool.length)]
    const distractors = shuffle(pool.filter((i) => i.name !== correct.name)).slice(0, 3)
    const options = shuffle([correct, ...distractors]).map((i) => i.name)
    const correctIndex = options.indexOf(correct.name)

    const { data } = await getSupabase().storage
      .from('instruments')
      .createSignedUrl(correct.storage_key, 3600)

    if (!data?.signedUrl) return

    setQuestion({ image: correct, imageUrl: data.signedUrl, options, correctIndex })
    setSelected(null)
  }, [])

  useEffect(() => {
    if (instruments.length >= 4) buildQuestion(instruments)
  }, [instruments, buildQuestion])

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setScore((s: { correct: number; total: number }) => ({
      correct: s.correct + (idx === question!.correctIndex ? 1 : 0),
      total: s.total + 1,
    }))
  }

  const next = () => buildQuestion(instruments)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-text-3 text-sm">
        Loading instruments…
      </div>
    )
  }

  if (instruments.length < 4) {
    return (
      <div className="bg-white border border-cream-2 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🔬</div>
        <h3 className="font-serif text-navy text-xl mb-2">No images found</h3>
        <p className="text-sm text-text-3 mb-6">
          The instrument image database isn&apos;t seeded yet. Follow the steps below to
          set it up.
        </p>
        <ol className="text-left text-sm text-text-3 space-y-2 max-w-sm mx-auto">
          <li>1. Run the SQL in <code className="font-mono text-teal">scripts/create-instrument-images-table.sql</code></li>
          <li>2. Create a public Supabase Storage bucket named <code className="font-mono text-teal">instruments</code></li>
          <li>3. Run <code className="font-mono text-teal">npx tsx scripts/scrape-instrument-images.ts</code></li>
          <li>4. Run <code className="font-mono text-teal">npx tsx scripts/seed-instrument-images.ts</code></li>
        </ol>
      </div>
    )
  }

  if (!question) return null

  const correct = selected !== null && selected === question.correctIndex

  return (
    <div className="space-y-6">
      {/* Score banner */}
      {score.total > 0 && (
        <div className="flex items-center justify-between bg-navy text-white rounded-lg px-5 py-3">
          <span className="text-xs tracking-widest text-teal-3">SESSION SCORE</span>
          <span className="font-serif text-2xl text-amber">
            {score.correct}/{score.total}
          </span>
          <span className="text-xs text-navy-3">
            {Math.round((score.correct / score.total) * 100)}%
          </span>
        </div>
      )}

      {/* Image card */}
      <div className="bg-white border border-cream-2 rounded-xl overflow-hidden">
        <div className="relative w-full h-64 bg-cream">
          <Image
            src={question.imageUrl}
            alt="Identify this instrument"
            fill
            className="object-contain p-4"
            unoptimized
          />
        </div>
        {question.image.attribution && (
          <p className="text-[10px] text-text-3 px-4 py-1 border-t border-cream-2 truncate">
            {question.image.attribution}
          </p>
        )}
      </div>

      {/* Question stem */}
      <p className="font-serif text-lg text-navy text-center">
        What instrument is shown above?
      </p>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt: string, idx: number) => {
          const isCorrect = idx === question.correctIndex
          const isSelected = idx === selected

          let cls =
            'w-full rounded-lg border-2 px-4 py-3 text-sm font-mono text-left transition '

          if (selected === null) {
            cls += 'border-cream-2 bg-white hover:border-teal hover:shadow-md cursor-pointer'
          } else if (isCorrect) {
            cls += 'border-teal bg-teal/10 text-teal font-bold'
          } else if (isSelected && !isCorrect) {
            cls += 'border-wrong bg-wrong/10 text-wrong'
          } else {
            cls += 'border-cream-2 bg-cream text-text-3 cursor-default'
          }

          return (
            <button key={idx} onClick={() => handleAnswer(idx)} className={cls}>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {selected !== null && (
        <div className="space-y-3">
          <div
            className={`rounded-lg px-5 py-3 text-sm font-mono text-center ${
              correct ? 'bg-teal/10 text-teal' : 'bg-wrong/10 text-wrong'
            }`}
          >
            {correct
              ? `Correct! That's a ${question.image.name}.`
              : `Incorrect. The correct answer is: ${question.image.name}.`}
          </div>
          <button
            onClick={next}
            className="w-full bg-teal text-white py-3 rounded-lg font-mono text-sm tracking-widest hover:bg-teal-2 transition"
          >
            NEXT INSTRUMENT
          </button>
        </div>
      )}
    </div>
  )
}
