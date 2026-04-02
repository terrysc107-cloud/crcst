import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Plan = 'free' | 'pro' | 'triple_crown'

export interface UserTier {
  id: string
  tier: Plan
  tier_expires_at: string | null
  stripe_customer_id: string | null
}

export interface DailyUsage {
  user_id: string
  created_at: string
  questions_attempted: number
  ai_chats_used: number
}

export const FREE_LIMITS = {
  questionsPerHour: 20, // Includes both quiz questions and flashcards
  aiChatsPerDay: 5,
}

// Available certifications by tier
export const TIER_CERTS: Record<Plan, string[]> = {
  free: ['crcst'],
  pro: ['crcst'],
  triple_crown: ['crcst', 'chl', 'cer'],
}

export function getServiceSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Check if tier is expired
export function isTierExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

// Get effective tier (returns 'free' if expired)
export function getEffectiveTier(tier: Plan, expiresAt: string | null): Plan {
  if (tier === 'free') return 'free'
  if (isTierExpired(expiresAt)) return 'free'
  return tier
}

export async function getUserTier(userId: string): Promise<UserTier | null> {
  const supabase = getServiceSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, tier, tier_expires_at, stripe_customer_id')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as UserTier
}

// Legacy function for backward compatibility
export async function getUserSubscription(userId: string): Promise<{ tier: Plan; status: string; current_period_end: string | null } | null> {
  const userTier = await getUserTier(userId)
  if (!userTier) return null
  
  const effectiveTier = getEffectiveTier(userTier.tier as Plan, userTier.tier_expires_at)
  return {
    tier: effectiveTier,
    status: effectiveTier !== 'free' ? 'active' : 'none',
    current_period_end: userTier.tier_expires_at,
  }
}

export async function getPlan(userId: string): Promise<Plan> {
  const userTier = await getUserTier(userId)
  if (!userTier) return 'free'
  return getEffectiveTier(userTier.tier as Plan, userTier.tier_expires_at)
}

// Check if user can access a specific cert
export async function canAccessCert(userId: string, cert: 'crcst' | 'chl' | 'cer'): Promise<boolean> {
  const plan = await getPlan(userId)
  return TIER_CERTS[plan].includes(cert)
}

export async function getHourlyUsage(userId: string): Promise<DailyUsage> {
  const supabase = getServiceSupabase()

  // Use RPC to bypass schema cache issues
  const { data, error } = await supabase.rpc('get_hourly_usage', {
    p_user_id: userId,
  })

  if (error || !data || data.length === 0) {
    return { user_id: userId, created_at: new Date().toISOString(), questions_attempted: 0, ai_chats_used: 0 }
  }

  // RPC returns { questions_count, chats_count }
  const row = data[0] || { questions_count: 0, chats_count: 0 }

  return { 
    user_id: userId, 
    created_at: new Date().toISOString(), 
    questions_attempted: Number(row.questions_count) || 0, 
    ai_chats_used: Number(row.chats_count) || 0 
  }
}

export async function getDailyAiChatUsage(userId: string): Promise<number> {
  const supabase = getServiceSupabase()

  // Use RPC to bypass schema cache issues
  const { data, error } = await supabase.rpc('get_daily_ai_chat_usage', {
    p_user_id: userId,
  })

  if (error) {
    console.error('[v0] get_daily_ai_chat_usage RPC failed:', error.message)
    return 0
  }

  return Number(data) || 0
}

export async function incrementDailyUsage(
  userId: string,
  field: 'questions_attempted' | 'ai_chats_used'
): Promise<{ success: boolean; newCount: number }> {
  const supabase = getServiceSupabase()
  
  const questionsVal = field === 'questions_attempted' ? 1 : 0
  const chatsVal = field === 'ai_chats_used' ? 1 : 0
  
  // Use the new insert_daily_usage RPC function (bypasses schema cache)
  const { error } = await supabase.rpc('insert_daily_usage', {
    p_user_id: userId,
    p_questions: questionsVal,
    p_chats: chatsVal,
  })

  if (error) {
    console.error('[v0] insert_daily_usage RPC failed:', error.message)
    return { success: false, newCount: 0 }
  }

  // Get updated hourly count
  const usage = await getHourlyUsage(userId)
  const newCount = field === 'questions_attempted' ? usage.questions_attempted : usage.ai_chats_used
  
  return { success: true, newCount }
}

export async function canUserAccessPaidFeature(
  userId: string,
  feature: 'questions' | 'ai_chat'
): Promise<{ allowed: boolean; reason?: string; used?: number; limit?: number }> {
  const plan = await getPlan(userId)

  // Pro and Triple Crown users have unlimited access
  if (plan === 'pro' || plan === 'triple_crown') {
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
    // Use RPC to bypass schema cache issues
    const used = await getDailyAiChatUsage(userId)
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

