'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { loadStripe } from '@stripe/js'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'lifetime'>('monthly')

  const handleUpgrade = async (tier: 'PRO' | 'LIFETIME') => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/crcst')
        return
      }

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      // Call checkout endpoint
      const priceId = tier === 'PRO' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID

      const response = await fetch('/api/payment/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (!stripe) throw new Error('Stripe failed to load')

      await stripe.redirectToCheckout({ sessionId })
    } catch (error: any) {
      console.error('Upgrade error:', error)
      alert(error.message || 'Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-2 to-navy py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-white mb-3">
            Simple, Transparent Pricing
          </h1>
          <p className="text-text-3 text-lg">
            Choose the plan that works for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 flex flex-col">
            <h3 className="font-serif text-2xl text-navy mb-2">Free</h3>
            <p className="text-text-3 text-sm mb-6">Get started for free</p>
            
            <div className="mb-8">
              <span className="font-serif text-4xl text-navy">$0</span>
              <span className="text-text-3">/month</span>
            </div>

            <div className="mb-8 flex-1">
              <div className="text-xs tracking-widest text-text-3 mb-4 uppercase">Features</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>20 practice questions per hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>1 flashcard round per hour</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>5 AI chats per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-wrong flex-shrink-0">✗</span>
                  <span className="text-text-3">Full-length mock exams</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-3 bg-cream-2 text-text-3 rounded-lg font-mono text-sm opacity-50 cursor-not-allowed"
            >
              Your Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-teal rounded-2xl p-8 flex flex-col relative ring-2 ring-teal-2 transform md:scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber px-4 py-1 rounded-full text-xs font-mono tracking-widest text-navy">
              MOST POPULAR
            </div>

            <h3 className="font-serif text-2xl text-white mb-2">Pro</h3>
            <p className="text-white/80 text-sm mb-6">Unlimited learning</p>
            
            <div className="mb-8">
              <span className="font-serif text-4xl text-white">$9.99</span>
              <span className="text-white/80">/month</span>
            </div>

            <div className="mb-8 flex-1">
              <div className="text-xs tracking-widest text-white/80 mb-4 uppercase">Features</div>
              <ul className="space-y-3 text-sm text-white">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0">✓</span>
                  <span>Unlimited practice questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0">✓</span>
                  <span>Unlimited flashcards</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0">✓</span>
                  <span>Unlimited AI assistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0">✓</span>
                  <span>Full-length mock exams</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0">✓</span>
                  <span>Priority email support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('PRO')}
              disabled={loading}
              className="w-full py-3 bg-white text-teal rounded-lg font-mono text-sm hover:bg-white/90 disabled:opacity-50 transition"
            >
              {loading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-white rounded-2xl p-8 flex flex-col border-2 border-amber">
            <h3 className="font-serif text-2xl text-navy mb-2">Lifetime</h3>
            <p className="text-text-3 text-sm mb-6">One-time payment</p>
            
            <div className="mb-8">
              <span className="font-serif text-4xl text-navy">$49.99</span>
              <span className="text-text-3">/one-time</span>
            </div>

            <div className="mb-8 flex-1">
              <div className="text-xs tracking-widest text-text-3 mb-4 uppercase">Features</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>Lifetime access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>Future updates included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>No subscription fees</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('LIFETIME')}
              disabled={loading}
              className="w-full py-3 bg-amber text-navy rounded-lg font-mono text-sm hover:bg-amber/90 disabled:opacity-50 transition font-bold"
            >
              {loading ? 'Loading...' : 'Get Lifetime Access'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white/10 rounded-lg p-6 backdrop-blur-sm cursor-pointer group">
              <summary className="flex justify-between items-center text-white font-mono text-sm">
                <span>Can I change plans?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                Yes, you can upgrade to Pro at any time. Your pro subscription will renew monthly.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-6 backdrop-blur-sm cursor-pointer group">
              <summary className="flex justify-between items-center text-white font-mono text-sm">
                <span>What payment methods do you accept?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                We accept all major credit cards and digital payment methods through Stripe.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-6 backdrop-blur-sm cursor-pointer group">
              <summary className="flex justify-between items-center text-white font-mono text-sm">
                <span>Can I cancel anytime?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                Yes, Pro subscriptions can be cancelled anytime from your account settings. No questions asked.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
