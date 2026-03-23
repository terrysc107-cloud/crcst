'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    highlight: false,
    features: [
      '20 practice questions / day',
      '5 AI chat messages / day',
      'Basic progress tracking',
      'Access to CRCST, CHL, CER, SJT',
      'Exam readiness score',
      'Certification badge (after passing)',
    ],
    cta: 'Start Free',
    note: 'No credit card required',
    color: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.12)',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$14.99',
    period: '/month',
    highlight: true,
    features: [
      'Unlimited practice questions',
      'Unlimited AI Study Chat',
      'Full domain mastery tracking',
      'Custom quiz builder',
      'Pause & resume any session',
      'Priority badge processing',
      'All future updates included',
    ],
    cta: 'Start Pro',
    note: 'Cancel anytime',
    color: 'rgba(13,115,119,0.15)',
    border: 'rgba(20,189,172,0.4)',
    badge: 'Most Popular',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99',
    period: ' one time',
    highlight: false,
    features: [
      'Everything in Pro — forever',
      'All future certifications included',
      'Early access to new features',
      'Lifetime badge archive',
      'Best value for career-long prep',
    ],
    cta: 'Get Lifetime Access',
    note: 'Pay once, own it forever',
    color: 'rgba(255,255,255,0.04)',
    border: 'rgba(218,165,32,0.35)',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        setUser({ id: u.id, email: u.email! })
        const res = await fetch('/api/payment/status', {
          headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        })
        const data = await res.json()
        setCurrentPlan(data.plan || 'free')
      } else {
        setCurrentPlan('free')
      }
    }
    load()
  }, [])

  async function handleUpgrade(planId: string) {
    if (planId === 'free') return

    if (!user) {
      // Store intent and redirect to login
      sessionStorage.setItem('upgrade_intent', planId)
      router.push('/login?redirect=/pricing')
      return
    }

    setLoadingPlan(planId)
    try {
      const session = await supabase.auth.getSession()
      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          userId: user.id,
          email: user.email,
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Unable to start checkout. Please try again.')
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#021B3A',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
          <div style={{ width: 36, height: 36, background: '#14BDAC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
            SP
          </div>
          <span style={{ fontWeight: 600 }}>SPD Cert Companion</span>
        </Link>
        <Link href="/dashboard" style={{ color: '#14BDAC', textDecoration: 'none', fontSize: '0.9rem' }}>
          Go to Dashboard →
        </Link>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 2rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#14BDAC', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Simple Pricing
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
          Invest in your career.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Start free, upgrade when you're ready. No hidden fees, no tricks.
          Cancel Pro anytime.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        maxWidth: 1000,
        margin: '2rem auto',
        padding: '0 2rem',
      }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isPaid = plan.id !== 'free'

          return (
            <div
              key={plan.id}
              style={{
                background: plan.color,
                border: `1.5px solid ${plan.border}`,
                borderRadius: 18,
                padding: '2rem',
                position: 'relative',
                transition: 'transform 0.2s',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#14BDAC',
                  color: '#fff',
                  padding: '0.3rem 1rem',
                  borderRadius: 100,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{plan.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {plan.features.map((feat, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ color: '#14BDAC', fontSize: '1rem', lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div style={{
                  textAlign: 'center',
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.9rem',
                }}>
                  Current Plan
                </div>
              ) : plan.id === 'free' ? (
                <Link href="/dashboard" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}>
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan === plan.id}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: 10,
                    border: 'none',
                    cursor: loadingPlan === plan.id ? 'not-allowed' : 'pointer',
                    background: plan.id === 'pro'
                      ? 'linear-gradient(135deg, #0D7377, #14BDAC)'
                      : 'linear-gradient(135deg, #B8860B, #DAA520)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    opacity: loadingPlan === plan.id ? 0.7 : 1,
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loadingPlan === plan.id ? 'Loading...' : plan.cta}
                </button>
              )}

              <div style={{
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.35)',
                marginTop: '0.75rem',
              }}>
                {plan.note}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trust badges */}
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.82rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <span>🔒 Secured by Square</span>
        <span>↩ Cancel anytime (Pro)</span>
        <span>✓ Instant access after payment</span>
        <span>📧 Support: support@spdcertprep.com</span>
      </div>
    </div>
  )
}
