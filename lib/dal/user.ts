import { createServiceClient } from '@/lib/supabase/server'
import type { Plan } from '@/lib/types/database'

export async function getProfile(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, tier, tier_expires_at, stripe_customer_id')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data
}

export async function updateProfile(userId: string, updates: { tier?: Plan; tier_expires_at?: string | null }) {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { error }
}

export async function getCertifiedUsers(userId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('certified_users')
    .select('cert, full_name, pass_date, claimed_at')
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false })
  if (error) return []
  return data ?? []
}
