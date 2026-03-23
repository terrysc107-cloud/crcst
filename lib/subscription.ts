import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Plan = 'free' | 'pro' | 'lifetime'

export interface Subscription {
  user_id: string
  plan: Plan
  square_subscription_id: string | null
  square_customer_id: string | null
  status: 'active' | 'cancelled' | 'past_due' | 'paused'
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface DailyUsage {
  user_id: string
  date: string
  questions_attempted: number
  ai_chats_used: number
}

export const FREE_LIMITS = {
  questionsPerDay: 20,
  aiChatsPerDay: 5,
}

export function getServiceSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as Subscription
}

export async function getPlan(userId: string): Promise<Plan> {
  const sub = await getUserSubscription(userId)
  if (!sub || sub.status !== 'active') return 'free'
  return sub.plan
}

export async function getTodayUsage(userId: string): Promise<DailyUsage> {
  const supabase = getServiceSupabase()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('daily_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (!data) {
    return { user_id: userId, date: today, questions_attempted: 0, ai_chats_used: 0 }
  }
  return data as DailyUsage
}

export async function incrementDailyUsage(
  userId: string,
  field: 'questions_attempted' | 'ai_chats_used'
): Promise<void> {
  const supabase = getServiceSupabase()
  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('increment_daily_usage', {
    p_user_id: userId,
    p_date: today,
    p_field: field,
  })
}

export async function canUserAccessPaidFeature(
  userId: string,
  feature: 'questions' | 'ai_chat'
): Promise<{ allowed: boolean; reason?: string; used?: number; limit?: number }> {
  const plan = await getPlan(userId)

  if (plan === 'pro' || plan === 'lifetime') {
    return { allowed: true }
  }

  // Free tier — check daily limits
  const usage = await getTodayUsage(userId)

  if (feature === 'questions') {
    const used = usage.questions_attempted
    const limit = FREE_LIMITS.questionsPerDay
    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've used all ${limit} free questions for today. Upgrade to Pro for unlimited access.`,
        used,
        limit,
      }
    }
    return { allowed: true, used, limit }
  }

  if (feature === 'ai_chat') {
    const used = usage.ai_chats_used
    const limit = FREE_LIMITS.aiChatsPerDay
    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've used all ${limit} free AI chats for today. Upgrade to Pro for unlimited access.`,
        used,
        limit,
      }
    }
    return { allowed: true, used, limit }
  }

  return { allowed: true }
}
