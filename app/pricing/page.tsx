'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { loadStripe } from '@stripe/js'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    features: [
      '20 practice questions per hour',
      '1 flashcard round per hour',
      '5 AI chat messages per day',
      'Basic progress tracking',
      'Access to CRCST, CHL, CER, SJT',
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
    price: '$9.99',
    period: '/month',
    tier: 'PRO',
    features: [
      'Unlimited practice questions',
      'Unlimited flashcards',
      'Unlimited AI Study Chat',
      'Full domain mastery tracking',
      'Custom quiz builder',
      'Pause & resume any session',
      'Priority badge processing',
      'All future updates included',
    ],
    cta: 'Upgrade to Pro',
    note: 'Cancel anytime',
    color: 'rgba(13,115,119,0.15)',
    border: 'rgba(20,189,172,0.4)',
    badge: 'Most Popular',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$49.99',
    period: ' one time',
    tier: 'LIFETIME',
    features: [
      'Everything in Pro — forever',
      'All future certifications included',
      'Early access to new features',
      'Lifetime badge archive',
      'Best value for career-long prep',
      'No subscription fees ever',
    ],
    cta: 'Get Lifetime Access',
    note: 'One-time purchase',
    color: 'rgba(255,255,255,0.04)',
    border: 'rgba(218,165,32,0.35)',
    badge: 'Best Value',
  },
]

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('tier, status')
          .eq('id', u.id)
          .single()
        
        if (subscription?.status === 'active') {
          setCurrentPlan(subscription.tier.toLowerCase())
        } else {
          setCurrentPlan('free')
        }
      }
    }
    load()
  }, [])

  const handleUpgrade = async (tier: 'PRO' | 'LIFETIME') => {
    try {
      setLoading(true)
      setError('')

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = '/crcst'
        return
      }

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        setError('Authentication failed. Please try again.')
        return
      }

      // Determine price ID
      const priceId = tier === 'PRO' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID

      if (!priceId) {
        setError('Pricing not configured. Please contact support.')
        return
      }

      // Call checkout endpoint
      const response = await fetch('/api/payment/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, priceId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (!stripe) {
        throw new Error('Stripe failed to load. Please try again.')
      }

      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (err: any) {
      console.error('Upgrade error:', err)
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoading(false)
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
        {currentPlan && (
          <Link href="/crcst" style={{ color: '#14BDAC', textDecoration: 'none', fontSize: '0.9rem' }}>
            Back to Quiz →
          </Link>
        )}
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 2rem' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#14BDAC', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Simple Pricing
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.2 }}>
          Invest in your certification.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Choose the plan that fits your study style. All plans include access to all certifications.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          maxWidth: 600,
          margin: '0 auto 1.5rem',
          padding: '0 2rem',
        }}>
          <div style={{
            background: 'rgba(220,50,50,0.1)',
            border: '1px solid rgba(220,50,50,0.3)',
            borderRadius: 12,
            padding: '0.85rem 1.25rem',
            fontSize: '0.88rem',
            color: '#f87171',
          }}>
            {error}
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 2rem 4rem',
      }}>
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id

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
                  background: plan.id === 'pro' ? '#14BDAC' : '#DAA520',
                  color: '#fff',
                  padding: '0.3rem 1rem',
                  borderRadius: 100,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap' as const,
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
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
              ) : plan.tier ? (
                <button
                  onClick={() => handleUpgrade(plan.tier as 'PRO' | 'LIFETIME')}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: 10,
                    background: plan.id === 'pro' ? 'linear-gradient(135deg, #0D7377, #14BDAC)' : '#DAA520',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                  {loading ? 'Loading...' : plan.cta}
                </button>
              ) : (
                <Link href="/crcst" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.85rem',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}>
                  {plan.cta}
                </Link>
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

      {/* FAQ */}
      <div style={{ maxWidth: 600, margin: '0 auto 4rem', padding: '0 2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>Questions?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <details style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '1rem', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, color: '#14BDAC' }}>Can I change plans?</summary>
            <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Yes, you can upgrade from Free to Pro anytime. Your Pro subscription renews monthly.
            </p>
          </details>

          <details style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '1rem', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, color: '#14BDAC' }}>Can I cancel anytime?</summary>
            <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Yes, Pro subscriptions can be cancelled anytime from your account settings. You keep access until your billing period ends.
            </p>
          </details>

          <details style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '1rem', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, color: '#14BDAC' }}>What payment methods do you accept?</summary>
            <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              We accept all major credit cards and digital payment methods through Stripe.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

