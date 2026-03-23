'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    comingSoon: false,
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
    comingSoon: true,
    features: [
      'Unlimited practice questions',
      'Unlimited AI Study Chat',
      'Full domain mastery tracking',
      'Custom quiz builder',
      'Pause & resume any session',
      'Priority badge processing',
      'All future updates included',
    ],
    cta: 'Coming Soon',
    note: 'Launching soon — start free today',
    color: 'rgba(13,115,119,0.15)',
    border: 'rgba(20,189,172,0.4)',
    badge: 'Coming Soon',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99',
    period: ' one time',
    comingSoon: true,
    features: [
      'Everything in Pro — forever',
      'All future certifications included',
      'Early access to new features',
      'Lifetime badge archive',
      'Best value for career-long prep',
    ],
    cta: 'Coming Soon',
    note: 'Launching soon',
    color: 'rgba(255,255,255,0.04)',
    border: 'rgba(218,165,32,0.35)',
  },
]

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setCurrentPlan(u ? 'free' : null)
    }
    load()
  }, [])

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
          Start free today. Paid plans are coming soon — create your account now and upgrade when they launch.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div style={{
        maxWidth: 600,
        margin: '0 auto 1.5rem',
        padding: '0 2rem',
      }}>
        <div style={{
          background: 'rgba(20,189,172,0.08)',
          border: '1px solid rgba(20,189,172,0.25)',
          borderRadius: 12,
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.88rem',
          color: 'rgba(255,255,255,0.75)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🚀</span>
          <span>
            <strong style={{ color: '#14BDAC' }}>Pro & Lifetime plans launching soon.</strong>{' '}
            Sign up free now — you&apos;ll be able to upgrade right from your dashboard.
          </span>
        </div>
      </div>

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
                opacity: plan.comingSoon ? 0.75 : 1,
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
                  background: plan.comingSoon ? 'rgba(255,255,255,0.15)' : '#14BDAC',
                  color: plan.comingSoon ? 'rgba(255,255,255,0.7)' : '#fff',
                  padding: '0.3rem 1rem',
                  borderRadius: 100,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap' as const,
                  border: plan.comingSoon ? '1px solid rgba(255,255,255,0.2)' : 'none',
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
              {plan.comingSoon ? (
                <div style={{
                  textAlign: 'center',
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  Coming Soon
                </div>
              ) : isCurrentPlan ? (
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
              ) : (
                <Link href="/dashboard" style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.85rem',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
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
    </div>
  )
}
