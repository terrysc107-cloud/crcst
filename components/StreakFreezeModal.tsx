'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Props {
  freezeCredits: number
  currentStreak: number
  streakBroken: boolean
  onClose: () => void
  onFreezeUsed: (newStreak: number, creditsLeft: number) => void
}

export default function StreakFreezeModal({ freezeCredits, currentStreak, streakBroken, onClose, onFreezeUsed }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFreeze() {
    setLoading(true)
    setError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/streaks/freeze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to use freeze.')
        return
      }
      onFreezeUsed(data.streak, data.creditsLeft)
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1b2a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: '2rem',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🧊</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
          {streakBroken ? 'Streak Broken!' : 'Streak Freeze'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {streakBroken
            ? `You missed a day and lost your ${currentStreak}-day streak. Use a Streak Freeze to restore it!`
            : `Protect your ${currentStreak}-day streak for a day you can't study.`}
        </p>

        <div style={{
          background: 'rgba(20,189,172,0.08)',
          border: '1px solid rgba(20,189,172,0.2)',
          borderRadius: 10,
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Freeze credits available</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#14BDAC' }}>{freezeCredits}</span>
        </div>

        {error && (
          <p style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleFreeze}
            disabled={loading || freezeCredits < 1}
            style={{
              flex: 1,
              padding: '0.65rem',
              borderRadius: 8,
              background: freezeCredits < 1 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #0D7377, #14BDAC)',
              color: freezeCredits < 1 ? 'rgba(255,255,255,0.3)' : '#fff',
              border: 'none',
              cursor: freezeCredits < 1 || loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Using…' : freezeCredits < 1 ? 'No Credits' : 'Use Freeze ❄️'}
          </button>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>
          You earn 1 free freeze credit per week. Pro users earn an extra credit each month.
        </p>
      </div>
    </div>
  )
}
