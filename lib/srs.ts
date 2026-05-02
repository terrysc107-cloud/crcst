export interface QuestionState {
  ease: number
  interval_days: number
  next_due: string // YYYY-MM-DD
}

// 4-point confidence scale: Guessed=1, Unsure=2, Confident=4, Certain=5
// Maps directly onto SM-2's q scale (0–5), skipping 3
export type ConfidenceRating = 1 | 2 | 4 | 5

export const DEFAULT_STATE: Omit<QuestionState, 'next_due'> = {
  ease: 2.5,
  interval_days: 1,
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

// SM-2 algorithm — pure, no I/O
// q < 3 (Guessed/Unsure): incorrect → reset interval to 1, apply ease penalty
// q >= 3 (Confident/Certain): correct → advance interval, adjust ease
export function updateState(
  state: QuestionState,
  result: 'correct' | 'incorrect',
  confidence: ConfidenceRating,
  today: Date = new Date()
): QuestionState {
  const q = confidence

  // SM-2 EF formula: EF' = EF + 0.1 - (5-q)*(0.08 + (5-q)*0.02)
  const easeDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  const newEase = Math.max(1.3, state.ease + easeDelta)

  let newInterval: number
  if (q >= 3) {
    // Correct: advance through SM-2 interval ladder
    newInterval =
      state.interval_days <= 1
        ? 6
        : Math.round(state.interval_days * state.ease)
  } else {
    // Incorrect: reset to beginning
    newInterval = 1
  }

  const nextDate = new Date(today)
  nextDate.setUTCDate(nextDate.getUTCDate() + newInterval)

  return {
    ease: Math.round(newEase * 1000) / 1000,
    interval_days: newInterval,
    next_due: toISODate(nextDate),
  }
}
