'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pro' | 'triple_crown'

interface SubscriptionState {
  plan: Plan
  status: string
  tierExpiresAt: string | null
  usage: {
    questionsToday: number
    aiChatsToday: number
    questionsLimit: number | null
    aiChatsLimit: number | null
  } | null
  loading: boolean
  error: boolean
  isPaid: boolean
  canAccessUnlimited: boolean
  canAccessCHL: boolean
  canAccessCER: boolean
  questionsRemaining: number | null
  aiChatsRemaining: number | null
}

const DEFAULT_STATE: SubscriptionState = {
  plan: 'free',
  status: 'none',
  tierExpiresAt: null,
  usage: null,
  loading: true,
  error: false,
  isPaid: false,
  canAccessUnlimited: false,
  canAccessCHL: false,
  canAccessCER: false,
  questionsRemaining: 15,
  aiChatsRemaining: null,
}

export function useSubscription(): SubscriptionState & { refresh: () => void } {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE)

  const fetchData = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const res = await window.fetch('/api/payment/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        setState((s) => ({ ...s, loading: false, error: true }))
        return
      }

      const data = await res.json()
      const plan: Plan = data.plan || 'free'
      const isPaid = plan === 'pro' || plan === 'triple_crown'
      const isTripleCrown = plan === 'triple_crown'
      const usage = data.usage

      setState({
        plan,
        status: data.status || 'none',
        tierExpiresAt: data.currentPeriodEnd,
        usage,
        loading: false,
        error: false,
        isPaid,
        canAccessUnlimited: isPaid,
        canAccessCHL: isTripleCrown,
        canAccessCER: isTripleCrown,
        questionsRemaining: isPaid
          ? null
          : Math.max(0, (usage?.questionsLimit ?? 15) - (usage?.questionsToday ?? 0)),
        aiChatsRemaining: null,
      })
    } catch {
      setState((s) => ({ ...s, loading: false, error: true }))
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return { ...state, refresh: fetchData }
}
