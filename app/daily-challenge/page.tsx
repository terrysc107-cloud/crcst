'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Question } from '@/lib/questions'
import Celebration from '@/components/Celebration'

interface DailyChallengeData {
  date: string
  questions: Question[]
  userResult: { score: number; total: number; percentage: number; completed_at: string } | null
}

export default function DailyChallengePage() {
  const router = useRouter()
  const [data, setData] = useState<DailyChallengeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [percentile, setPercentile] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    async function load() {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/daily-challenge', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) { setLoading(false); return }
      const json = await res.json()
      setData(json)
      setAnswers(new Array((json.questions ?? []).length).fill(null))
      setLoading(false)
    }
    load()
  }, [])

  async function submit() {
    if (!data) return
    const correct = answers.filter((a, i) => a === data.questions[i].correct_answer).length
    const session = await supabase.auth.getSession()
    const token = session.data.session?.access_token
    if (token) {
      const res = await fetch('/api/daily-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score: correct, total: data.questions.length }),
      })
      const json = await res.json()
      setPercentile(json.percentile ?? null)

      // Award XP
      await fetch('/api/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ correct, total: data.questions.length, difficulty: 'all', reason: 'daily_challenge' }),
      })

      // Record streak activity
      await fetch('/api/streaks/activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      // Check badges
      await fetch('/api/badges/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      })
    }

    if (correct >= Math.ceil(data.questions.length * 0.7)) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 4000)
    }
    setSubmitted(true)
  }

  const selectAnswer = (idx: number) => {
    if (submitted) return
    const next = [...answers]
    next[current] = idx
    setAnswers(next)
    setShowExplanation(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#021B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        Loading today&apos;s challenge…
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#021B3A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', gap: '1rem' }}>
        <p>Failed to load today&apos;s challenge.</p>
        <Link href="/dashboard" style={{ color: '#14BDAC' }}>← Back to dashboard</Link>
      </div>
    )
  }

  const q = data.questions[current]
  const hasAnswered = answers[current] !== null
  const isCorrect = hasAnswered && answers[current] === q.correct_answer
  const allAnswered = answers.every(a => a !== null)
  const score = submitted ? answers.filter((a, i) => a === data.questions[i].correct_answer).length : 0
  const pct = submitted ? Math.round((score / data.questions.length) * 100) : 0

  // Already completed today
  if (data.userResult) {
    return (
      <div style={{ minHeight: '100vh', background: '#021B3A', color: '#fff', padding: '2rem' }}>
        <div style={{ maxWidth: 520, margin: '4rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Today&apos;s Challenge Complete!</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Come back tomorrow for a new challenge.</p>
          <div style={{ background: 'rgba(20,189,172,0.08)', border: '1px solid rgba(20,189,172,0.2)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#14BDAC' }}>{data.userResult.percentage}%</div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>{data.userResult.score}/{data.userResult.total} correct</div>
          </div>
          <Link href="/dashboard" style={{ color: '#14BDAC', textDecoration: 'none', fontWeight: 600 }}>← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#021B3A', color: '#fff', padding: '2rem' }}>
        {celebrate && <Celebration type="confetti" />}
        <div style={{ maxWidth: 520, margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{pct >= 70 ? '🎉' : '💪'}</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {pct >= 70 ? 'Great work!' : 'Keep going!'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            You scored <strong style={{ color: '#14BDAC' }}>{pct}%</strong> ({score}/{data.questions.length} correct)
          </p>
          {percentile !== null && (
            <div style={{ background: 'rgba(20,189,172,0.08)', border: '1px solid rgba(20,189,172,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#14BDAC' }}>
                Top {100 - percentile}% today
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>
                You scored higher than {percentile}% of today&apos;s challengers
              </div>
            </div>
          )}
          <Link href="/dashboard" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#021B3A', color: '#fff' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Dashboard
        </Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#14BDAC', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
            Daily Challenge
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            {new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
          {current + 1}/{data.questions.length}
        </div>
      </header>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ height: '100%', background: '#14BDAC', width: `${((current + 1) / data.questions.length) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '1.75rem', color: 'rgba(255,255,255,0.92)' }}>
          {q.question}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {q.options.map((opt, i) => {
            const isSelected = answers[current] === i
            const isRight = i === q.correct_answer
            let bg = 'rgba(255,255,255,0.04)'
            let border = 'rgba(255,255,255,0.1)'
            let color = 'rgba(255,255,255,0.85)'
            if (hasAnswered) {
              if (isRight) { bg = 'rgba(16,185,129,0.12)'; border = '#10B981'; color = '#10B981' }
              else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; border = '#EF4444'; color = '#EF4444' }
            } else if (isSelected) {
              bg = 'rgba(20,189,172,0.12)'; border = '#14BDAC'; color = '#14BDAC'
            }
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                disabled={hasAnswered}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.9rem 1rem',
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  background: bg, color,
                  cursor: hasAnswered ? 'default' : 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontWeight: 700, opacity: 0.7, minWidth: 20 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {hasAnswered && (
          <div style={{
            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 10,
            padding: '1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, color: isCorrect ? '#10B981' : '#EF4444', marginBottom: '0.35rem' }}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>
              {q.explanation}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
          {current > 0 && (
            <button
              onClick={() => { setCurrent(c => c - 1); setShowExplanation(false) }}
              style={{ flex: 1, padding: '0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Back
            </button>
          )}

          {hasAnswered && current < data.questions.length - 1 ? (
            <button
              onClick={() => { setCurrent(c => c + 1); setShowExplanation(false) }}
              style={{ flex: 1, padding: '0.7rem', borderRadius: 8, background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
            >
              Next →
            </button>
          ) : hasAnswered && current === data.questions.length - 1 && allAnswered ? (
            <button
              onClick={submit}
              style={{ flex: 1, padding: '0.7rem', borderRadius: 8, background: 'linear-gradient(135deg,#DAA520,#f4a261)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
            >
              Submit Results 🎯
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
