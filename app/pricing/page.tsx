'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Check, Crown, Sparkles, Clock } from 'lucide-react'

const PLANS = [
  {
    id: 'triple_crown',
    name: 'Triple Crown',
    price: '$39',
    period: '90 days',
    tier: 'triple_crown',
    description: 'All 3 certifications — CRCST, CHL & CER',
    features: [
      { text: 'Unlimited practice questions', included: true },
      { text: 'Unlimited AI chat', included: true },
      { text: 'Full progress tracking', included: true },
      { text: 'CRCST certification', included: true },
      { text: 'CHL certification', included: true },
      { text: 'CER certification', included: true },
    ],
    cta: 'Get Triple Crown',
    badge: 'Best Value',
    icon: Crown,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '90 days',
    tier: 'pro',
    description: 'Unlimited CRCST prep',
    features: [
      { text: 'Unlimited practice questions', included: true },
      { text: 'Unlimited AI chat', included: true },
      { text: 'Full progress tracking', included: true },
      { text: 'CRCST certification', included: true },
      { text: 'CHL certification', included: false },
      { text: 'CER certification', included: false },
    ],
    cta: 'Get Pro Access',
    badge: 'Most Popular',
    highlight: true,
  },
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Get started with CRCST prep',
    features: [
      { text: '20 practice questions per hour', included: true },
      { text: '5 AI chat messages per day', included: true },
      { text: 'Basic progress tracking', included: true },
      { text: 'CRCST certification only', included: true },
      { text: 'CHL certification', included: false },
      { text: 'CER certification', included: false },
    ],
    cta: 'Start Free',
    href: '/crcst',
  },
]

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [tierExpiry, setTierExpiry] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier, tier_expires_at')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          const isExpired = profile.tier_expires_at && new Date(profile.tier_expires_at) < new Date()
          setCurrentPlan(isExpired ? 'free' : (profile.tier || 'free'))
          setTierExpiry(profile.tier_expires_at)
        } else {
          setCurrentPlan('free')
        }
      }
    }
    load()
  }, [])

  const handleUpgrade = async (tier: 'pro' | 'triple_crown') => {
    try {
      setLoading(tier)
      setError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/crcst'
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        setError('Authentication failed. Please try again.')
        return
      }

      const response = await fetch('/api/payment/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      const { url } = data
      if (!url) throw new Error('No checkout URL returned')
      window.location.href = url
    } catch (err: any) {
      console.error('Upgrade error:', err)
      setError(err.message || 'Failed to start checkout')
    } finally {
      setLoading(null)
    }
  }

  const formatExpiry = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-navy text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/7">
        <Link href="/" className="flex items-center gap-2 text-white no-underline hover:text-teal transition-colors">
          <span className="text-xl">⚙️</span>
          <span className="font-semibold">SPD Cert <em className="not-italic text-teal">Prep</em></span>
        </Link>
        <Link href="/dashboard" className="text-teal hover:underline text-sm">
          Back to Dashboard
        </Link>
      </nav>

      {/* Header */}
      <div className="text-center pt-16 pb-8 px-6">
        <p className="font-mono text-teal text-xs tracking-[0.12em] mb-3 uppercase">Simple Pricing</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-white text-balance" style={{ fontFamily: "var(--font-display)" }}>
          Invest in your certification
        </h1>
        <p className="text-white/60 max-w-md mx-auto leading-relaxed">
          Choose the plan that fits your study style. One-time payment, 90-day access.
        </p>
      </div>

      {/* Current Plan Indicator */}
      {currentPlan && currentPlan !== 'free' && tierExpiry && (
        <div className="max-w-md mx-auto mb-8 px-6">
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal/10 border border-teal/20">
            <Clock className="w-4 h-4 text-teal" />
            <span className="text-sm text-white">
              Your <span className="font-semibold capitalize">{currentPlan.replace('_', ' ')}</span> access expires {formatExpiry(tierExpiry)}
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="max-w-md mx-auto mb-6 px-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl py-3 px-4 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 pb-12">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const Icon = plan.icon

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 transition-all ${
                plan.id === 'triple_crown'
                  ? 'bg-amber/5 border-amber/60 shadow-lg shadow-amber/10 scale-[1.02]'
                  : plan.highlight
                  ? 'bg-teal/10 border-teal/40 shadow-lg shadow-teal/10'
                  : 'bg-white/[0.03] border-white/8 hover:border-teal/40'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${
                  plan.highlight 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-amber-500 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-6 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  {Icon && <Icon className="w-5 h-5 text-amber" />}
                  <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
                    {plan.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-white/40 text-sm">/ {plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-white/55">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      feat.included ? 'text-teal' : 'text-white/20'
                    }`} />
                    <span className={feat.included ? 'text-white/80' : 'text-white/25 line-through'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <div className="text-center py-3 rounded-xl border border-white/15 text-white/40 text-sm">
                  Current Plan
                </div>
              ) : plan.tier ? (
                <button
                  onClick={() => handleUpgrade(plan.tier as 'pro' | 'triple_crown')}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white hover:opacity-90 ${
                    plan.highlight
                      ? 'shadow-lg shadow-teal/25'
                      : 'shadow-lg shadow-amber/25'
                  }`}
                  style={{
                    background: plan.highlight
                      ? 'linear-gradient(135deg, var(--teal), var(--teal-2))'
                      : 'linear-gradient(135deg, var(--amber), var(--amber-2))',
                  }}
                >
                  {loading === plan.tier ? 'Processing...' : plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.href || '/crcst'}
                  className="block text-center py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Already have CRCST section */}
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="bg-amber/[0.06] rounded-2xl border border-amber/25 p-8">
          <Crown className="w-12 h-12 text-amber mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2 text-white" style={{ fontFamily: "var(--font-display)" }}>Already have your CRCST?</h2>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Level up your career with CHL and CER certifications. Get all three with Triple Crown access.
          </p>
          <button
            onClick={() => handleUpgrade('triple_crown')}
            disabled={loading !== null || currentPlan === 'triple_crown'}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--amber), var(--amber-2))' }}
          >
            <Sparkles className="w-5 h-5" />
            {currentPlan === 'triple_crown' ? 'You have Triple Crown' : 'Upgrade to Triple Crown — $39'}
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-xl mx-auto px-6 pb-16">
        <h2 className="text-center text-2xl font-black mb-8 text-white" style={{ fontFamily: "var(--font-display)" }}>Questions?</h2>
        <div className="space-y-3">
          {[
            { q: "How long does my access last?", a: "Both Pro and Triple Crown give you 90 days of full access from the date of purchase. After that, you can renew at the same price." },
            { q: "Can I upgrade from Pro to Triple Crown?", a: "Yes! You can upgrade to Triple Crown anytime. Your new 90-day period starts from the upgrade date." },
            { q: "What payment methods do you accept?", a: "We accept all major credit cards and digital payment methods through Stripe, including Apple Pay and Google Pay." },
            { q: "Is there a refund policy?", a: "All purchases are final. We do not offer refunds under any circumstances." },
          ].map(({ q, a }) => (
            <details key={q} className="bg-white/[0.03] border border-white/8 rounded-xl p-4 cursor-pointer group">
              <summary className="font-semibold text-teal list-none flex items-center justify-between">
                {q}
                <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-white/55 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
