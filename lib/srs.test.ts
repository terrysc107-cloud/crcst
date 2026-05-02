import { describe, it, expect } from 'vitest'
import { updateState, DEFAULT_STATE, type QuestionState } from './srs'

const TODAY = new Date('2026-01-15T12:00:00Z')

function dateOffset(days: number): string {
  const d = new Date(TODAY)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]
}

const initial: QuestionState = {
  ...DEFAULT_STATE,
  next_due: '2026-01-15',
}

describe('updateState — SM-2', () => {
  it('Certain (q=5): interval advances from 1→6 on first correct, ease increases', () => {
    const next = updateState(initial, 'correct', 5, TODAY)
    expect(next.interval_days).toBe(6)
    expect(next.ease).toBeGreaterThan(initial.ease)
    expect(next.next_due).toBe(dateOffset(6))
  })

  it('Confident (q=4): interval advances from 1→6, ease unchanged', () => {
    const next = updateState(initial, 'correct', 4, TODAY)
    expect(next.interval_days).toBe(6)
    // q=4: delta = 0.1 - 1*(0.08+0.02) = 0.0 — ease unchanged
    expect(next.ease).toBeCloseTo(initial.ease, 2)
    expect(next.next_due).toBe(dateOffset(6))
  })

  it('Guessed (q=1): interval resets to 1, ease decreases', () => {
    const next = updateState(initial, 'incorrect', 1, TODAY)
    expect(next.interval_days).toBe(1)
    expect(next.ease).toBeLessThan(initial.ease)
    expect(next.next_due).toBe(dateOffset(1))
  })

  it('Unsure (q=2): interval resets to 1, ease decreases', () => {
    const next = updateState(initial, 'incorrect', 2, TODAY)
    expect(next.interval_days).toBe(1)
    expect(next.ease).toBeLessThan(initial.ease)
  })

  it('ease never drops below 1.3', () => {
    let state: QuestionState = { ...initial, ease: 1.3 }
    state = updateState(state, 'incorrect', 1, TODAY)
    expect(state.ease).toBeGreaterThanOrEqual(1.3)
  })

  it('subsequent correct reviews multiply by ease factor', () => {
    // After first correct (interval=6) → second correct multiplies
    const afterFirst = updateState(initial, 'correct', 5, TODAY)
    const afterSecond = updateState(afterFirst, 'correct', 5, TODAY)
    expect(afterSecond.interval_days).toBe(Math.round(6 * afterFirst.ease))
  })

  it('Certain (q=5): interval at 6 advances correctly', () => {
    const state: QuestionState = { ease: 2.5, interval_days: 6, next_due: '2026-01-15' }
    const next = updateState(state, 'correct', 5, TODAY)
    expect(next.interval_days).toBe(Math.round(6 * 2.5))
    expect(next.next_due).toBe(dateOffset(Math.round(6 * 2.5)))
  })

  it('returns correct next_due date', () => {
    const next = updateState(initial, 'correct', 4, TODAY)
    expect(next.next_due).toBe('2026-01-21') // 15 + 6 days
  })
})
