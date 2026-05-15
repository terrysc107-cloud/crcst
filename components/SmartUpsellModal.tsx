'use client'

import Link from 'next/link'
import { TrendingUp, Zap, Brain, BarChart2, Lock } from 'lucide-react'

interface SessionStats {
  questionsAnswered: number
  correctCount: number
  weakDomains: string[]
}

interface SmartUpsellModalProps {
  isOpen: boolean
  onContinueFree: () => void   // use remaining 5 questions
  sessionStats: SessionStats
  dailyLimit: number
  upsellAt: number
}

export function SmartUpsellModal({
  isOpen,
  onContinueFree,
  sessionStats,
  dailyLimit,
  upsellAt,
}: SmartUpsellModalProps) {
  if (!isOpen) return null

  const { questionsAnswered, correctCount, weakDomains } = sessionStats
  const scorePercent = questionsAnswered > 0
    ? Math.round((correctCount / questionsAnswered) * 100)
    : 0
  const remaining = dailyLimit - upsellAt

  const scoreColor =
    scorePercent >= 80 ? 'text-emerald-400' :
    scorePercent >= 60 ? 'text-amber-400'   :
    'text-red-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-sm bg-navy-2 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(0,0,0,0.6)' }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #14bdac, #daa520)' }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-white/6">
          <div
            className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #0d7377, #14bdac)' }}
          >
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white leading-tight">
            You&apos;re halfway through your free session.
          </h2>
          <p className="text-white/50 text-sm mt-1">
            {upsellAt} of {dailyLimit} free questions used today.
          </p>
        </div>

        {/* Session snapshot */}
        <div className="px-6 py-4 border-b border-white/6">
          <p className="text-xs text-white/40 uppercase tracking-widest font-mono mb-3">Your session so far</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/[0.04] rounded-xl p-3 text-center">
              <div className={`text-2xl font-black ${scoreColor}`}>{scorePercent}%</div>
              <div className="text-white/40 text-xs mt-0.5">correct rate</div>
            </div>
            <div className="flex-1 bg-white/[0.04] rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-white">{correctCount}<span className="text-white/30 text-lg">/{questionsAnswered}</span></div>
              <div className="text-white/40 text-xs mt-0.5">answered</div>
            </div>
            <div className="flex-1 bg-white/[0.04] rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-amber-400">{remaining}</div>
              <div className="text-white/40 text-xs mt-0.5">left free</div>
            </div>
          </div>

          {/* Weak domains */}
          {weakDomains.length > 0 && (
            <div className="mt-3 rounded-xl bg-red-500/8 border border-red-500/15 px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-mono uppercase tracking-wider">Weak areas this session</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weakDomains.slice(0, 3).map((d) => (
                  <span key={d} className="text-xs bg-red-500/10 border border-red-500/20 text-red-300 rounded-full px-2 py-0.5">
                    {d}
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/40 mt-2">
                Pro tracks these across every session and tells you exactly what to review.
              </p>
            </div>
          )}
        </div>

        {/* What Pro unlocks */}
        <div className="px-6 py-4 border-b border-white/6">
          <p className="text-xs text-white/40 uppercase tracking-widest font-mono mb-3">What you&apos;re missing</p>
          <ul className="space-y-2">
            {[
              { Icon: Zap,      text: 'Unlimited questions — finish every quiz, every session' },
              { Icon: BarChart2, text: 'Domain mastery tracking — see exactly where you\'re weak' },
              { Icon: Brain,    text: 'Unlimited AI Study Chat — ask anything, get answers instantly' },
            ].map(({ Icon, text }, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-white/65">
                <Icon className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="px-6 py-5 space-y-3">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white text-sm hover:-translate-y-0.5 hover:opacity-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #14bdac, #0d7377)',
              boxShadow: '0 4px 16px rgba(20,189,172,0.30)',
            }}
          >
            Upgrade to Pro — $19 for 90 days →
          </Link>

          <button
            onClick={onContinueFree}
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 text-sm font-medium hover:text-white/70 hover:border-white/20 transition-all"
          >
            Continue with my last {remaining} free questions
          </button>

          <p className="text-center text-white/25 text-xs font-mono">
            Free limit resets at midnight · No card required to continue
          </p>
        </div>
      </div>
    </div>
  )
}
