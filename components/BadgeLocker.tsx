'use client'

import { BADGE_DEFINITIONS, RARITY_COLORS, type BadgeDefinition } from '@/lib/dal/badges'

interface Props {
  earnedBadgeIds: string[]
  earnedAtMap?: Record<string, string>  // badge_id → earned_at
}

export default function BadgeLocker({ earnedBadgeIds, earnedAtMap = {} }: Props) {
  const earned = new Set(earnedBadgeIds)

  const categories = [
    { key: 'exam',      label: 'Exam Milestones' },
    { key: 'questions', label: 'Question Count'  },
    { key: 'streak',    label: 'Streaks'          },
    { key: 'mastery',   label: 'Mastery'          },
    { key: 'social',    label: 'Engagement'       },
  ] as const

  return (
    <div>
      {categories.map(cat => {
        const badges = BADGE_DEFINITIONS.filter(b => b.category === cat.key)
        return (
          <div key={cat.key} style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
              fontFamily: 'monospace',
            }}>
              {cat.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {badges.map(badge => {
                const isEarned = earned.has(badge.id)
                const colors = RARITY_COLORS[badge.rarity]
                const earnedAt = earnedAtMap[badge.id]
                return (
                  <div
                    key={badge.id}
                    title={badge.description}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 10,
                      border: `1px solid ${isEarned ? colors.border : 'rgba(255,255,255,0.07)'}`,
                      background: isEarned ? colors.bg : 'rgba(255,255,255,0.02)',
                      opacity: isEarned ? 1 : 0.45,
                      filter: isEarned ? 'none' : 'grayscale(1)',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                      {isEarned ? badge.icon : '🔒'}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isEarned ? colors.text : 'rgba(255,255,255,0.3)',
                      marginBottom: '0.2rem',
                      lineHeight: 1.3,
                    }}>
                      {badge.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
                      {badge.description}
                    </div>
                    {isEarned && earnedAt && (
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.35rem' }}>
                        {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    <div style={{
                      marginTop: '0.35rem',
                      fontSize: '0.58rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: isEarned ? colors.text : 'rgba(255,255,255,0.2)',
                      opacity: 0.7,
                    }}>
                      {badge.rarity}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
