'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PROGRESSION_LEVELS, BONUS_MODULES, PROGRESSION_BADGES, getXpTier, getNextXpTier } from '@/lib/progression-config'
import { useSubscription } from '@/hooks/useSubscription'
import { Progress } from '@/components/ui/progress'

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid rgba(20,189,172,0.2)',
            borderTopColor: 'var(--teal)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!sub.isPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center" style={{ background: '#0D1B2A' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(20,189,172,0.1)', border: '1px solid rgba(20,189,172,0.3)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--teal)' }}>
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
        <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', letterSpacing: '0.14em', color: 'var(--teal)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Pro Feature
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 700, color: '#F5F0E8', lineHeight: 1.2, marginBottom: '1rem', maxWidth: 420 }}>
          Progression Mode requires a Pro subscription
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'rgba(245,240,232,0.5)', lineHeight: 1.65, maxWidth: 380, marginBottom: '2rem' }}>
          Unlock the full Progression Challenge — {PROGRESSION_LEVELS.length} sequential levels, XP rewards, badges, and bonus content — with a Pro or Triple Crown plan.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/pricing" style={{ display: 'block', textAlign: 'center', padding: '0.9rem', background: 'linear-gradient(135deg, var(--teal), var(--teal-dark))', color: '#0D1B2A', borderRadius: 10, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.04em', textDecoration: 'none' }}>
            Upgrade to Pro →
          </Link>
          <Link href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '0.9rem', background: 'transparent', color: 'rgba(245,240,232,0.4)', border: '1px solid rgba(245,240,232,0.1)', borderRadius: 10, fontSize: '0.85rem', fontFamily: 'monospace', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <header className="px-4 sm:px-6 py-4" style={{ background: '#0D1B2A', color: '#fff' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'var(--teal)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              SP
            </div>
            <div className="min-w-0">
              <div style={{ fontFamily: 'serif', fontSize: '1.1rem', fontWeight: 700 }} className="truncate">
                SPD Cert Companion
              </div>
              <div className="hidden sm:block" style={{ fontSize: '0.72rem', color: 'var(--teal)', letterSpacing: '0.04em' }}>
                Sterile Processing Certification Prep
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex-shrink-0"
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
            }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div
        className="px-4 sm:px-6 py-12 sm:py-16 text-center"
        style={{
          background: 'linear-gradient(to bottom, #0D1B2A, #2A3A4A)',
          color: '#fff',
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              color: 'var(--teal)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            The Unlock Challenge
          </div>
          <h1
            style={{
              fontFamily: 'serif',
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Knowledge is{' '}
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>earned</em>, not accessed.
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 480,
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            Work through {PROGRESSION_LEVELS.length} sequential levels covering the full CRCST domain. Each level
            unlocks the next. Pass a level to advance — or prove mastery to unlock bonus
            content.
          </p>

          {/* Progress bar */}
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between text-[0.75rem] text-white/50 mb-2">
              <span>Progress</span>
              <span className="text-teal font-semibold">
                {completedCount} of {PROGRESSION_LEVELS.length} levels completed
              </span>
            </div>
            <Progress
              value={(completedCount / PROGRESSION_LEVELS.length) * 100}
              color="teal"
              className="h-2"
            />

            {/* XP display */}
            {(() => {
              const tier = getXpTier(totalXp)
              const next = getNextXpTier(totalXp)
              return (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      letterSpacing: '0.12em',
                      fontFamily: 'monospace',
                      color: tier.color,
                      textTransform: 'uppercase',
                      border: `1px solid ${tier.color}`,
                      borderRadius: 100,
                      padding: '0.15rem 0.6rem',
                      opacity: 0.9,
                    }}>
                      {tier.label}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: tier.color }}>
                      {totalXp} XP
                    </span>
                  </div>
                  {next && (
                    <div style={{ fontSize: '0.7rem', color: 'rgba(245,240,232,0.35)', fontFamily: 'monospace' }}>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Section label */}
        <div
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: 'rgba(13,27,42,0.45)',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
            fontFamily: 'monospace',
          }}
        >
          Core Levels
        </div>

        {/* Level cards — vertical stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
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
                  style={{
                    position: 'relative',
                    background: '#fff',
                    borderRadius: 14,
                    padding: '1.25rem 1rem',
                    cursor: isLocked ? 'default' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    filter: isLocked ? 'grayscale(1)' : 'none',
                    border: isUnlocked
                      ? '2px solid var(--teal)'
                      : isCompleted
                      ? '2px solid rgba(20,189,172,0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isUnlocked
                      ? '0 0 0 4px rgba(20,189,172,0.12)'
                      : isCompleted
                      ? '0 2px 8px rgba(0,0,0,0.06)'
                      : '0 1px 4px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                  }}
                >
                  {/* Lock icon — locked state */}
                  {isLocked && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: 'rgba(13,27,42,0.35)',
                      }}
                    >
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                    </div>
                  )}

                  {/* Checkmark badge — completed state */}
                  {isCompleted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: 26,
                        height: 26,
                        background: 'rgba(20,189,172,0.12)',
                        border: '1px solid rgba(20,189,172,0.4)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--teal)',
                      }}
                    >
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                    {/* Level number circle */}
                    <div
                      className="flex-shrink-0"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: isCompleted
                          ? 'rgba(20,189,172,0.12)'
                          : isUnlocked
                          ? 'var(--teal)'
                          : 'rgba(13,27,42,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'serif',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: isUnlocked ? '#fff' : isCompleted ? 'var(--teal)' : 'rgba(13,27,42,0.4)',
                      }}
                    >
                      {level.id}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingRight: isLocked || isCompleted ? '2rem' : 0 }}>
                      <div
                        style={{
                          fontFamily: 'serif',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: '#0D1B2A',
                          marginBottom: '0.2rem',
                        }}
                      >
                        Level {level.id}: {level.name}
                      </div>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'rgba(13,27,42,0.6)',
                          lineHeight: 1.55,
                          marginBottom: '0.75rem',
                        }}
                      >
                        {level.description}
                      </p>

                      {/* Domain tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' }}>
                        {level.domains.map((domain) => (
                          <span
                            key={domain}
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'monospace',
                              letterSpacing: '0.04em',
                              padding: '0.2rem 0.55rem',
                              borderRadius: 100,
                              background: 'rgba(13,27,42,0.06)',
                              color: 'rgba(13,27,42,0.55)',
                              border: '1px solid rgba(13,27,42,0.1)',
                            }}
                          >
                            {domain}
                          </span>
                        ))}
                      </div>

                      {/* Bottom row: score + action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {/* Best score */}
                        {isCompleted && score != null && (
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontFamily: 'monospace',
                              color: 'var(--teal)',
                              fontWeight: 600,
                            }}
                          >
                            Best: {score}%
                          </span>
                        )}
                        {!isCompleted && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                              color: 'rgba(13,27,42,0.35)',
                            }}
                          >
                            {level.questionCount} questions · {level.passingScore}% to pass
                          </span>
                        )}

                        {/* Action button */}
                        {isUnlocked && (
                          <Link
                            href={`/progression/${level.id}`}
                            style={{
                              display: 'inline-block',
                              background: 'var(--teal)',
                              color: '#fff',
                              padding: '0.45rem 1.1rem',
                              borderRadius: 8,
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              letterSpacing: '0.03em',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Start Challenge →
                          </Link>
                        )}

                        {isCompleted && (
                          <Link
                            href={`/progression/${level.id}`}
                            style={{
                              fontSize: '0.78rem',
                              fontFamily: 'monospace',
                              color: 'rgba(13,27,42,0.45)',
                              textDecoration: 'underline',
                              letterSpacing: '0.02em',
                            }}
                          >
                            Retake
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Locked inline message */}
                {isLocked && showMessage && (
                  <div
                    style={{
                      marginTop: '0.4rem',
                      padding: '0.6rem 1rem',
                      borderRadius: 8,
                      background: 'rgba(13,27,42,0.06)',
                      border: '1px solid rgba(13,27,42,0.1)',
                      fontSize: '0.8rem',
                      color: 'rgba(13,27,42,0.55)',
                      fontFamily: 'monospace',
                    }}
                  >
                    Complete Level {level.id - 1} to unlock this
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Weak Spots */}
        {weakSpots.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              fontSize: '0.68rem',
              letterSpacing: '0.12em',
              color: 'rgba(13,27,42,0.45)',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              fontFamily: 'monospace',
            }}>
              Your Weak Spots
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid rgba(13,27,42,0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(13,27,42,0.07)',
                fontSize: '0.78rem',
                color: 'rgba(13,27,42,0.45)',
                fontFamily: 'monospace',
                letterSpacing: '0.02em',
              }}>
                Domains where you score lowest — based on your quiz history
              </div>
              {weakSpots.map((spot, i) => {
                const color = spot.accuracy < 50 ? '#EF4444' : spot.accuracy < 70 ? 'var(--amber)' : 'var(--teal)'
                return (
                  <div key={spot.name} style={{
                    padding: '1rem 1.25rem',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(13,27,42,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${color}12`,
                        border: `1px solid ${color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color,
                      }}>
                        {spot.accuracy}%
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0D1B2A', marginBottom: '0.15rem' }} className="truncate">
                          {spot.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(13,27,42,0.4)', fontFamily: 'monospace' }}>
                          {spot.total} questions answered
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/crcst?domain=${encodeURIComponent(spot.name)}`}
                      style={{
                        flexShrink: 0,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: 'var(--teal)',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap' as const,
                        padding: '0.4rem 0.9rem',
                        borderRadius: 7,
                        border: '1px solid rgba(20,189,172,0.3)',
                        background: 'rgba(20,189,172,0.06)',
                      }}
                    >
                      Practice →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bonus modules */}
        <div
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: 'rgba(13,27,42,0.45)',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
            fontFamily: 'monospace',
          }}
        >
          Bonus Modules
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {BONUS_MODULES.map((module) => {
            const isUnlockedBonus = unlockedBonuses.has(module.id)

            return (
              <div
                key={module.id}
                style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: 14,
                  padding: '1.25rem 1rem',
                  opacity: isUnlockedBonus ? 1 : 0.55,
                  border: isUnlockedBonus
                    ? '2px solid rgba(218,165,32,0.5)'
                    : '1px solid rgba(13,27,42,0.1)',
                  boxShadow: isUnlockedBonus
                    ? '0 0 0 4px rgba(218,165,32,0.08)'
                    : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Lock icon for locked bonus */}
                {!isUnlockedBonus && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      color: 'rgba(13,27,42,0.3)',
                    }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Amber accent dot */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: isUnlockedBonus ? 'var(--amber)' : 'rgba(13,27,42,0.15)',
                      marginTop: '0.35rem',
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: isUnlockedBonus ? '#0D1B2A' : 'rgba(13,27,42,0.7)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {module.title}
                    </div>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'rgba(13,27,42,0.55)',
                        lineHeight: 1.55,
                        marginBottom: '0.75rem',
                      }}
                    >
                      {module.description}
                    </p>

                    {/* Locked label */}
                    {!isUnlockedBonus && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          color: 'rgba(13,27,42,0.4)',
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                        {module.lockedLabel}
                      </div>
                    )}

                    {/* Open button — unlocked */}
                    {isUnlockedBonus && (
                      <Link
                        href={`/progression/bonus/${module.id}`}
                        style={{
                          display: 'inline-block',
                          background: 'rgba(218,165,32,0.12)',
                          border: '1px solid rgba(218,165,32,0.5)',
                          color: 'var(--amber)',
                          padding: '0.4rem 1rem',
                          borderRadius: 8,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          letterSpacing: '0.03em',
                          textDecoration: 'none',
                        }}
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
        <div
          style={{
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            color: 'rgba(13,27,42,0.45)',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
            fontFamily: 'monospace',
          }}
        >
          Badge Locker
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PROGRESSION_BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id)
            return (
              <div
                key={badge.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '1rem',
                  textAlign: 'center',
                  border: earned
                    ? `2px solid ${badge.color}60`
                    : '1px solid rgba(13,27,42,0.09)',
                  boxShadow: earned
                    ? `0 0 0 4px ${badge.color}12`
                    : '0 1px 4px rgba(0,0,0,0.04)',
                  opacity: earned ? 1 : 0.5,
                  filter: earned ? 'none' : 'grayscale(1)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: earned ? `${badge.color}18` : 'rgba(13,27,42,0.06)',
                  border: earned ? `1px solid ${badge.color}50` : '1px solid rgba(13,27,42,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  margin: '0 auto 0.6rem',
                }}>
                  {badge.icon}
                </div>
                <div style={{
                  fontFamily: 'serif',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: earned ? '#0D1B2A' : 'rgba(13,27,42,0.5)',
                  marginBottom: '0.3rem',
                  lineHeight: 1.3,
                }}>
                  {badge.name}
                </div>
                <div style={{
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  color: earned ? badge.color : 'rgba(13,27,42,0.35)',
                  letterSpacing: '0.03em',
                }}>
                  {earned ? 'Earned' : badge.triggerLabel}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-4 py-8 text-center mt-8"
        style={{
          background: '#0D1B2A',
          color: '#fff',
        }}
      >
        <div style={{ fontFamily: 'serif', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
          SPD Cert Companion
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--teal)' }}>
          Helping sterile processing professionals pass their certification exams
        </div>
      </footer>
    </div>
  )
}
