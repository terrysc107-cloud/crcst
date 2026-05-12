'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Crown, X, Check, AlertCircle } from 'lucide-react'

interface UpsellGateModalProps {
  isOpen: boolean
  onClose: () => void
  certName?: string
}

export function UpsellGateModal({ isOpen, onClose, certName = 'CHL and CER' }: UpsellGateModalProps) {
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    setCheckoutError(null)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      if (!token) {
        onClose()
        router.push('/crcst')
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
      } else {
        setCheckoutError('Could not start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      setCheckoutError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden bounce-in">
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
            Unlock {certName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your free account includes CRCST only.
          </p>
          <p className="mt-1 text-muted-foreground font-semibold">
            Triple Crown adds CHL + CER — just $39 for 90 days.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <ul className="space-y-2.5">
            {[
              { text: 'All 3 exams: CRCST + CHL + CER', highlight: true },
              { text: 'Unlimited practice questions', highlight: false },
              { text: 'AI study assistant — ask anything', highlight: false },
              { text: '90-day access — one-time payment', highlight: false },
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? 'text-amber-500' : 'text-emerald-500'}`} />
                <span className={`text-sm ${feature.highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Error state */}
        {checkoutError && (
          <div className="mx-6 mb-3 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg fadeUp">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span className="text-sm text-destructive">{checkoutError}</span>
          </div>
        )}

        {/* CTA */}
        <div className="p-6 pt-2 bg-muted/30">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <span aria-hidden className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Opening checkout…
              </>
            ) : (
              'Unlock Triple Crown — $39'
            )}
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
