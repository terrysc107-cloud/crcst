'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Crown, X, Check } from 'lucide-react'

interface UpsellGateModalProps {
  isOpen: boolean
  onClose: () => void
  certName?: string
}

export function UpsellGateModal({ isOpen, onClose, certName = 'CHL and CER' }: UpsellGateModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) {
        router.push('/login?redirect=/pricing')
        return
      }

      const res = await fetch('/api/payment/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: 'triple_crown' }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-6 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {certName} {certName.includes('and') ? 'are' : 'is'} Triple Crown only
          </h2>
          <p className="mt-2 text-muted-foreground">
            Unlock all 3 certifications for just $39
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <ul className="space-y-3">
            {[
              'CRCST - Certified Registered Central Service Technician',
              'CHL - Certified Healthcare Leader',
              'CER - Certified Endoscope Reprocessor',
              'Unlimited practice questions',
              'AI study assistant',
              '90-day full access',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="p-6 bg-muted/30">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Upgrade to Triple Crown - $39'}
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
