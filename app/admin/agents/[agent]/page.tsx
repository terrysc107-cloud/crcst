'use client'

import { useState, useRef, useEffect, use, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import { NORTHSTAR_AGENTS } from '../config'
import { ArrowLeft, Send, Copy, RotateCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: number
}

export default function AgentPage({ params }: { params: Promise<{ agent: string }> }) {
  const { agent: agentId } = use(params)
  const router = useRouter()
  const agent = NORTHSTAR_AGENTS.find((a) => a.id === agentId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/'); return }
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-slate-400 text-sm">
        Agent not found. <Link href="/admin" className="ml-2 text-teal-400 underline">Back to admin</Link>
      </div>
    )
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-slate-400 text-sm">
        Checking access…
      </div>
    )
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim(), ts: Date.now() }
    setMessages((prev: Message[]) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent!.id,
          message: userMsg.content,
          history: messages,
        }),
      })
      const data = await res.json() as { response?: string; error?: string }
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'assistant', content: data.response || data.error || 'No response.', ts: Date.now() },
      ])
    } catch {
      setMessages((prev: Message[]) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.', ts: Date.now() },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <Link href="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-xl">{agent.icon}</span>
        <div>
          <h1 className="text-sm font-semibold text-slate-200">{agent.name}</h1>
          <p className="text-xs text-teal-500 font-mono">{agent.role}</p>
        </div>
        <button
          onClick={() => setMessages([])}
          className="ml-auto text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1.5 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </header>

      {/* System prompt display */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3">
        <details>
          <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 select-none">
            System prompt <span className="font-mono text-slate-700">(click to expand)</span>
          </summary>
          <pre className="mt-2 text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950 rounded p-3 border border-slate-800">
            {agent.prompt}
          </pre>
        </details>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
            <div className="text-4xl">{agent.icon}</div>
            <div>
              <p className="text-slate-300 font-medium">{agent.name} is ready</p>
              <p className="text-slate-500 text-sm mt-1">{agent.description}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {agent.useCases.map((u) => (
                <button
                  key={u}
                  onClick={() => setInput(u)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">{agent.icon}</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-800/60 border border-teal-700/40 text-slate-100'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="mt-2 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="text-sm">{agent.icon}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 px-6 py-4 flex-shrink-0">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask ${agent.name} anything…`}
            rows={2}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-600 resize-none"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="self-end bg-teal-700 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-700 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
