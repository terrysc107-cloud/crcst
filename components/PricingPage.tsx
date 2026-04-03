'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { loadStripe } from '@stripe/stripe-js'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (tier: 'pro' | 'triple_crown') => {
    try {
      setLoading(tier)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/crcst')
        return
      }

      // Get session for auth header
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/payment/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
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
      setLoading(null)
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
              <span className="text-text-3">/forever</span>
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
                <li className="flex items-start gap-3">
                  <span className="text-wrong flex-shrink-0">✗</span>
                  <span className="text-text-3">CHL & CER certifications</span>
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
            <p className="text-white/80 text-sm mb-6">CRCST certification prep</p>
            
            <div className="mb-8">
              <span className="font-serif text-4xl text-white">$19</span>
              <span className="text-white/80">/90 days</span>
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
                  <span>90-day full access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading !== null}
              className="w-full py-3 bg-white text-teal rounded-lg font-mono text-sm hover:bg-white/90 disabled:opacity-50 transition"
            >
              {loading === 'pro' ? 'Loading...' : 'Get Pro Access'}
            </button>
          </div>

          {/* Triple Crown Plan */}
          <div className="bg-white rounded-2xl p-8 flex flex-col border-2 border-amber">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-navy px-4 py-1 rounded-full text-xs font-mono tracking-widest text-white hidden md:block">
              BEST VALUE
            </div>

            <h3 className="font-serif text-2xl text-navy mb-2">Triple Crown</h3>
            <p className="text-text-3 text-sm mb-6">All 3 certifications</p>
            
            <div className="mb-8">
              <span className="font-serif text-4xl text-navy">$39</span>
              <span className="text-text-3">/90 days</span>
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
                  <span>CRCST certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>CHL certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>CER certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-correct flex-shrink-0">✓</span>
                  <span>90-day full access</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('triple_crown')}
              disabled={loading !== null}
              className="w-full py-3 bg-amber text-navy rounded-lg font-mono text-sm hover:bg-amber/90 disabled:opacity-50 transition font-bold"
            >
              {loading === 'triple_crown' ? 'Loading...' : 'Get Triple Crown'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl text-white mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="bg-white/10 rounded-lg p-6 backdrop-blur-sm cursor-pointer group">
              <summary className="flex justify-between items-center text-white font-mono text-sm">
                <span>How does the 90-day access work?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                After purchase, you get full access for 90 days. This is a one-time payment, not a subscription. You can repurchase when your access expires.
              </p>
            </details>

            <details className="bg-white/10 rounded-lg p-6 backdrop-blur-sm cursor-pointer group">
              <summary className="flex justify-between items-center text-white font-mono text-sm">
                <span>What&apos;s the difference between Pro and Triple Crown?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                Pro gives you full access to CRCST exam prep. Triple Crown includes CRCST plus CHL and CER certifications - all three for one price.
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
                <span>Can I upgrade from Pro to Triple Crown?</span>
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-white/80 text-sm mt-4">
                Yes, you can purchase Triple Crown at any time. Your access will be extended to include all three certifications.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
