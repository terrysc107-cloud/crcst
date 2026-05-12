'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const PRICING = {
  pro:          [{ min: 10, max: 24, price: 15 }, { min: 25, max: 49, price: 13 }, { min: 50, max: Infinity, price: 10 }],
  triple_crown: [{ min: 10, max: 24, price: 30 }, { min: 25, max: 49, price: 26 }, { min: 50, max: Infinity, price: 20 }],
}

function suggestedPrice(tier: string, qty: number): number {
  const tiers = PRICING[tier as keyof typeof PRICING] ?? []
  return tiers.find((t) => qty >= t.min && qty <= t.max)?.price ?? 0
}

function tierLabel(tier: string) {
  return tier === 'triple_crown' ? 'Triple Crown' : 'Pro'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtMoney(n: number | string) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function WholesaleAdmin() {
  const [token, setToken] = useState('')
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatch, setSelectedBatch] = useState<any>(null)
  const [batchCodes, setBatchCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newCodes, setNewCodes] = useState<string[]>([])

  // Form state
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [tier, setTier] = useState('pro')
  const [quantity, setQuantity] = useState(10)
  const [pricePerSeat, setPricePerSeat] = useState(15)
  const [notes, setNotes] = useState('')

  const fetchBatches = useCallback(async (tok: string) => {
    const res = await fetch('/api/admin/batches', {
      headers: { Authorization: `Bearer ${tok}` },
    })
    if (!res.ok) {
      setError('Access denied or not admin.')
      setLoading(false)
      return
    }
    const data = await res.json()
    setBatches(data.batches ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setError('Not logged in.'); setLoading(false); return }
      setToken(session.access_token)
      fetchBatches(session.access_token)
    })
  }, [fetchBatches])

  useEffect(() => {
    const suggested = suggestedPrice(tier, quantity)
    setPricePerSeat(suggested)
  }, [tier, quantity])

  useEffect(() => {
    setOrgSlug(orgName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
  }, [orgName])

  async function loadBatchDetail(id: string) {
    const res = await fetch(`/api/admin/batches/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setSelectedBatch(data.batch)
    setBatchCodes(data.codes ?? [])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (quantity < 10) { setError('Minimum 10 seats'); return }
    setCreating(true)
    setError('')
    const res = await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ org_name: orgName, org_slug: orgSlug, tier, quantity, price_per_seat: pricePerSeat, notes }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setCreating(false); return }
    setNewCodes(data.codes)
    setShowForm(false)
    setOrgName(''); setOrgSlug(''); setNotes(''); setQuantity(10)
    await fetchBatches(token)
    setCreating(false)
  }

  function copyAll() {
    navigator.clipboard.writeText(newCodes.join('\n'))
  }

  const totalRevenue = batches.reduce((sum, b) => sum + Number(b.revenue), 0)
  const totalSeats   = batches.reduce((sum, b) => sum + b.quantity, 0)
  const totalUsed    = batches.reduce((sum, b) => sum + b.redeemed, 0)

  if (loading) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-gray-400">Loading…</div>
  if (error && !token) return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center text-sm text-red-400">{error}</div>

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">Admin</Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm font-semibold">Wholesale</span>
          </div>
          <p className="text-xs text-gray-400">Access code batches</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setNewCodes([]) }}
          className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + New Batch
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: fmtMoney(totalRevenue) },
            { label: 'Seats Sold', value: totalSeats.toLocaleString() },
            { label: 'Seats Used', value: `${totalUsed} / ${totalSeats}` },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* New codes output */}
        {newCodes.length > 0 && (
          <div className="mb-8 bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-emerald-400 text-sm">Batch created — {newCodes.length} codes</h2>
              <button onClick={copyAll} className="text-xs text-emerald-400 hover:text-emerald-300 underline">Copy all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {newCodes.map((c) => (
                <div key={c} className="font-mono text-xs bg-white/5 rounded px-2 py-1 text-center tracking-wide">{c}</div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

        {/* Create form */}
        {showForm && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="font-semibold mb-4">New Batch</h2>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Organization name</label>
                  <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder="Mercy Hospital" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Code prefix (auto)</label>
                  <input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} required placeholder="MERCY" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/50" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tier</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50">
                    <option value="pro">Pro</option>
                    <option value="triple_crown">Triple Crown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Seats (min 10)</label>
                  <input type="number" min={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Price / seat ($)</label>
                  <input type="number" step="0.01" min={1} value={pricePerSeat} onChange={(e) => setPricePerSeat(Number(e.target.value))} required className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Preview: <span className="font-mono text-white">{orgSlug || 'ORG'}-{tier === 'triple_crown' ? 'TC' : 'PRO'}-XXXX</span></span>
                <span>·</span>
                <span>Total: <span className="text-white font-semibold">{fmtMoney(pricePerSeat * quantity)}</span></span>
                <span>·</span>
                <span>Suggested: <span className="text-white">{fmtMoney(suggestedPrice(tier, quantity))}/seat</span></span>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Invoice #, contact name, etc." className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={creating} className="px-5 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                  {creating ? 'Generating…' : `Generate ${quantity} codes`}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Batch list */}
        <div className="space-y-3">
          {batches.length === 0 && !showForm && (
            <div className="text-center text-gray-400 text-sm py-16">No batches yet. Create your first one.</div>
          )}
          {batches.map((b) => {
            const pct = b.quantity > 0 ? Math.round((b.redeemed / b.quantity) * 100) : 0
            const expired = new Date(b.expires_at) < new Date()
            return (
              <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    if (selectedBatch?.id === b.id) { setSelectedBatch(null); setBatchCodes([]) }
                    else loadBatchDetail(b.id)
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">{b.org_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.tier === 'triple_crown' ? 'bg-amber-500/20 text-amber-400' : 'bg-teal/20 text-teal'}`}>
                          {tierLabel(b.tier)}
                        </span>
                        {expired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Expired</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="font-mono">{b.org_slug}-{b.tier === 'triple_crown' ? 'TC' : 'PRO'}-****</span>
                        {' · '}Expires {fmtDate(b.expires_at)}
                        {b.notes && <>{' · '}{b.notes}</>}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 text-right">
                      <div>
                        <div className="text-xs text-gray-400">Used</div>
                        <div className="font-semibold text-sm">{b.redeemed}/{b.quantity} <span className="text-gray-500 font-normal">({pct}%)</span></div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Revenue</div>
                        <div className="font-semibold text-sm">{fmtMoney(b.revenue)}</div>
                      </div>
                      <div className="text-gray-500 text-sm">{selectedBatch?.id === b.id ? '▲' : '▼'}</div>
                    </div>
                  </div>
                  {/* Usage bar */}
                  <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </button>

                {/* Expanded code list */}
                {selectedBatch?.id === b.id && (
                  <div className="border-t border-white/10 px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {batchCodes.map((c) => (
                        <div
                          key={c.code}
                          className={`font-mono text-xs rounded px-2 py-1.5 flex items-center justify-between gap-1 ${c.redeemed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-300'}`}
                        >
                          <span>{c.code}</span>
                          {c.redeemed && <span title={c.redeemed_at ? fmtDate(c.redeemed_at) : ''}>✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
