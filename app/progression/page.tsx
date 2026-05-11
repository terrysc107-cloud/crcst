'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROGRESSION_LEVELS, BONUS_MODULES, PROGRESSION_BADGES, getXpTier, getNextXpTier } from '@/lib/progression-config'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/typography'

type LevelStatus = 'locked' | 'unlocked' | 'completed'

interface UserLevel {
  level_id: number
  status: LevelStatus
  best_score?: number | null
}

interface BonusUnlock {
  module_id: string
}

export default function ProgressionPage() {
  const router = useRouter()
  const sub = useSubscription()
  const [levelStatus, setLevelStatus] = useState<Record<number, LevelStatus>>({})
  const [bestScores, setBestScores] = useState<Record<number, number | null>>({})
  const [unlockedBonuses, setUnlockedBonuses] = useState<Set<string>>(new Set())
  const [totalXp, setTotalXp] = useState<number>(0)
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set())
  const [weakSpots, setWeakSpots] = useState<{ name: string; accuracy: number; total: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [lockedClickMessage, setLockedClickMessage] = useState<Record<number, boolean>>({})

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/crcst')
        return
      }

      const user = session.user

      const { data: userLevels } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)

      if (!userLevels || userLevels.length === 0) {
        await supabase
          .from('user_levels')
          .upsert(
            { user_id: user.id, level_id: 1, status: 'unlocked' },
            { onConflict: 'user_id,level_id' }
          )

        setLevelStatus({ 1: 'unlocked' })
        setBestScores({})
      } else {
        const statusMap: Record<number, LevelStatus> = {}
        const scoreMap: Record<number, number | null> = {}
        ;(userLevels as UserLevel[]).forEach((row) => {
          statusMap[row.level_id] = row.status
          scoreMap[row.level_id] = row.best_score ?? null
        })
        setLevelStatus(statusMap)
        setBestScores(scoreMap)
      }

      const { data: bonusData } = await supabase
        .from('bonus_unlocks')
        .select('module_id')
        .eq('user_id', user.id)

      if (bonusData) {
        setUnlockedBonuses(new Set((bonusData as BonusUnlock[]).map((b) => b.module_id)))
      }

      const { data: xpData } = await supabase
        .from('user_xp')
        .select('total_xp')
        .eq('user_id', user.id)
        .maybeSingle()

      if (xpData) setTotalXp(xpData.total_xp ?? 0)

      const { data: badgeData } = await supabase
        .from('progression_badges')
        .select('badge_id')
        .eq('user_id', user.id)

      if (badgeData) {
        setEarnedBadgeIds(new Set(badgeData.map((b: { badge_id: string }) => b.badge_id)))
      }

      const { data: domainData } = await supabase
        .from('crcst_domain_mastery')
        .select('domain_name, questions_answered, mastery_percentage')
        .eq('user_id', user.id)
        .gte('questions_answered', 5)
        .order('mastery_percentage', { ascending: true })
        .limit(3)

      if (domainData && domainData.length > 0) {
        setWeakSpots(domainData.map(d => ({
          name: d.domain_name,
          accuracy: Math.round(Number(d.mastery_percentage)),
          total: d.questions_answered,
        })))
      }

      setLoading(false)
    }

    load()
  }, [router])

  function handleLockedClick(levelId: number) {
    setLockedClickMessage((prev) => ({ ...prev, [levelId]: true }))
    setTimeout(() => {
      setLockedClickMessage((prev) => ({ ...prev, [levelId]: false }))
    }, 3000)
  }

  const completedCount = PROGRESSION_LEVELS.filter(
    (l) => levelStatus[l.id] === 'completed'
  ).length

  if (loading || sub.loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-[3px] border-teal/20 border-t-teal animate-spin" />
      </div>
    )
  }

  if (!sub.isPaid) {
    return (
      <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-5 py-8 text-center">
        <div className="w-16 h-16 bg-teal/10 border border-teal/30 rounded-2xl flex items-center justify-center mb-6">
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24" className="text-teal">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
        <Label color="teal" className="mb-3">Pro Feature</Label>
        <h1 className="font-display text-[clamp(1.6rem,5vw,2.2rem)] font-bold text-cream leading-tight mb-4 max-w-[420px]">
          Progression Mode requires a Pro subscription
        </h1>
        <p className="text-[0.92rem] text-cream/50 leading-relaxed max-w-[380px] mb-8">
          Unlock the full Unlock Challenge — five sequential levels, XP rewards, badges, and bonus content — with a Pro or Triple Crown plan.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button asChild variant="gradient">
            <Link href="/pricing">Upgrade to Pro →</Link>
          </Button>
          <Link
            href="/dashboard"
            className="block text-center py-[0.9rem] text-cream/40 border border-cream/10 rounded-[10px] text-[0.85rem] font-mono no-underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center font-serif text-xl font-bold text-white">
              SP
            </div>
            <div>
              <div className="font-serif text-[1.1rem] font-bold">SPD Cert Companion</div>
              <div className="text-xs text-teal tracking-[0.04em]">Sterile Processing Certification Prep</div>
            </div>
          </div>
          <Link href="/dashboard" className="text-[0.8rem] text-white/50 no-underline">
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-navy to-[#2A3A4A] text-white py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <Label color="teal" className="mb-3">The Unlock Challenge</Label>
          <h1 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold mb-4 leading-tight">
            Knowledge is{' '}
            <em className="text-amber italic">earned</em>, not accessed.
          </h1>
          <p className="text-[0.95rem] text-white/60 max-w-[480px] mx-auto mb-8 leading-relaxed">
            Work through five sequential levels covering the full CRCST domain. Each level
            unlocks the next. Pass a level to advance — or prove mastery to unlock bonus
            content.
          </p>

          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>Progress</span>
              <span className="text-teal font-semibold">{completedCount} of 5 levels completed</span>
            </div>
            <Progress value={(completedCount / 5) * 100} color="teal" className="h-2" />

            {(() => {
              const tier = getXpTier(totalXp)
              const next = getNextXpTier(totalXp)
              return (
                <div className="mt-6 flex flex-col items-center gap-[0.4rem]">
                  <div className="flex items-center gap-[0.6rem]">
                    <span
                      className="text-[0.65rem] tracking-[0.12em] font-mono uppercase rounded-full px-[0.6rem] py-[0.15rem] opacity-90"
                      style={{ color: tier.color, border: `1px solid ${tier.color}` }}
                    >
                      {tier.label}
                    </span>
                    <span className="font-mono font-bold text-base" style={{ color: tier.color }}>
                      {totalXp} XP
                    </span>
                  </div>
                  {next && (
                    <div className="text-[0.7rem] text-cream/35 font-mono">
                      {next.minXp - totalXp} XP to {next.label}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Label className="mb-5">Core Levels</Label>

        <div className="flex flex-col gap-4 mb-10">
          {PROGRESSION_LEVELS.map((level) => {
            const status = levelStatus[level.id] ?? 'locked'
            const score = bestScores[level.id]
            const isLocked = status === 'locked'
            const isUnlocked = status === 'unlocked'
            const isCompleted = status === 'completed'
            const showMessage = lockedClickMessage[level.id]

            return (
              <div key={level.id}>
                <div
                  onClick={isLocked ? () => handleLockedClick(level.id) : undefined}
                  className={cn(
                    'relative bg-white rounded-[14px] p-6 transition-[box-shadow,border-color]',
                    isLocked && 'cursor-default opacity-50 grayscale border border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.05)]',
                    isUnlocked && 'border-2 border-teal shadow-[0_0_0_4px_rgba(20,189,172,0.12)]',
                    isCompleted && 'border-2 border-teal/40 shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                  )}
                >
                  {isLocked && (
                    <div className="absolute top-4 right-4 text-navy/35">
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="absolute top-4 right-4 w-[26px] h-[26px] bg-teal/[12%] border border-teal/40 rounded-full flex items-center justify-center text-teal">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center font-serif font-bold text-lg',
                        isCompleted && 'bg-teal/[12%] text-teal',
                        isUnlocked && 'bg-teal text-white',
                        isLocked && 'bg-navy/[8%] text-navy/40',
                      )}
                    >
                      {level.id}
                    </div>

                    <div className={cn('flex-1 min-w-0', (isLocked || isCompleted) && 'pr-8')}>
                      <div className="font-serif font-bold text-[1.05rem] text-navy mb-1">
                        Level {level.id}: {level.name}
                      </div>
                      <p className="text-[0.82rem] text-navy/60 leading-[1.55] mb-3">
                        {level.description}
                      </p>

                      <div className="flex flex-wrap gap-[0.35rem] mb-[0.85rem]">
                        {level.domains.map((domain) => (
                          <span
                            key={domain}
                            className="text-[0.68rem] font-mono tracking-[0.04em] px-[0.55rem] py-[0.2rem] rounded-full bg-navy/[6%] text-navy/55 border border-navy/10"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {isCompleted && score != null && (
                          <span className="text-[0.8rem] font-mono text-teal font-semibold">
                            Best: {score}%
                          </span>
                        )}
                        {!isCompleted && (
                          <span className="text-[0.75rem] font-mono text-navy/35">
                            {level.questionCount} questions · {level.passingScore}% to pass
                          </span>
                        )}

                        {isUnlocked && (
                          <Button asChild size="sm">
                            <Link href={`/progression/${level.id}`}>Start Challenge →</Link>
                          </Button>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/progression/${level.id}/study`}
                              className="text-[0.75rem] font-mono font-bold text-amber no-underline px-[0.85rem] py-[0.35rem] rounded-[7px] border border-amber/40 bg-amber/[6%]"
                            >
                              Study Module →
                            </Link>
                            <Link
                              href={`/progression/${level.id}`}
                              className="text-[0.78rem] font-mono text-navy/45 underline tracking-[0.02em]"
                            >
                              Retake
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isLocked && showMessage && (
                  <div className="mt-[0.4rem] px-4 py-[0.6rem] rounded-lg bg-navy/[6%] border border-navy/10 text-[0.8rem] text-navy/55 font-mono">
                    Complete Level {level.id - 1} to unlock this
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Weak Spots */}
        {weakSpots.length > 0 && (
          <div className="mb-10">
            <Label className="mb-5">Your Weak Spots</Label>
            <div className="bg-white rounded-[14px] border border-navy/10 overflow-hidden">
              <div className="px-6 py-[0.85rem] border-b border-navy/[7%] text-[0.78rem] text-navy/45 font-mono tracking-[0.02em]">
                Domains where you score lowest — based on your quiz history
              </div>
              {weakSpots.map((spot, i) => {
                const color = spot.accuracy < 50 ? '#EF4444' : spot.accuracy < 70 ? '#DAA520' : '#14BDAC'
                return (
                  <div
                    key={spot.name}
                    className={cn(
                      'px-6 py-4 flex items-center justify-between gap-4',
                      i > 0 && 'border-t border-navy/[7%]',
                    )}
                  >
                    <div className="flex items-center gap-[0.85rem] flex-1 min-w-0">
                      <div
                        className="flex-shrink-0 w-11 h-11 rounded-[10px] flex items-center justify-center font-mono font-bold text-[0.88rem]"
                        style={{ background: `${color}12`, border: `1px solid ${color}40`, color }}
                      >
                        {spot.accuracy}%
                      </div>
                      <div>
                        <div className="font-semibold text-[0.9rem] text-navy mb-[0.15rem]">{spot.name}</div>
                        <div className="text-[0.7rem] text-navy/40 font-mono">{spot.total} questions answered</div>
                      </div>
                    </div>
                    <Link
                      href={`/crcst?domain=${encodeURIComponent(spot.name)}`}
                      className="flex-shrink-0 text-[0.75rem] font-mono font-bold text-teal no-underline px-[0.9rem] py-[0.4rem] rounded-[7px] border border-teal/30 bg-teal/[6%]"
                    >
                      Practice →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bonus Modules */}
        <Label className="mb-5">Bonus Modules</Label>
        <div className="flex flex-col gap-[0.85rem]">
          {BONUS_MODULES.map((module) => {
            const isUnlockedBonus = unlockedBonuses.has(module.id)
            return (
              <div
                key={module.id}
                className={cn(
                  'relative bg-white rounded-[14px] p-5',
                  isUnlockedBonus
                    ? 'border-2 border-amber/50 shadow-[0_0_0_4px_rgba(218,165,32,0.08)]'
                    : 'opacity-[0.55] border border-navy/10 shadow-sm',
                )}
              >
                {!isUnlockedBonus && (
                  <div className="absolute top-4 right-4 text-navy/30">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex-shrink-0 w-2.5 h-2.5 rounded-full mt-[0.35rem]',
                      isUnlockedBonus ? 'bg-amber' : 'bg-navy/15',
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'font-serif font-bold text-base mb-1',
                        isUnlockedBonus ? 'text-navy' : 'text-navy/70',
                      )}
                    >
                      {module.title}
                    </div>
                    <p className="text-[0.82rem] text-navy/55 leading-[1.55] mb-3">
                      {module.description}
                    </p>

                    {!isUnlockedBonus && (
                      <div className="text-[0.72rem] font-mono text-navy/40 tracking-[0.04em] flex items-center gap-[0.35rem]">
                        <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        {module.lockedLabel}
                      </div>
                    )}

                    {isUnlockedBonus && (
                      <Link
                        href={`/progression/bonus/${module.id}`}
                        className="inline-block bg-amber/[12%] border border-amber/50 text-amber no-underline px-4 py-[0.4rem] rounded-lg text-[0.8rem] font-bold font-mono tracking-[0.03em]"
                      >
                        Open →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badge Locker */}
      <div className="max-w-3xl mx-auto px-6 pb-10">
        <Label className="mb-5">Badge Locker</Label>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[0.85rem]">
          {PROGRESSION_BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id)
            return (
              <div
                key={badge.id}
                className={cn(
                  'bg-white rounded-[14px] p-4 text-center border transition-[box-shadow]',
                  !earned && 'opacity-50 grayscale border-navy/[9%] shadow-sm',
                )}
                style={earned ? {
                  border: `2px solid ${badge.color}60`,
                  boxShadow: `0 0 0 4px ${badge.color}12`,
                } : undefined}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-[1.4rem] mx-auto mb-[0.6rem]',
                    !earned && 'bg-navy/[6%] border border-navy/10',
                  )}
                  style={earned ? {
                    background: `${badge.color}18`,
                    border: `1px solid ${badge.color}50`,
                  } : undefined}
                >
                  {badge.icon}
                </div>
                <div
                  className={cn(
                    'font-serif font-bold text-[0.82rem] mb-[0.3rem] leading-tight',
                    earned ? 'text-navy' : 'text-navy/50',
                  )}
                >
                  {badge.name}
                </div>
                <div
                  className={cn('text-[0.68rem] font-mono tracking-[0.03em]', !earned && 'text-navy/35')}
                  style={earned ? { color: badge.color } : undefined}
                >
                  {earned ? 'Earned' : badge.triggerLabel}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-6 py-8 text-center mt-8">
        <div className="font-serif text-[1.1rem] mb-[0.4rem]">SPD Cert Companion</div>
        <div className="text-xs text-teal">Helping sterile processing professionals pass their certification exams</div>
      </footer>
    </div>
  )
}
