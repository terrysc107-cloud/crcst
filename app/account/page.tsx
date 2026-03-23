'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface StatusData {
  plan: 'free' | 'pro' | 'lifetime'
  status: string
  currentPeriodEnd: string | null
  usage: {
    questionsToday: number
    aiChatsToday: number
    questionsLimit: number | null
    aiChatsLimit: number | null
  }
}

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/'); return }
      setUser({ id: u.id, email: u.email! })

      const session = await supabase.auth.getSession()
      const res = await fetch('/api/payment/status', {
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      })
      if (res.ok) setStatusData(await res.json())
    }
    load()
  }, [router])

  async function handleCancel() {
    if (!confirm('Cancel your Pro subscription? You will keep access until the end of your billing period.')) return
    setCancelling(true)
    try {
      const session = await supabase.auth.getSession()
      const res = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.data.session?.access_token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setCancelDone(true)
        if (statusData) setStatusData({ ...statusData, status: 'cancelled' })
      } else {
        alert(data.error || 'Failed to cancel.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user || !statusData) {
    return (
      <div style={{ minHeight: '100vh', background: '#021B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
        Loading…
      </div>
    )
  }

  const planLabel = { free: 'Free', pro: 'Pro', lifetime: 'Lifetime' }[statusData.plan]
  const planColor = { free: 'rgba(255,255,255,0.4)', pro: '#14BDAC', lifetime: '#DAA520' }[statusData.plan]

  return (
    <div style={{ minHeight: '100vh', background: '#021B3A', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: 36, height: 36, background: '#14BDAC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>SP</div>
          <span style={{ fontWeight: 600 }}>SPD Cert Companion</span>
        </Link>
        <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: 640, margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '2rem' }}>Account & Billing</h1>

        {/* Plan card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Current Plan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: planColor }}>{planLabel}</span>
                {statusData.status === 'cancelled' && (
                  <span style={{ fontSize: '0.75rem', background: 'rgba(220,50,50,0.15)', border: '1px solid rgba(220,50,50,0.3)', color: '#f87171', padding: '0.2rem 0.6rem', borderRadius: 100 }}>
                    Cancelled
                  </span>
                )}
              </div>
            </div>
            {statusData.plan === 'free' && (
              <Link href="/pricing" style={{ background: 'linear-gradient(135deg, #0D7377, #14BDAC)', color: '#fff', textDecoration: 'none', padding: '0.6rem 1.2rem', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem' }}>
                Upgrade
              </Link>
            )}
          </div>

          {statusData.plan === 'pro' && statusData.currentPeriodEnd && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              {statusData.status === 'cancelled'
                ? `Access continues until ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
                : `Renews ${new Date(statusData.currentPeriodEnd).toLocaleDateString()}`
              }
            </div>
          )}

          {statusData.plan === 'lifetime' && (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Permanent access — no renewal needed.</div>
          )}
        </div>

        {/* Usage card (free tier) */}
        {statusData.plan === 'free' && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Today's Usage</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>Practice Questions</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {statusData.usage.questionsToday} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>/ {statusData.usage.questionsLimit}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>AI Chat Messages</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {statusData.usage.aiChatsToday} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>/ {statusData.usage.aiChatsLimit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account info */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Account</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{user.email}</div>
        </div>

        {/* Cancel subscription */}
        {statusData.plan === 'pro' && statusData.status === 'active' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
              Want to cancel? You will keep Pro access until the end of your current billing period.
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{ background: 'none', border: '1px solid rgba(220,50,50,0.4)', color: '#f87171', padding: '0.6rem 1.2rem', borderRadius: 8, cursor: cancelling ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', opacity: cancelling ? 0.6 : 1 }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Subscription'}
            </button>
          </div>
        )}

        {cancelDone && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(20,189,172,0.1)', border: '1px solid rgba(20,189,172,0.3)', borderRadius: 10, fontSize: '0.875rem', color: '#14BDAC' }}>
            Subscription cancelled. Your Pro access continues until your billing period ends.
          </div>
        )}
      </div>
    </div>
  )
}
