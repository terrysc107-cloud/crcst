'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { QUESTIONS, type Question } from '@/lib/questions'

interface DomainStat {
  name: string
  correct: number
  total: number
  percentage: number
}

interface MockAttempt {
  id: string
  score: number
  total_questions: number
  percentage: number
  time_taken: number | null
  domains: DomainStat[]
  created_at: string
  answers?: (number | null)[]
  question_ids?: string[]
}

const PASS_THRESHOLD = 74

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Read-only replay of a completed mock attempt
function ReplayView({ attempt, onClose }: { attempt: MockAttempt; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const questionIds = attempt.question_ids ?? []
  const answers = attempt.answers ?? []

  const questionMap = Object.fromEntries(QUESTIONS.map(q => [q.id, q]))
  const questions: Question[] = questionIds.map(id => questionMap[id]).filter(Boolean)

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-text-3 mb-6">Detailed question data is not available for this attempt. Only newer attempts store per-question replay data.</p>
        <button onClick={onClose} className="px-6 py-3 bg-teal text-white rounded-lg font-mono">← Back to History</button>
      </div>
    )
  }

  const q = questions[idx]
  const userAnswer = answers[idx] ?? null
  const isCorrect = userAnswer === q.correct_answer

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="text-teal font-mono text-sm hover:underline">
          ← Back to History
        </button>
        <span className="text-xs text-text-3 font-mono bg-amber/10 text-amber px-3 py-1 rounded-full border border-amber/30">
          READ-ONLY REPLAY
        </span>
        <span className="text-xs font-mono text-text-3">
          {idx + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-cream-2 rounded overflow-hidden mb-6">
        <div className="h-full bg-teal transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Domain */}
      <div className="text-xs text-teal tracking-widest mb-2 font-mono">{q.domain} • {q.difficulty}</div>

      {/* Question */}
      <div className="font-serif text-xl text-navy mb-6 leading-relaxed">{q.question}</div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left px-4 py-3 rounded-lg border-2 font-mono text-sm'
          if (i === q.correct_answer) {
            cls += ' border-correct bg-correct-bg text-correct'
          } else if (i === userAnswer && i !== q.correct_answer) {
            cls += ' border-wrong bg-wrong-bg text-wrong'
          } else {
            cls += ' border-cream-2 text-text-3'
          }
          return (
            <div key={i} className={cls}>
              <span className="inline-block w-6 h-6 rounded-full bg-cream-2 text-center text-xs leading-6 mr-3">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {i === userAnswer && i !== q.correct_answer && <span className="ml-2 text-xs">(your answer)</span>}
              {i === q.correct_answer && <span className="ml-2 text-xs">✓</span>}
            </div>
          )
        })}
      </div>

      {/* Result + explanation */}
      <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-correct-bg border border-correct' : userAnswer === null ? 'bg-cream-2 border border-cream-2' : 'bg-wrong-bg border border-wrong'}`}>
        <div className="font-mono text-sm font-bold mb-2">
          {userAnswer === null ? 'Not answered' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
        </div>
        <div className="text-sm leading-relaxed">{q.explanation}</div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setIdx((i: number) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="px-6 py-3 bg-cream-2 text-text rounded-lg font-mono disabled:opacity-50 hover:bg-cream transition"
        >
          ← Previous
        </button>
        {idx < questions.length - 1 ? (
          <button
            onClick={() => setIdx((i: number) => i + 1)}
            className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 transition"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-navy text-white rounded-lg font-mono hover:bg-navy-2 transition"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}

// Domain bar chart for a single attempt
function DomainChart({ domains }: { domains: DomainStat[] }) {
  if (!domains || domains.length === 0) return null
  const data = [...domains].sort((a, b) => a.percentage - b.percentage)

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Score']}
          labelStyle={{ fontFamily: 'monospace', fontSize: 12 }}
          contentStyle={{ fontFamily: 'monospace', fontSize: 12, borderRadius: 8 }}
        />
        <ReferenceLine x={PASS_THRESHOLD} stroke="#E8A020" strokeDasharray="4 2" label={{ value: `Pass (${PASS_THRESHOLD}%)`, position: 'insideTopRight', fontSize: 10, fontFamily: 'monospace', fill: '#E8A020' }} />
        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
          {data.map((entry: DomainStat, i: number) => (
            <Cell key={i} fill={entry.percentage >= PASS_THRESHOLD ? '#0D7377' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function MockHistoryPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<MockAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replaying, setReplaying] = useState<MockAttempt | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data } = await supabase
        .from('crcst_quiz_results')
        .select('id, score, total_questions, percentage, time_taken, domains, created_at, answers, question_ids')
        .eq('user_id', user.id)
        .eq('difficulty', 'mock')
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setAttempts(data as MockAttempt[])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-teal font-mono">Loading…</div>
      </div>
    )
  }

  if (replaying) {
    return (
      <div className="min-h-screen bg-cream">
        <header className="bg-navy text-white px-6 py-4 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto font-serif text-lg font-bold">Mock Exam Replay</div>
        </header>
        <ReplayView attempt={replaying} onClose={() => setReplaying(null)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/account" className="text-teal-3 hover:text-white transition text-sm font-mono">
            ← Account
          </Link>
          <div className="font-serif text-lg font-bold">Mock Exam History</div>
          <span className="text-xs text-teal-3 font-mono">{attempts.length} attempt{attempts.length !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {attempts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="font-serif text-2xl text-navy mb-2">No mock exams yet</h2>
            <p className="text-text-3 mb-6">Complete a full mock exam to see your history and domain breakdown here.</p>
            <Link href="/crcst" className="px-6 py-3 bg-teal text-white rounded-lg font-mono hover:bg-teal-2 transition inline-block">
              Start a Mock Exam
            </Link>
          </div>
        ) : (
          <>
            {/* Overall trend summary */}
            <div className="mb-8 p-5 bg-white rounded-xl border border-cream-2 shadow-sm">
              <div className="text-xs text-teal tracking-widest font-mono mb-3">OVERALL TREND</div>
              <div className="flex gap-8">
                <div>
                  <div className="font-serif text-3xl text-navy">
                    {Math.round(attempts.reduce((s: number, a: MockAttempt) => s + a.percentage, 0) / attempts.length)}%
                  </div>
                  <div className="text-xs text-text-3">Avg. Score</div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-navy">
                    {attempts.filter((a: MockAttempt) => a.percentage >= PASS_THRESHOLD).length}
                  </div>
                  <div className="text-xs text-text-3">Passing Attempts</div>
                </div>
                <div>
                  <div className="font-serif text-3xl text-navy">{attempts.length}</div>
                  <div className="text-xs text-text-3">Total Attempts</div>
                </div>
              </div>
            </div>

            {/* Attempt list */}
            <div className="space-y-4">
              {attempts.map((attempt: MockAttempt, i: number) => {
                const passed = attempt.percentage >= PASS_THRESHOLD
                const isExpanded = expanded === attempt.id
                return (
                  <div key={attempt.id} className="bg-white rounded-xl border border-cream-2 shadow-sm overflow-hidden">
                    {/* Attempt header row */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-cream transition"
                      onClick={() => setExpanded(isExpanded ? null : attempt.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`font-serif text-2xl ${passed ? 'text-correct' : 'text-wrong'}`}>
                            {attempt.percentage}%
                          </div>
                          <div className={`text-xs font-mono ${passed ? 'text-correct' : 'text-wrong'}`}>
                            {passed ? 'PASS' : 'FAIL'}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-sm text-navy font-bold">
                            Attempt #{attempts.length - i} — {attempt.score}/{attempt.total_questions} correct
                          </div>
                          <div className="text-xs text-text-3">
                            {formatDate(attempt.created_at)}
                            {attempt.time_taken ? ` · ${formatTime(attempt.time_taken)}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setReplaying(attempt) }}
                          className="px-3 py-1.5 text-xs font-mono bg-cream-2 text-text rounded-lg hover:bg-cream transition"
                        >
                          Replay
                        </button>
                        <span className="text-text-3 text-lg">{isExpanded ? '−' : '+'}</span>
                      </div>
                    </div>

                    {/* Domain chart (expanded) */}
                    {isExpanded && attempt.domains && attempt.domains.length > 0 && (
                      <div className="border-t border-cream-2 px-5 py-5">
                        <div className="text-xs text-teal tracking-widest font-mono mb-4">DOMAIN BREAKDOWN</div>
                        <DomainChart domains={attempt.domains} />
                        <div className="mt-3 text-xs text-text-3 font-mono">
                          Dashed line = {PASS_THRESHOLD}% pass threshold
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
