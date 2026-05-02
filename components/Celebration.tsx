'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

type CelebrationType = 'confetti' | 'level_up' | 'badge' | 'streak'

interface Props {
  type: CelebrationType
  onDone?: () => void
}

const SOUNDS: Record<CelebrationType, string | null> = {
  confetti:  null,
  level_up:  '/sounds/level-up.mp3',
  badge:     '/sounds/badge.mp3',
  streak:    '/sounds/streak.mp3',
}

function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('celebration_sound') !== 'off'
}

function playSound(src: string) {
  if (!isSoundEnabled()) return
  try {
    const audio = new Audio(src)
    audio.volume = 0.4
    audio.play().catch(() => {})
  } catch {}
}

export default function Celebration({ type, onDone }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true

    const soundSrc = SOUNDS[type]
    if (soundSrc) playSound(soundSrc)

    if (type === 'level_up') {
      // Cannon burst from both sides
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#14BDAC', '#DAA520', '#fff'] })
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#14BDAC', '#DAA520', '#fff'] })
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#14BDAC', '#DAA520'] })
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#14BDAC', '#DAA520'] })
      }, 300)
    } else if (type === 'badge') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#8b5cf6', '#DAA520', '#14BDAC', '#fff'],
      })
    } else if (type === 'streak') {
      confetti({
        particleCount: 60,
        spread: 45,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#f97316', '#ef4444', '#DAA520'],
        shapes: ['circle'],
      })
    } else {
      // default confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14BDAC', '#DAA520', '#3b82f6', '#fff'],
      })
    }

    const timer = setTimeout(() => {
      onDone?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [type, onDone])

  return null  // purely side-effect component
}

// ──────────────────────────────────────────────────────────────────────────────
// Overlay variant — shows a toast-style banner with the celebration
// ──────────────────────────────────────────────────────────────────────────────

interface BannerProps {
  type: CelebrationType
  title: string
  subtitle?: string
  onDone?: () => void
}

export function CelebrationBanner({ type, title, subtitle, onDone }: BannerProps) {
  const icons: Record<CelebrationType, string> = {
    level_up: '⬆️',
    badge:    '🏅',
    streak:   '🔥',
    confetti: '🎉',
  }

  return (
    <>
      <Celebration type={type} onDone={onDone} />
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(13,27,58,0.95)',
        border: '1px solid rgba(20,189,172,0.4)',
        borderRadius: 12,
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'slideDown 0.4s ease',
        minWidth: 240,
        maxWidth: '90vw',
      }}>
        <span style={{ fontSize: '1.75rem' }}>{icons[type]}</span>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>{subtitle}</div>}
        </div>
      </div>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Sound toggle button — for use in settings / account page
// ──────────────────────────────────────────────────────────────────────────────

export function SoundToggle() {
  const enabled = typeof window !== 'undefined'
    ? localStorage.getItem('celebration_sound') !== 'off'
    : true

  function toggle() {
    if (enabled) {
      localStorage.setItem('celebration_sound', 'off')
    } else {
      localStorage.removeItem('celebration_sound')
    }
    window.location.reload()  // simple refresh to re-read state
  }

  return (
    <button
      onClick={toggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'none',
        border: '1px solid rgba(255,255,255,0.15)',
        color: enabled ? '#14BDAC' : 'rgba(255,255,255,0.4)',
        padding: '0.45rem 0.9rem',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontFamily: 'inherit',
      }}
    >
      {enabled ? '🔊' : '🔇'} Sound {enabled ? 'On' : 'Off'}
    </button>
  )
}
