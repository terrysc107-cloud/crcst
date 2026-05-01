'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') as 'pro' | 'triple_crown' | null
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    if (seconds <= 0) {
      window.location.href = '/dashboard'
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const planLabel = plan === 'triple_crown' ? 'Triple Crown' : 'Pro'

  return (
    <div className="w-full max-w-[480px] text-center bg-white/[0.04] border border-teal/30 rounded-[20px] px-8 py-12">
      {/* Checkmark */}
      <div className="w-[72px] h-[72px] bg-teal/15 border-2 border-teal rounded-full flex items-center justify-center mx-auto mb-6 text-[2rem]">
        ✓
      </div>

      <h1 className="text-[1.8rem] font-bold mb-3 text-teal">
        Payment Successful!
      </h1>

      <p className="text-white/75 mb-2 leading-relaxed">
        Welcome to <strong className="text-white">SPD Cert Companion {planLabel}</strong>.
        Your account has been upgraded and all features are now unlocked.
      </p>

      {plan === 'pro' && (
        <p className="text-sm text-white/50 mb-6">
          You can cancel anytime from your Account settings.
        </p>
      )}

      {plan === 'triple_crown' && (
        <p className="text-sm text-white/50 mb-6">
          You have permanent access — including all future certifications added to the platform.
        </p>
      )}

      <div className="text-white/40 text-sm mb-6">
        Redirecting to dashboard in {seconds}s…
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 px-10 py-[0.85rem] rounded-[10px] bg-gradient-to-br from-teal-dark to-teal text-white font-semibold no-underline text-base"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center font-sans text-white p-8 gap-6">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>

      {/* Resume Service Cross-sell */}
      <div className="w-full max-w-[480px] bg-teal/[0.06] border border-teal/25 rounded-2xl p-6 text-center">
        <p className="text-xs tracking-[0.1em] text-teal font-mono mb-2">WHILE YOU STUDY</p>
        <h3 className="text-[1.1rem] font-bold mb-2">We&apos;ll perfect your resume.</h3>
        <p className="text-sm text-white/55 leading-relaxed mb-4">
          Expert-written, ATS-optimized resumes for healthcare professionals. Delivered in 48 hours.
        </p>
        <a
          href="https://www.myqualifiedresume.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-[0.6rem] rounded-lg border border-teal/50 text-teal text-sm font-semibold no-underline"
        >
          Explore Resume Services →
        </a>
      </div>
    </div>
  )
}
