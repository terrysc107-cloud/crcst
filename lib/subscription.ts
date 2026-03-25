import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Plan = 'free' | 'pro' | 'lifetime'

export interface Subscription {
  id: string
  tier: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'active' | 'cancelled' | 'past_due'
  current_period_start: string | null
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface DailyUsage {
  user_id: string
  created_at: string
  questions_attempted: number
  ai_chats_used: number
}

export const FREE_LIMITS = {
  questionsPerHour: 20,
  flashcardsPerHour: 1,
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
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as Subscription
}

export async function getPlan(userId: string): Promise<Plan> {
  const sub = await getUserSubscription(userId)
  if (!sub || sub.status !== 'active') return 'free'
  return sub.tier
}

export async function getHourlyUsage(userId: string): Promise<DailyUsage> {
  const supabase = getServiceSupabase()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  // Sum all questions attempted within the last hour
  const { data, error } = await supabase
    .from('daily_usage')
    .select('questions_attempted, ai_chats_used')
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  if (error || !data || data.length === 0) {
    return { user_id: userId, created_at: new Date().toISOString(), questions_attempted: 0, ai_chats_used: 0 }
  }

  // Sum up all usage records from the past hour
  const totalQuestions = data.reduce((sum, record) => sum + (record.questions_attempted || 0), 0)
  const totalChats = data.reduce((sum, record) => sum + (record.ai_chats_used || 0), 0)

  return { 
    user_id: userId, 
    created_at: new Date().toISOString(), 
    questions_attempted: totalQuestions, 
    ai_chats_used: totalChats 
  }
}

export async function incrementDailyUsage(
  userId: string,
  field: 'questions_attempted' | 'ai_chats_used'
): Promise<{ success: boolean; newCount: number }> {
  const supabase = getServiceSupabase()
  const now = new Date().toISOString()

  // Try RPC first
  const { error: rpcError } = await supabase.rpc('increment_daily_usage', {
    p_user_id: userId,
    p_field: field,
  })

  // If RPC fails (doesn't exist), use upsert fallback
  if (rpcError) {
    console.log('[v0] RPC failed, using fallback insert:', rpcError.message)
    
    // Insert a new record for this usage event
    const insertData: any = {
      user_id: userId,
      created_at: now,
      questions_attempted: field === 'questions_attempted' ? 1 : 0,
      ai_chats_used: field === 'ai_chats_used' ? 1 : 0,
    }

    const { error: insertError } = await supabase
      .from('daily_usage')
      .insert(insertData)

    if (insertError) {
      console.error('[v0] Insert failed:', insertError.message)
      return { success: false, newCount: 0 }
    }
  }

  // Get updated count
  const usage = await getHourlyUsage(userId)
  const newCount = field === 'questions_attempted' ? usage.questions_attempted : usage.ai_chats_used
  
  return { success: true, newCount }
}

export async function canUserAccessPaidFeature(
  userId: string,
  feature: 'questions' | 'ai_chat'
): Promise<{ allowed: boolean; reason?: string; used?: number; limit?: number }> {
  const plan = await getPlan(userId)

  // Pro and lifetime users have unlimited access
  if (plan === 'pro' || plan === 'lifetime') {
    return { allowed: true, used: 0, limit: -1 }
  }

  // Free tier — check hourly limits for questions, daily for AI chat
  if (feature === 'questions') {
    const usage = await getHourlyUsage(userId)
    const used = usage.questions_attempted
    const limit = FREE_LIMITS.questionsPerHour
    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've used all ${limit} free questions this hour. Upgrade to Pro for unlimited access.`,
        used,
        limit,
      }
    }
    return { allowed: true, used, limit }
  }

  if (feature === 'ai_chat') {
    const today = new Date().toISOString().split('T')[0]
    const supabase = getServiceSupabase()
    
    const { data } = await supabase
      .from('daily_usage')
      .select('ai_chats_used')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const used = data?.ai_chats_used ?? 0
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

