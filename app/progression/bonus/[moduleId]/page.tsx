'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getBonusById } from '@/lib/progression-config'
import { QUESTIONS, type Question } from '@/lib/questions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

export default function BonusModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string

  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  const [speedQuestions, setSpeedQuestions] = useState<Question[]>([])
  const [speedIndex, setSpeedIndex] = useState(0)
  const [speedAnswers, setSpeedAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(240)
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
      .maybeSingle()

    setHasAccess(!!data)
    setLoading(false)
  }, [moduleId, router])

  useEffect(() => { checkAccess() }, [checkAccess])

  useEffect(() => {
    if (!speedStarted || speedDone) return
    if (timeLeft <= 0) { finishSpeedRound(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [speedStarted, speedDone, timeLeft])

  function startSpeedRound() {
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
      <div className="min-h-screen bg-navy text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/40 mb-4">Module not found</div>
          <button
            onClick={() => router.push('/progression')}
            className="text-teal bg-transparent border-none cursor-pointer"
          >
            ← Back to Progression
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-teal/30 border-t-teal animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center p-8">
        <div className="text-center max-w-[420px]">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="font-serif text-2xl mb-3">{module.title}</h1>
          <p className="text-white/50 mb-6 leading-relaxed">{module.lockedLabel}</p>
          <Button variant="gradient" onClick={() => router.push('/progression')}>
            Return to Progression
          </Button>
        </div>
      </div>
    )
  }

  if (moduleId === 'speed-round') {
    if (!speedStarted) {
      return (
        <div className="min-h-screen bg-navy text-white flex items-center justify-center p-8">
          <div className="text-center max-w-[480px]">
            <Label color="teal" className="mb-4">Bonus Module</Label>
            <h1 className="font-serif text-[2rem] mb-3">Speed Round Challenge</h1>
            <p className="text-white/60 mb-2">{module.earnedMessage}</p>
            <p className="text-white/40 text-[0.85rem] mb-8">15 questions · 4 minutes · no pause</p>
            <Button variant="gradient" size="lg" onClick={startSpeedRound}>
              Start Speed Round
            </Button>
            <div className="mt-4">
              <button
                onClick={() => router.push('/progression')}
                className="text-white/35 bg-transparent border-none cursor-pointer text-[0.85rem]"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (speedDone) {
      return (
        <div className="min-h-screen bg-navy text-white flex items-center justify-center p-8">
          <div className="text-center max-w-[480px]">
            <div
              className={cn('font-serif text-[4rem] mb-2', speedScore >= 80 ? 'text-teal' : 'text-amber')}
            >
              {speedScore}%
            </div>
            <div className="text-[0.9rem] text-white/50 mb-8">
              {speedScore >= 80
                ? 'Impressive — you know this material fast.'
                : 'Speed revealed a gap. Use it as a guide.'}
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="gradient"
                onClick={() => {
                  setSpeedStarted(false)
                  setSpeedDone(false)
                  setSpeedAnswers({})
                  setSpeedIndex(0)
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="border-white/15 text-white/70 hover:bg-white/8"
                onClick={() => router.push('/progression')}
              >
                Return to Dashboard
              </Button>
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
      <div className="min-h-screen bg-navy text-white flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[8%]">
          <div className="text-xs font-mono text-white/40">
            Question {speedIndex + 1} of {speedQuestions.length}
          </div>
          <div className="font-mono font-bold text-[1.1rem]" style={{ color: timerColor }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="max-w-[600px] w-full">
            <p className="text-[1.15rem] leading-relaxed mb-8">{q.question}</p>
            <div className="flex flex-col gap-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => answerSpeed(q.id, i)}
                  className="bg-white/[5%] border border-white/[12%] rounded-lg px-4 py-[0.875rem] text-white cursor-pointer text-left text-[0.95rem] hover:bg-white/[10%] transition-colors"
                >
                  <span className="text-teal font-mono mr-3">{String.fromCharCode(65 + i)}</span>
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
    <div className="min-h-screen bg-navy text-white">
      <header className="border-b border-white/[8%] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/progression')}
          className="text-white/50 bg-transparent border-none cursor-pointer text-[0.85rem] flex items-center gap-[0.4rem] hover:text-white/80 transition-colors"
        >
          ← Progression
        </button>
        <Label color="teal">Bonus Module</Label>
      </header>

      <div className="max-w-[720px] mx-auto px-6 py-12">
        <Label color="amber" className="mb-2">Earned</Label>
        <h1 className="font-serif text-[2rem] mb-3">{module.title}</h1>
        <p className="text-white/50 mb-2 leading-relaxed italic">{module.earnedMessage}</p>
        <hr className="border-0 border-t border-white/10 my-8" />

        <div className="leading-relaxed">
          {module.content.split('\n').map((line, i) => {
            if (line.startsWith('## '))
              return <h2 key={i} className="font-serif text-[1.3rem] text-teal mt-8 mb-3">{line.slice(3)}</h2>
            if (line.startsWith('### '))
              return <h3 key={i} className="font-serif text-[1.1rem] text-amber mt-6 mb-2">{line.slice(4)}</h3>
            if (line.startsWith('**') && line.endsWith('**'))
              return <p key={i} className="font-bold text-white/90 my-3">{line.slice(2, -2)}</p>
            if (line.trim() === '')
              return <div key={i} className="h-2" />
            if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. '))
              return <p key={i} className="text-white/75 pl-6 my-[0.35rem]">{line}</p>
            return <p key={i} className="text-white/75 my-[0.35rem]">{line}</p>
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Button variant="gradient" size="lg" onClick={() => router.push('/progression')}>
            Return to Progression Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
