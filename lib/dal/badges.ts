import { createClient } from '@supabase/supabase-js'

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string        // emoji or lucide icon name
  category: 'streak' | 'questions' | 'mastery' | 'exam' | 'social'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    category: 'exam',
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: '7-Day Streak',
    description: 'Study 7 days in a row',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
  },
  {
    id: 'streak_30',
    name: '30-Day Streak',
    description: 'Study 30 days in a row',
    icon: '🌟',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'streak_100',
    name: 'Century Streak',
    description: 'Study 100 days in a row',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
  },
  {
    id: 'questions_100',
    name: '100 Questions',
    description: 'Answer 100 questions',
    icon: '📚',
    category: 'questions',
    rarity: 'common',
  },
  {
    id: 'questions_500',
    name: '500 Questions',
    description: 'Answer 500 questions',
    icon: '📖',
    category: 'questions',
    rarity: 'rare',
  },
  {
    id: 'questions_1000',
    name: '1000 Questions',
    description: 'Answer 1,000 questions',
    icon: '🏆',
    category: 'questions',
    rarity: 'epic',
  },
  {
    id: 'domain_mastered',
    name: 'Domain Mastered',
    description: 'Score ≥85% in a single domain',
    icon: '🎓',
    category: 'mastery',
    rarity: 'rare',
  },
  {
    id: 'mock_exam_passed',
    name: 'Mock Champion',
    description: 'Pass a mock exam (≥70%)',
    icon: '🥇',
    category: 'exam',
    rarity: 'rare',
  },
  {
    id: 'flawless_run',
    name: 'Flawless Run',
    description: 'Answer 20 questions correctly in a row',
    icon: '⚡',
    category: 'mastery',
    rarity: 'epic',
  },
  {
    id: 'ai_power_user',
    name: 'AI Power User',
    description: 'Ask AI to explain 25 questions',
    icon: '🤖',
    category: 'social',
    rarity: 'rare',
  },
  {
    id: 'daily_challenge_first',
    name: 'Daily Challenger',
    description: 'Complete your first Daily Challenge',
    icon: '📅',
    category: 'exam',
    rarity: 'common',
  },
  {
    id: 'daily_challenge_week',
    name: 'Weekly Warrior',
    description: 'Complete the Daily Challenge 7 days in a row',
    icon: '⚔️',
    category: 'streak',
    rarity: 'rare',
  },
]

export const RARITY_COLORS = {
  common:    { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', text: '#94a3b8' },
  rare:      { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  text: '#3b82f6' },
  epic:      { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.4)',  text: '#8b5cf6' },
  legendary: { bg: 'rgba(218,165,32,0.15)',  border: 'rgba(218,165,32,0.4)',  text: '#DAA520' },
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function getEarnedBadges(userId: string): Promise<Array<BadgeDefinition & { earned_at: string }>> {
  const sb = getServiceClient()
  const { data } = await sb
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })

  if (!data) return []

  return data
    .map(row => {
      const def = BADGE_DEFINITIONS.find(b => b.id === row.badge_id)
      if (!def) return null
      return { ...def, earned_at: row.earned_at }
    })
    .filter(Boolean) as Array<BadgeDefinition & { earned_at: string }>
}

export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  const sb = getServiceClient()
  const { error } = await sb.from('user_badges').insert({
    user_id: userId,
    badge_id: badgeId,
  })
  // Returns true if newly awarded (error = duplicate = already had it)
  return !error
}

export interface BadgeCheckInput {
  userId: string
  totalQuizzes: number
  currentStreak: number
  totalQuestionsAnswered: number
  bestDomainPct: number         // highest domain score across all quizzes
  mockPassed: boolean
  consecutiveCorrect: number    // current run in this quiz
  aiChatsTotal: number
  dailyChallengesCompleted: number
  dailyChallengeStreak: number
}

export async function checkAndAwardBadges(input: BadgeCheckInput): Promise<string[]> {
  const sb = getServiceClient()
  const { data: existing } = await sb
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', input.userId)

  const alreadyEarned = new Set((existing ?? []).map(r => r.badge_id))
  const newlyEarned: string[] = []

  const maybe = async (badgeId: string, condition: boolean) => {
    if (condition && !alreadyEarned.has(badgeId)) {
      const awarded = await awardBadge(input.userId, badgeId)
      if (awarded) newlyEarned.push(badgeId)
    }
  }

  await maybe('first_quiz',            input.totalQuizzes >= 1)
  await maybe('streak_7',              input.currentStreak >= 7)
  await maybe('streak_30',             input.currentStreak >= 30)
  await maybe('streak_100',            input.currentStreak >= 100)
  await maybe('questions_100',         input.totalQuestionsAnswered >= 100)
  await maybe('questions_500',         input.totalQuestionsAnswered >= 500)
  await maybe('questions_1000',        input.totalQuestionsAnswered >= 1000)
  await maybe('domain_mastered',       input.bestDomainPct >= 85)
  await maybe('mock_exam_passed',      input.mockPassed)
  await maybe('flawless_run',          input.consecutiveCorrect >= 20)
  await maybe('ai_power_user',         input.aiChatsTotal >= 25)
  await maybe('daily_challenge_first', input.dailyChallengesCompleted >= 1)
  await maybe('daily_challenge_week',  input.dailyChallengeStreak >= 7)

  return newlyEarned
}
