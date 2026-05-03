'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import InstrumentQuiz from '@/components/InstrumentQuiz'

const DOMAINS = ['Instrument ID', 'Endoscope ID'] as const
type Domain = (typeof DOMAINS)[number]

export default function InstrumentsPage() {
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null)

  return (
    <div className="min-h-screen bg-cream">
      <Header user={null} />
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Nav */}
        <Link
          href="/crcst"
          className="text-teal text-sm hover:text-teal-2 transition mb-6 inline-block"
        >
          ← Back to CRCST
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="text-xs tracking-widest text-text-3 mb-2">
            CRCST · INSTRUMENT IDENTIFICATION
          </div>
          <h1 className="font-serif text-3xl text-navy mb-2">
            Instrument ID Quiz
          </h1>
          <p className="text-sm text-text-3">
            Look at the photo and identify the surgical instrument. Builds visual
            recognition skills tested on the CRCST exam.
          </p>
        </div>

        {/* Domain filter pills */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveDomain(null)}
            className={`px-4 py-2 rounded-full text-xs font-mono transition ${
              activeDomain === null
                ? 'bg-teal text-white'
                : 'bg-cream-2 text-text hover:bg-teal/20'
            }`}
          >
            All
          </button>
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDomain(d)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition ${
                activeDomain === d
                  ? 'bg-teal text-white'
                  : 'bg-cream-2 text-text hover:bg-teal/20'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Quiz */}
        <InstrumentQuiz domain={activeDomain ?? undefined} />
      </div>
    </div>
  )
}
