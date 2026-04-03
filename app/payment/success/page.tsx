'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') as 'pro' | 'lifetime' | null
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    if (seconds <= 0) {
      window.location.href = '/dashboard'
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const planLabel = plan === 'lifetime' ? 'Lifetime Access' : 'Pro'

  return (
    <div style={{
      maxWidth: 480,
      width: '100%',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(20,189,172,0.3)',
      borderRadius: 20,
      padding: '3rem 2rem',
    }}>
      {/* Checkmark */}
      <div style={{
        width: 72,
        height: 72,
        background: 'rgba(20,189,172,0.15)',
        border: '2px solid #14BDAC',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        fontSize: '2rem',
      }}>
        ✓
      </div>

      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem', color: '#14BDAC' }}>
        Payment Successful!
      </h1>

      <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        Welcome to <strong style={{ color: '#fff' }}>SPD Cert Companion {planLabel}</strong>.
        Your account has been upgraded and all features are now unlocked.
      </p>

      {plan === 'pro' && (
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
          You can cancel anytime from your Account settings.
        </p>
      )}

      {plan === 'lifetime' && (
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
          You have permanent access — including all future certifications added to the platform.
        </p>
      )}

      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Redirecting to dashboard in {seconds}s…
      </div>

      <Link href="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.85rem 2.5rem',
        borderRadius: 10,
        background: 'linear-gradient(135deg, #0D7377, #14BDAC)',
        color: '#fff',
        fontWeight: 600,
        textDecoration: 'none',
        fontSize: '1rem',
      }}>
        Go to Dashboard
      </Link>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#021B3A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      color: '#fff',
      padding: '2rem',
      gap: '1.5rem',
    }}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>

      {/* Resume Service Cross-sell */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: 'rgba(20,189,172,0.06)',
        border: '1px solid rgba(20,189,172,0.25)',
        borderRadius: 16,
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: '#14BDAC', fontFamily: "'DM Mono', monospace", marginBottom: '0.5rem' }}>
          WHILE YOU STUDY
        </p>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          We'll perfect your resume.
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '1rem' }}>
          Expert-written, ATS-optimized resumes for healthcare professionals. Delivered in 48 hours.
        </p>
        <a
          href="https://www.myqualifiedresume.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1.5rem',
            borderRadius: 8,
            border: '1px solid rgba(20,189,172,0.5)',
            color: '#14BDAC',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Explore Resume Services →
        </a>
      </div>
    </div>
  )
}
