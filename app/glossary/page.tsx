'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { GLOSSARY, GLOSSARY_CATEGORIES, type GlossaryTerm } from '@/lib/glossary'

const CATEGORY_COLORS: Record<string, string> = {
  'Standards & Regulations': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Sterilization': 'bg-teal/20 text-teal border-teal/30',
  'Decontamination': 'bg-amber/20 text-amber border-amber/30',
  'Microbiology': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Instruments & Equipment': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Quality & Safety': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Anatomy & Medical Terms': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

function TermCard({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border border-cream-2 rounded-xl overflow-hidden transition hover:border-teal cursor-pointer"
      onClick={() => setOpen((o: boolean) => !o)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono font-bold text-navy text-sm truncate">{term.term}</span>
          {term.abbr && (
            <span className="hidden sm:block text-xs text-text-3 truncate">— {term.abbr}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`hidden sm:inline-block text-xs px-2 py-0.5 rounded-full border font-mono ${CATEGORY_COLORS[term.category] ?? ''}`}>
            {term.category}
          </span>
          <span className="text-text-3 text-lg leading-none">{open ? '−' : '+'}</span>
        </div>
      </div>
      {open && (
        <div className="px-5 pb-4 pt-0 border-t border-cream-2">
          {term.abbr && (
            <div className="text-xs text-text-3 font-mono mb-2">{term.abbr}</div>
          )}
          <p className="text-sm text-text leading-relaxed">{term.definition}</p>
          <div className={`mt-3 inline-block text-xs px-2 py-0.5 rounded-full border font-mono sm:hidden ${CATEGORY_COLORS[term.category] ?? ''}`}>
            {term.category}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GlossaryPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return GLOSSARY.filter(t => {
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory
      const matchesSearch = !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q) || (t.abbr?.toLowerCase().includes(q) ?? false)
      return matchesCategory && matchesSearch
    }).sort((a, b) => a.term.localeCompare(b.term))
  }, [search, activeCategory])

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-teal-3 hover:text-white transition text-sm font-mono">
            ← Dashboard
          </Link>
          <div className="font-serif text-lg font-bold">SPD Glossary</div>
          <div className="text-xs text-teal-3 font-mono">{GLOSSARY.length} terms</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-navy mb-2">
            Sterile Processing Glossary
          </h1>
          <p className="text-text-3 text-sm">
            Quick-reference definitions for acronyms and terms used throughout certification exams and SPD practice.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search terms, acronyms, definitions…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-2 bg-white font-mono text-sm focus:outline-none focus:border-teal text-navy placeholder:text-text-3"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', ...GLOSSARY_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition border ${
                activeCategory === cat
                  ? 'bg-teal text-white border-teal'
                  : 'bg-white text-text-3 border-cream-2 hover:border-teal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Term count */}
        <div className="text-xs text-text-3 font-mono mb-4">
          {filtered.length} {filtered.length === 1 ? 'term' : 'terms'} shown
        </div>

        {/* Terms */}
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((term: GlossaryTerm) => (
              <TermCard key={term.term} term={term} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-3 font-mono text-sm">
            No terms match &ldquo;{search}&rdquo;
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-xs text-text-3 text-center">
          Definitions are based on AAMI, CDC, OSHA, and HSPA published standards.
        </div>
      </div>
    </div>
  )
}
