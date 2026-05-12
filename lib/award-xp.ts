import type { QuizActivityType, CertType } from '@/app/api/xp/award/route'

// Map quiz page mode strings to the canonical activity types the API accepts
const MODE_MAP: Record<string, QuizActivityType> = {
  practice:   'practice',
  quiz:       'practice',
  flashcards: 'flashcard',
  flashcard:  'flashcard',
  custom:     'custom',
  test:       'test',
  homework:   'homework',
}

interface AwardXpParams {
  mode: string
  cert: CertType
  correct: number
  total: number
  elapsedSeconds: number
  domains?: Record<string, { correct: number; total: number }>
  accessToken: string
}

/**
 * Fire-and-forget XP award for any non-progression quiz completion.
 * Call this after saving quiz results. Never awaited — failures are silent.
 */
export function awardQuizXp(params: AwardXpParams): void {
  const activityType = MODE_MAP[params.mode] ?? 'practice'

  fetch('/api/xp/award', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      activityType,
      cert: params.cert,
      correct: params.correct,
      total: params.total,
      elapsedSeconds: params.elapsedSeconds,
      domains: params.domains,
    }),
  }).catch(() => {
    // XP award failure is non-blocking — quiz result already saved
  })
}
