'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pro' | 'lifetime'

interface SubscriptionState {
  plan: Plan
  status: string
  currentPeriodEnd: string | null
  usage: {
    questionsToday: number
    aiChatsToday: number
    questionsLimit: number | null
    aiChatsLimit: number | null
  } | null
  loading: boolean
  isPaid: boolean
  canAccessUnlimited: boolean
  questionsRemaining: number | null
  aiChatsRemaining: number | null
}

const DEFAULT_STATE: SubscriptionState = {
  plan: 'free',
  status: 'none',
  currentPeriodEnd: null,
  usage: null,
  loading: true,
  isPaid: false,
  canAccessUnlimited: false,
  questionsRemaining: 20,
  aiChatsRemaining: 5,
}

export function useSubscription(): SubscriptionState & { refresh: () => void } {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE)

  const fetch = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const res = await window.fetch('/api/payment/status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        setState((s) => ({ ...s, loading: false }))
        return
      }

      const data = await res.json()
      const plan: Plan = data.plan || 'free'
      const isPaid = plan === 'pro' || plan === 'lifetime'
      const usage = data.usage

      setState({
        plan,
        status: data.status || 'none',
        currentPeriodEnd: data.currentPeriodEnd,
        usage,
        loading: false,
        isPaid,
        canAccessUnlimited: isPaid,
        questionsRemaining: isPaid
          ? null
          : Math.max(0, (usage?.questionsLimit ?? 20) - (usage?.questionsToday ?? 0)),
        aiChatsRemaining: isPaid
          ? null
          : Math.max(0, (usage?.aiChatsLimit ?? 5) - (usage?.aiChatsToday ?? 0)),
      })
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { ...state, refresh: fetch }
}
