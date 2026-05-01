'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { NORTHSTAR_AGENTS, type NorthstarAgent } from './agents/config'
import {
  Bot, FlaskConical, LayoutDashboard, ChevronRight,
  Layers, Sparkles, BookOpen
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/'); return }
        // Allow any authenticated user for now; tighten to admin email list as needed
        setAuthorized(true)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Checking access…</div>
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">SPD Cert Prep — Admin</h1>
            <p className="text-slate-500 text-xs">Northstar Agent System</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
          ← Back to app
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickCard
            href="/admin/variants"
            icon={<FlaskConical className="w-5 h-5 text-purple-400" />}
            title="Variant Workshop"
            description="Generate & review AI question variants"
            badge="New"
          />
          <QuickCard
            href="#agents"
            icon={<Bot className="w-5 h-5 text-teal-400" />}
            title="Agent Launcher"
            description="Activate any northstar specialist agent"
          />
          <QuickCard
            href="#phases"
            icon={<Layers className="w-5 h-5 text-amber-400" />}
            title="Phase Status"
            description="7-phase build roadmap overview"
          />
        </div>

        {/* Phase status strip */}
        <section id="phases">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Build Phases</h2>
          <div className="grid grid-cols-7 gap-2">
            {PHASES.map((p) => (
              <div
                key={p.num}
                className={`rounded-lg border p-3 text-center ${
                  p.status === 'active'
                    ? 'border-teal-600 bg-teal-900/30'
                    : p.status === 'done'
                    ? 'border-slate-700 bg-slate-800/50 opacity-60'
                    : 'border-slate-800 bg-slate-900/50 opacity-40'
                }`}
              >
                <div className="text-xs font-mono text-slate-500 mb-1">P{p.num}</div>
                <div className="text-xs font-medium leading-tight text-slate-300">{p.name}</div>
                <div className={`mt-1 text-[10px] font-semibold ${
                  p.status === 'active' ? 'text-teal-400' :
                  p.status === 'done' ? 'text-slate-500' : 'text-slate-700'
                }`}>
                  {p.status === 'active' ? '● ACTIVE' : p.status === 'done' ? '✓ done' : '— blocked'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Agent grid */}
        <section id="agents">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Northstar Agents</h2>
            <span className="text-xs text-slate-600">{NORTHSTAR_AGENTS.length} specialists</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NORTHSTAR_AGENTS.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>

        {/* Concept/Variant info panel */}
        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="font-semibold text-sm">Concept-Variant Question System</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Questions are now organized around <strong className="text-slate-200">concepts</strong> (learning objectives),
            each with up to 5 variant phrasings. Same knowledge, more surface area, far better retention.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {VARIANT_TYPES.map((v) => (
              <div key={v.type} className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                <div className="text-xs font-mono text-purple-400 mb-1">{v.type}</div>
                <div className="text-xs font-semibold text-slate-200 mb-1">{v.label}</div>
                <div className="text-xs text-slate-500 leading-tight">{v.example}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/variants"
              className="inline-flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Variant Workshop
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

function QuickCard({
  href, icon, title, description, badge
}: {
  href: string; icon: ReactNode; title: string; description: string; badge?: string
}) {
  const isAnchor = href.startsWith('#')
  const Wrapper = isAnchor ? 'a' : Link
  return (
    <Wrapper
      href={href}
      className="group rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-600 hover:bg-slate-800/60 transition-all flex items-start gap-4"
    >
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          {badge && (
            <span className="text-[10px] font-bold bg-teal-700 text-teal-100 px-1.5 py-0.5 rounded">{badge}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors mt-0.5 flex-shrink-0" />
    </Wrapper>
  )
}

function AgentCard({ agent }: { agent: NorthstarAgent }) {
  return (
    <Link
      href={`/admin/agents/${agent.id}`}
      className="group rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/60 transition-all p-5 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{agent.icon}</span>
        <div>
          <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {agent.name}
          </div>
          <div className="text-xs text-teal-500 font-mono">{agent.role}</div>
        </div>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{agent.description}</p>
      <div className="flex flex-wrap gap-1 mt-auto">
        {agent.useCases.slice(0, 2).map((u) => (
          <span key={u} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
            {u}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs text-teal-500 group-hover:text-teal-300 transition-colors">
        Launch <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  )
}

type PhaseStatus = 'active' | 'done' | 'blocked'
const PHASES: Array<{ num: number; name: string; status: PhaseStatus }> = [
  { num: 1, name: 'Foundation', status: 'active' },
  { num: 2, name: 'Design', status: 'blocked' },
  { num: 3, name: 'Learning Loop', status: 'blocked' },
  { num: 4, name: 'Gamification', status: 'blocked' },
  { num: 5, name: 'Personalization', status: 'blocked' },
  { num: 6, name: 'Content Depth', status: 'blocked' },
  { num: 7, name: 'Launch', status: 'blocked' },
]

const VARIANT_TYPES = [
  { type: 'direct', label: 'Direct', example: '"The suffix -ectomy means: …"' },
  { type: 'inverse', label: 'Inverse', example: '"Which suffix indicates surgical removal?"' },
  { type: 'application', label: 'Application', example: '"A cholecystectomy removes the: …"' },
  { type: 'scenario', label: 'Scenario', example: '"Patient is scheduled for appendectomy. This means: …"' },
  { type: 'distractor_swap', label: 'Distractor Swap', example: 'Same stem, reshuffled wrong answers' },
]
