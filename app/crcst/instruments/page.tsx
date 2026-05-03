'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import InstrumentQuiz, { type InstrumentImage } from '@/components/InstrumentQuiz'

// ── Category filter pills ─────────────────────────────────────────────────────

const DOMAINS = ['All', 'Instrument Identification', 'Endoscope Identification']

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InstrumentIdPage() {
  const [images, setImages] = useState<InstrumentImage[]>([])
  const [loading, setLoading] = useState(true)
  const [domain, setDomain] = useState('Instrument Identification')
  const [sessionScore, setSessionScore] = useState<{ score: number; total: number } | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const query = supabase
        .from('instrument_images')
        .select('id, label, domain, image_url, license, author')
        .eq('is_active', true)

      if (domain !== 'All') query.eq('domain', domain)

      const { data, error } = await query
      if (error) console.error(error)
      setImages(data ?? [])
      setLoading(false)
    }
    load()
  }, [domain])

  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: 'var(--font-dm-sans)' }}>

      {/* Nav */}
      <nav className="px-6 py-4 border-b border-white/7 flex items-center justify-between">
        <Link href="/cer" className="font-serif text-lg font-bold text-white hover:text-teal transition-colors">
          SPD Cert <em className="not-italic text-teal">Prep</em>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/crcst" className="text-white/60 text-sm hover:text-white transition-colors hidden sm:inline">
            ← CRCST Quiz
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-2))' }}
          >
            Go Pro
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-2xl mx-auto px-4 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber inline-block" />
          <span className="font-mono text-amber text-[0.7rem] font-semibold tracking-widest">INSTRUMENT IDENTIFICATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Name That Instrument
        </h1>
        <p className="text-white/55 text-base leading-relaxed max-w-lg mx-auto">
          Photo-based identification quiz. See the instrument, pick the name. Covers surgical instruments and endoscopes tested on the CER exam.
        </p>
      </section>

      {/* Domain filter */}
      <div className="flex justify-center gap-2 px-4 mb-10 flex-wrap">
        {DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => { setDomain(d); setSessionScore(null); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold font-mono tracking-wider transition-all border ${
              domain === d
                ? 'bg-teal/15 border-teal/50 text-teal'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Session result banner */}
      {sessionScore && (
        <div className="max-w-xl mx-auto px-4 mb-8">
          <div className="bg-teal/10 border border-teal/30 rounded-xl px-5 py-3 text-center text-sm text-teal font-mono">
            Last session: {sessionScore.score}/{sessionScore.total} ({Math.round((sessionScore.score / sessionScore.total) * 100)}%)
          </div>
        </div>
      )}

      {/* Quiz */}
      <main className="pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-teal border-t-transparent animate-spin" />
            <span className="text-white/40 text-sm font-mono">Loading images…</span>
          </div>
        ) : images.length < 4 ? (
          <div className="max-w-xl mx-auto px-4 text-center py-16">
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-10">
              <div className="text-4xl mb-4">🔬</div>
              <p className="text-white/60 text-sm mb-2">Instrument images not yet loaded.</p>
              <p className="text-white/35 text-xs mb-6 font-mono">
                Run <code className="bg-white/10 px-1.5 py-0.5 rounded">npx tsx scripts/scrape-instrument-images.ts</code> then seed the database.
              </p>
              <Link
                href="/crcst"
                className="inline-flex px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-lg shadow-teal/20 hover:-translate-y-0.5 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--teal), var(--teal-2))' }}
              >
                Back to CRCST Quiz →
              </Link>
            </div>
          </div>
        ) : (
          <InstrumentQuiz
            images={images}
            onSessionEnd={(score, total) => setSessionScore({ score, total })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/7 px-4 py-8 text-center">
        <p className="text-white/20 text-xs font-mono">
          © 2026 Scott Advisory Group · Aseptic Technical Solutions ·{' '}
          <Link href="/" className="hover:text-white/40 transition-colors">spdcertprep.com</Link>
        </p>
      </footer>
    </div>
  )
}
