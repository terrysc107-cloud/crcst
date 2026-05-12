'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Status = 'idle' | 'loading' | 'success' | 'error'

// Legacy codes: exactly 12 alphanumeric chars (XXXX-XXXX-XXXX)
// Wholesale codes: SLUG-PRO-XXXX or SLUG-TC-XXXX (variable length, contains dashes)
function isLegacyCode(raw: string): boolean {
  return /^[A-Z0-9]{12}$/.test(raw.replace(/-/g, ''))
    && !/-(?:PRO|TC)-/.test(raw.toUpperCase())
}

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase()
}

function formatForDisplay(raw: string): string {
  // Wholesale codes keep their dashes as-is (e.g. MERCY-PRO-A2B3)
  if (/-(?:PRO|TC)-/i.test(raw)) return raw.toUpperCase()
  // Legacy codes: strip dashes, reformat as XXXX-XXXX-XXXX
  const flat = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12)
  const parts: string[] = []
  for (let i = 0; i < flat.length; i += 4) parts.push(flat.slice(i, i + 4))
  return parts.join('-')
}

function RedeemForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tier, setTier] = useState<'pro' | 'triple_crown' | null>(null)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session)
    })
    const prefill = searchParams.get('code')
    if (prefill) {
      setCode(formatForDisplay(decodeURIComponent(prefill)))
    }
  }, [searchParams])

  useEffect(() => {
    if (status !== 'success') return
    const t = setTimeout(() => router.push('/dashboard'), 2000)
    return () => clearTimeout(t)
  }, [status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20)
    setCode(val)
    if (status === 'error') {
      setStatus('idle')
      setError(null)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return

    const normalized = normalizeCode(code)
    const stripped = normalized.replace(/-/g, '')

    if (stripped.length < 8) {
      setStatus('error')
      setError('Please enter your full access code.')
      return
    }

    setStatus('loading')
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setStatus('error')
      setError('Please sign in to redeem your code.')
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    }

    try {
      // Route to correct endpoint based on code format
      const endpoint = isLegacyCode(normalized) ? '/api/redeem' : '/api/payment/redeem-code'
      const body = isLegacyCode(normalized)
        ? JSON.stringify({ code: stripped })
        : JSON.stringify({ code: normalized })

      const res = await fetch(endpoint, { method: 'POST', headers, body })
      const data = await res.json()

      if (!res.ok) {
        // If wholesale endpoint didn't find it, try legacy as fallback
        if (!isLegacyCode(normalized) && res.status === 404) {
          const fallback = await fetch('/api/redeem', {
            method: 'POST',
            headers,
            body: JSON.stringify({ code: stripped }),
          })
          const fallbackData = await fallback.json()
          if (!fallback.ok) {
            setStatus('error')
            setError(fallbackData.error || 'Could not redeem the code. Please double-check and try again.')
            return
          }
          setTier(fallbackData.tier)
          setStatus('success')
          return
        }
        setStatus('error')
        setError(data.error || 'Could not redeem the code. Please double-check and try again.')
        return
      }
      setTier(data.tier)
      setStatus('success')
    } catch {
      setStatus('error')
      setError('Network error. Please check your connection and try again.')
    }
  }

  const isReady = code.replace(/-/g, '').length >= 8

  return (
    <div style={{
      minHeight: '100vh',
      background: '#021B3A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      color: '#fff',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: 460,
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(20,189,172,0.3)',
        borderRadius: 20,
        padding: '2.5rem 2rem',
      }}>
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(20,189,172,0.15)',
              border: '2px solid #14BDAC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.75rem',
            }}>✓</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14BDAC', marginBottom: '0.5rem' }}>
              Access activated.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {tier === 'triple_crown' ? 'Triple Crown' : 'Pro'} access is now unlocked on your account.
              Redirecting to dashboard…
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              Enter your access code
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.75rem' }}>
              Your instructor or program coordinator provided this code.
            </p>

            <form onSubmit={submit}>
              <input
                value={code}
                onChange={handleChange}
                placeholder="e.g. MERCY-PRO-A2B3 or XXXX-XXXX-XXXX"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1.05rem',
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${status === 'error' ? '#FF6B6B' : 'rgba(20,189,172,0.4)'}`,
                  borderRadius: 10,
                  color: '#fff',
                  outline: 'none',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                }}
              />

              {error && (
                <div role="alert" style={{
                  color: '#FF8B8B',
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              {signedIn === false && (
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  lineHeight: 1.5,
                }}>
                  You'll need to <Link href="/crcst" style={{ color: '#14BDAC', textDecoration: 'underline' }}>sign in</Link> before redeeming.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !isReady}
                style={{
                  width: '100%',
                  padding: '0.95rem 1rem',
                  borderRadius: 10,
                  background: status === 'loading' || !isReady
                    ? 'rgba(20,189,172,0.4)'
                    : 'linear-gradient(135deg, #0D7377, #14BDAC)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {status === 'loading' && (
                  <span aria-hidden style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                )}
                {status === 'loading' ? 'Activating…' : 'Activate Access'}
              </button>
            </form>

            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem',
              textAlign: 'center',
              marginTop: '1.5rem',
              lineHeight: 1.5,
            }}>
              Don't have a code? <Link href="/pricing" style={{ color: '#14BDAC', textDecoration: 'underline' }}>See plans</Link>.
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default function RedeemPage() {
  return (
    <Suspense>
      <RedeemForm />
    </Suspense>
  )
}
