'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { QUESTIONS } from '@/lib/questions'
import {
  ArrowLeft, Sparkles, ChevronDown, ChevronUp, Check, X,
  Copy, RefreshCw, AlertCircle, BookOpen
} from 'lucide-react'

type VariantType = 'direct' | 'inverse' | 'application' | 'scenario' | 'distractor_swap'

interface GeneratedVariant {
  variant_type: VariantType
  stem: string
  options: string[]
  correct_index: number
  explanation: string
  status: 'pending' | 'approved' | 'rejected'
}

const VARIANT_LABELS: Record<VariantType, { label: string; color: string; description: string }> = {
  direct:         { label: 'Direct',         color: 'bg-blue-900/40 border-blue-700',   description: 'Standard phrasing — "The suffix -ectomy means: …"' },
  inverse:        { label: 'Inverse',         color: 'bg-teal-900/40 border-teal-700',   description: 'Ask for the term — "Which suffix indicates surgical removal?"' },
  application:    { label: 'Application',     color: 'bg-green-900/40 border-green-700', description: 'Real instrument/procedure — "A cholecystectomy removes the: …"' },
  scenario:       { label: 'Scenario',         color: 'bg-purple-900/40 border-purple-700', description: 'Patient/workplace context — "A patient is scheduled for appendectomy…"' },
  distractor_swap:{ label: 'Distractor Swap', color: 'bg-amber-900/40 border-amber-700',  description: 'Same stem + answer, all new wrong options' },
}

const ALL_VARIANT_TYPES: VariantType[] = ['direct', 'inverse', 'application', 'scenario', 'distractor_swap']

export default function VariantWorkshopPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Source question selection
  const [search, setSearch] = useState('')
  const [selectedQ, setSelectedQ] = useState<typeof QUESTIONS[0] | null>(null)
  const [concept, setConcept] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<VariantType[]>(ALL_VARIANT_TYPES)
  const [certType, setCertType] = useState<'CRCST' | 'CHL' | 'CER' | 'SJT'>('CRCST')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [variants, setVariants] = useState<GeneratedVariant[]>([])
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/'); return }
      setToken(session.access_token)
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  const filteredQuestions = QUESTIONS.filter((q) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return q.question.toLowerCase().includes(s) || q.domain.toLowerCase().includes(s) || q.id.includes(s)
  }).slice(0, 30)

  function toggleType(t: VariantType) {
    setSelectedTypes((prev: VariantType[]) =>
      prev.includes(t) ? prev.filter((x: VariantType) => x !== t) : [...prev, t]
    )
  }

  async function generate() {
    if (!selectedQ || !concept.trim() || selectedTypes.length === 0) return
    setGenerating(true)
    setError('')
    setVariants([])

    try {
      const res = await fetch('/api/admin/generate-variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceQuestion: selectedQ,
          concept: concept.trim(),
          variantTypes: selectedTypes,
          certType,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Generation failed.')
        return
      }

      setVariants(
        (data.variants as Omit<GeneratedVariant, 'status'>[]).map((v) => ({ ...v, status: 'pending' }))
      )
      setExpandedIdx(0)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setGenerating(false)
    }
  }

  function setStatus(idx: number, status: 'approved' | 'rejected') {
    setVariants((prev: GeneratedVariant[]) => prev.map((v: GeneratedVariant, i: number) => i === idx ? { ...v, status } : v))
  }

  function copyAll() {
    const approved = variants.filter((v: GeneratedVariant) => v.status === 'approved')
    navigator.clipboard.writeText(JSON.stringify(approved, null, 2))
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-slate-400 text-sm">
        Checking access…
      </div>
    )
  }

  const approvedCount = variants.filter((v) => v.status === 'approved').length

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-4">
        <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-7 h-7 rounded-lg bg-purple-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Variant Workshop</h1>
          <p className="text-xs text-slate-500">Generate & review AI question variants</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* LEFT: Config panel */}
        <div className="space-y-6">
          {/* Step 1: Source question */}
          <Section label="1. Pick a source question">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword or domain…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-600"
            />
            <div className="mt-2 max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {filteredQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQ(q)
                    setCertType('CRCST')
                    setConcept('')
                    setVariants([])
                  }}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-all ${
                    selectedQ?.id === q.id
                      ? 'border-teal-600 bg-teal-900/30 text-slate-200'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  <span className="font-mono text-slate-600 mr-2">#{q.id}</span>
                  <span className="line-clamp-1">{q.question}</span>
                  <span className="block text-slate-600 mt-0.5">{q.domain} · {q.difficulty}</span>
                </button>
              ))}
              {filteredQuestions.length === 0 && (
                <p className="text-xs text-slate-600 py-4 text-center">No questions match.</p>
              )}
            </div>
          </Section>

          {/* Step 2: Concept summary */}
          <Section label="2. Concept summary (the learning objective)">
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. The suffix -ectomy means surgical removal (appendectomy, cholecystectomy, tonsillectomy)."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-600 resize-none"
            />
            {selectedQ && !concept && (
              <button
                onClick={() => setConcept(selectedQ.explanation)}
                className="text-xs text-teal-500 hover:text-teal-300 mt-1 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Use source explanation as concept
              </button>
            )}
          </Section>

          {/* Step 3: Variant types */}
          <Section label="3. Variant types to generate">
            <div className="space-y-2">
              {ALL_VARIANT_TYPES.map((t) => {
                const meta = VARIANT_LABELS[t]
                const on = selectedTypes.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                      on ? `${meta.color} text-slate-200` : 'border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${on ? 'bg-teal-600 border-teal-500' : 'border-slate-600'}`}>
                        {on && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-semibold">{meta.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-6 leading-tight">{meta.description}</p>
                  </button>
                )
              })}
            </div>
          </Section>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={!selectedQ || !concept.trim() || selectedTypes.length === 0 || generating}
            className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {selectedTypes.length} variant{selectedTypes.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-800 rounded-lg px-3 py-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* RIGHT: Results */}
        <div className="space-y-4">
          {/* Source preview */}
          {selectedQ && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Source Question</div>
              <p className="text-sm font-medium text-slate-200 mb-3">{selectedQ.question}</p>
              <ul className="space-y-1">
                {selectedQ.options.map((opt, i) => (
                  <li key={i} className={`text-xs px-2 py-1 rounded ${i === selectedQ.correct_answer ? 'bg-teal-900/40 text-teal-300 border border-teal-800' : 'text-slate-500'}`}>
                    {i === selectedQ.correct_answer ? '✓ ' : '  '}{opt}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-600 mt-3 italic">{selectedQ.explanation}</p>
            </div>
          )}

          {/* Generated variants */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">
                  {variants.length} variant{variants.length !== 1 ? 's' : ''} generated
                  {approvedCount > 0 && (
                    <span className="ml-2 text-teal-400 text-xs">({approvedCount} approved)</span>
                  )}
                </h2>
                {approvedCount > 0 && (
                  <button
                    onClick={copyAll}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy approved JSON
                  </button>
                )}
              </div>

              {variants.map((v, idx) => {
                const meta = VARIANT_LABELS[v.variant_type]
                const expanded = expandedIdx === idx
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border transition-all ${
                      v.status === 'approved' ? 'border-teal-700 bg-teal-900/20' :
                      v.status === 'rejected' ? 'border-slate-800 bg-slate-900/20 opacity-50' :
                      `${meta.color} bg-opacity-50`
                    }`}
                  >
                    {/* Collapsed header */}
                    <button
                      onClick={() => setExpandedIdx(expanded ? null : idx)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="flex-1 text-sm text-slate-200 line-clamp-1">{v.stem}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {v.status === 'approved' && <Check className="w-4 h-4 text-teal-400" />}
                        {v.status === 'rejected' && <X className="w-4 h-4 text-red-500" />}
                        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </button>

                    {/* Expanded body */}
                    {expanded && (
                      <div className="px-4 pb-4 space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-200 mb-2">{v.stem}</p>
                          <ul className="space-y-1.5">
                            {v.options.map((opt, i) => (
                              <li
                                key={i}
                                className={`text-sm px-3 py-2 rounded-lg ${
                                  i === v.correct_index
                                    ? 'bg-teal-900/50 text-teal-300 border border-teal-700'
                                    : 'bg-slate-800/60 text-slate-400 border border-slate-700'
                                }`}
                              >
                                <span className="font-mono text-xs text-slate-600 mr-2">{String.fromCharCode(65 + i)}.</span>
                                {opt}
                                {i === v.correct_index && <span className="ml-2 text-xs text-teal-500">✓ correct</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2">
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Explanation</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{v.explanation}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setStatus(idx, 'approved')}
                            disabled={v.status === 'approved'}
                            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setStatus(idx, 'rejected')}
                            disabled={v.status === 'rejected'}
                            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => {
                              const text = `${v.stem}\n\n${v.options.map((o, i) => `${String.fromCharCode(65+i)}. ${o}`).join('\n')}\n\nCorrect: ${String.fromCharCode(65+v.correct_index)}\n\nExplanation: ${v.explanation}`
                              navigator.clipboard.writeText(text)
                            }}
                            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Instructions after generation */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-500">Next steps:</strong> Review each variant for medical accuracy,
                  approve the good ones, then copy the JSON to add to your question bank.
                  Always have an SME verify before activating in the live quiz engine.
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {variants.length === 0 && !generating && !error && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a source question, define the concept, choose variant types, then generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</h3>
      {children}
    </div>
  )
}
