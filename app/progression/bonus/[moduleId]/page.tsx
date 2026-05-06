'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BONUS_MODULES, PROGRESSION_LEVELS, getBonusById } from '@/lib/progression-config'
import { QUESTIONS, type Question } from '@/lib/questions'

export default function BonusModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string

  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  // Speed round state
  const [speedQuestions, setSpeedQuestions] = useState<Question[]>([])
  const [speedIndex, setSpeedIndex] = useState(0)
  const [speedAnswers, setSpeedAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes
  const [speedStarted, setSpeedStarted] = useState(false)
  const [speedDone, setSpeedDone] = useState(false)
  const [speedScore, setSpeedScore] = useState(0)

  const module = getBonusById(moduleId)

  const checkAccess = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/crcst'); return }

    const { data } = await supabase
      .from('bonus_unlocks')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .single()

    setHasAccess(!!data)
    setLoading(false)
  }, [moduleId, router])

  useEffect(() => { checkAccess() }, [checkAccess])

  // Speed round timer
  useEffect(() => {
    if (!speedStarted || speedDone) return
    if (timeLeft <= 0) { finishSpeedRound(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [speedStarted, speedDone, timeLeft])

  function startSpeedRound() {
    // Pull 15 questions across all domains
    const pool = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 15)
    setSpeedQuestions(pool)
    setSpeedStarted(true)
    setTimeLeft(240)
  }

  function answerSpeed(qId: string, idx: number) {
    const next = { ...speedAnswers, [qId]: idx }
    setSpeedAnswers(next)
    if (speedIndex < speedQuestions.length - 1) {
      setSpeedIndex(i => i + 1)
    } else {
      finishSpeedRoundWith(next)
    }
  }

  function finishSpeedRound() {
    finishSpeedRoundWith(speedAnswers)
  }

  function finishSpeedRoundWith(ans: Record<string, number>) {
    let correct = 0
    for (const q of speedQuestions) {
      if (ans[q.id] === q.correct_answer) correct++
    }
    setSpeedScore(Math.round((correct / speedQuestions.length) * 100))
    setSpeedDone(true)
  }

  if (!module) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>Module not found</div>
          <button onClick={() => router.push('/progression')} style={{ color: '#14BDAC', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to Progression</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(20,189,172,0.3)', borderTopColor: '#14BDAC', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontFamily: 'serif', fontSize: '1.5rem', marginBottom: '0.75rem' }}>{module.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{module.lockedLabel}</p>
          <button onClick={() => router.push('/progression')} style={{ background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Return to Progression
          </button>
        </div>
      </div>
    )
  }

  // Speed round module
  if (moduleId === 'speed-round') {
    if (!speedStarted) {
      return (
        <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#14BDAC', fontFamily: 'monospace', marginBottom: '1rem' }}>BONUS MODULE</div>
            <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '0.75rem' }}>Speed Round Challenge</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>{module.earnedMessage}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '2rem' }}>15 questions · 4 minutes · no pause</p>
            <button onClick={startSpeedRound} style={{ background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', padding: '0.875rem 2rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
              Start Speed Round
            </button>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => router.push('/progression')} style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
            </div>
          </div>
        </div>
      )
    }

    if (speedDone) {
      return (
        <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ fontFamily: 'serif', fontSize: '4rem', color: speedScore >= 80 ? '#14BDAC' : '#DAA520', marginBottom: '0.5rem' }}>{speedScore}%</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>
              {speedScore >= 80 ? 'Impressive — you know this material fast.' : 'Speed revealed a gap. Use it as a guide.'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => { setSpeedStarted(false); setSpeedDone(false); setSpeedAnswers({}); setSpeedIndex(0) }}
                style={{ background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Try Again
              </button>
              <button onClick={() => router.push('/progression')}
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    const q = speedQuestions[speedIndex]
    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    const timerColor = timeLeft < 30 ? '#EF4444' : timeLeft < 60 ? '#DAA520' : '#14BDAC'

    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
            Question {speedIndex + 1} of {speedQuestions.length}
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: timerColor }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: 600, width: '100%' }}>
            <p style={{ fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '2rem' }}>{q.question}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => answerSpeed(q.id, i)} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8, padding: '0.875rem 1rem', color: '#fff', cursor: 'pointer',
                  textAlign: 'left', fontSize: '0.95rem', transition: 'background 0.15s',
                }}>
                  <span style={{ color: '#14BDAC', fontFamily: 'monospace', marginRight: '0.75rem' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Content modules (real-case-breakdown, critical-mistakes-vault)
  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', color: '#fff' }}>
      <header style={{ background: '#0D1B2A', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.push('/progression')} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Progression
        </button>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#14BDAC', fontFamily: 'monospace' }}>BONUS MODULE</div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.12em', color: '#DAA520', fontFamily: 'monospace' }}>EARNED</div>
        <h1 style={{ fontFamily: 'serif', fontSize: '2rem', marginBottom: '0.75rem' }}>{module.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', lineHeight: 1.6, fontStyle: 'italic' }}>{module.earnedMessage}</p>
        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* Render markdown-lite content */}
        <div style={{ lineHeight: 1.8 }}>
          {module.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} style={{ fontFamily: 'serif', fontSize: '1.3rem', color: '#14BDAC', margin: '2rem 0 0.75rem' }}>{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i} style={{ fontFamily: 'serif', fontSize: '1.1rem', color: '#DAA520', margin: '1.5rem 0 0.5rem' }}>{line.slice(4)}</h3>
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '0.75rem 0' }}>{line.slice(2, -2)}</p>
            if (line.trim() === '') return <div key={i} style={{ height: '0.5rem' }} />
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
              return <p key={i} style={{ color: 'rgba(255,255,255,0.75)', paddingLeft: '1.5rem', margin: '0.35rem 0' }}>{line}</p>
            }
            return <p key={i} style={{ color: 'rgba(255,255,255,0.75)', margin: '0.35rem 0' }}>{line}</p>
          })}
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => router.push('/progression')} style={{ background: 'linear-gradient(135deg,#0D7377,#14BDAC)', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Return to Progression Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
