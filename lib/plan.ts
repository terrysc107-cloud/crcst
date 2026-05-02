import type { UserStudyState, DailyQuota } from './dal/study-plan'

export interface QuizConfig {
  cert: string
  mode: 'practice' | 'mock' | 'custom'
  questionCount: number
  domains: string[] | null
  difficulty: 'all' | 'easy' | 'medium' | 'hard'
  label: string
}

export function getTodaysPlan(state: UserStudyState, quota: DailyQuota): QuizConfig {
  const { daysRemaining, readinessScore, weakDomains, targetCert } = state
  const { totalMinutes, weakDomainQuestions, mockQuestions } = quota

  if (daysRemaining !== null && daysRemaining <= 7) {
    return {
      cert: targetCert,
      mode: 'mock',
      questionCount: Math.min(mockQuestions + weakDomainQuestions, 40),
      domains: null,
      difficulty: 'all',
      label: `Final Week: ${totalMinutes}-min mixed session`,
    }
  }

  if (weakDomains.length > 0 && readinessScore < 70) {
    return {
      cert: targetCert,
      mode: 'custom',
      questionCount: Math.min(weakDomainQuestions + 10, 30),
      domains: weakDomains.slice(0, 2),
      difficulty: readinessScore < 50 ? 'easy' : 'all',
      label: `Focus: ${weakDomains[0]} (${totalMinutes} min)`,
    }
  }

  if (readinessScore >= 80) {
    return {
      cert: targetCert,
      mode: 'mock',
      questionCount: Math.min(mockQuestions + 10, 30),
      domains: null,
      difficulty: 'hard',
      label: `Challenge mode: ${totalMinutes}-min session`,
    }
  }

  return {
    cert: targetCert,
    mode: 'practice',
    questionCount: Math.round((totalMinutes * 1.5 + 5) / 5) * 5,
    domains: weakDomains.length > 0 ? weakDomains.slice(0, 1) : null,
    difficulty: 'all',
    label: `Today's session: ${totalMinutes} min`,
  }
}

export function getCertPath(cert: string): string {
  const map: Record<string, string> = {
    CRCST: '/crcst',
    CHL: '/chl',
    CER: '/cer',
  }
  return map[cert.toUpperCase()] ?? '/crcst'
}

export function formatCountdown(examDate: string): {
  days: number
  label: string
  urgency: 'critical' | 'high' | 'medium' | 'low'
} {
  const days = Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000)

  if (days <= 0) return { days: 0, label: 'Exam day!', urgency: 'critical' }
  if (days === 1) return { days: 1, label: '1 day until your exam', urgency: 'critical' }
  if (days <= 7) return { days, label: `${days} days until your exam`, urgency: 'critical' }
  if (days <= 14) return { days, label: `${days} days until your exam`, urgency: 'high' }
  if (days <= 30) return { days, label: `${days} days until your exam`, urgency: 'medium' }
  return { days, label: `${days} days until your exam`, urgency: 'low' }
}
