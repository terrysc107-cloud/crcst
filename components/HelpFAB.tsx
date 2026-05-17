'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Types ────────────────────────────────────────────────────────────────────
type FeedbackType = 'bug' | 'feature' | 'question' | 'other'
interface ChatMessage { role: 'user' | 'ai'; content: string }

const feedbackTypes: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'bug', label: 'Report Bug', icon: '🐛' },
  { value: 'feature', label: 'Suggest Feature', icon: '💡' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'other', label: 'Other', icon: '💬' },
]

export default function HelpFAB() {
  const pathname = usePathname()

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Feedback state
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isPaid, setIsPaid] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setFeedbackEmail(user.email || '')
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier, tier_expires_at')
          .eq('id', user.id)
          .single()
        const tier = profile?.tier as string | undefined
        const expires = profile?.tier_expires_at as string | null | undefined
        const expired = expires ? new Date(expires) < new Date() : false
        setIsPaid((tier === 'pro' || tier === 'triple_crown') && !expired)
      } else {
        setIsPaid(false)
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for triggers dispatched by the header buttons
  useEffect(() => {
    const openChatHandler = () => setChatOpen(true)
    const openFeedbackHandler = () => setFeedbackOpen(true)
    window.addEventListener('open-ai-chat', openChatHandler)
    window.addEventListener('open-feedback', openFeedbackHandler)
    return () => {
      window.removeEventListener('open-ai-chat', openChatHandler)
      window.removeEventListener('open-feedback', openFeedbackHandler)
    }
  }, [])

  // ── Chat handlers ──────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMessage = chatInput.trim()
    setChatInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) throw new Error('Please sign in to use the AI chat.')
        if (res.status === 429) throw new Error(data.error || 'You have reached your daily chat limit.')
        throw new Error(data.error || 'Failed to get response')
      }
      setMessages((prev) => [...prev, { role: 'ai', content: data.response }])
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'ai', content: e.message || 'Sorry, encountered an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() }
  }

  // ── Feedback handler ───────────────────────────────────────────────────────
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackMessage.trim()) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: feedbackType,
          message: feedbackMessage,
          email: feedbackEmail || null,
          pageUrl: typeof window !== 'undefined' ? window.location.href : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          userId,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setFeedbackMessage('')
        setTimeout(() => { setFeedbackOpen(false); setSubmitted(false) }, 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitError(res.status === 401 ? 'Please sign in to submit feedback.' : (data.error || 'Failed to submit. Please try again.'))
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hide on the public landing page
  if (pathname === '/') return null

  return (
    <>
      {/* ── Chat Window ── */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 slide-up border border-cream-2" style={{ height: isPaid === false ? 'auto' : '450px' }}>
          <div className="bg-navy text-white px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-mono text-sm font-medium">SPD Study Assistant</div>
              {isPaid && <div className="text-xs text-teal-3">Ask me anything!</div>}
            </div>
            <button onClick={() => setChatOpen(false)} className="text-navy-3 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free-user locked state */}
          {isPaid === false && (
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-cream-2 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-text-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="font-serif text-lg text-navy mb-1">Pro Feature</p>
              <p className="text-sm text-text-3 mb-5">
                AI Study Chat is available for Pro and Triple Crown members. Ask unlimited questions, get instant answers.
              </p>
              <a
                href="/pricing"
                className="block w-full py-3 px-6 rounded-lg bg-teal text-white font-mono text-sm text-center hover:bg-teal-2 transition"
              >
                Upgrade to Pro — $19
              </a>
              <p className="text-xs text-text-3 mt-3">90 days · No subscription · One-time payment</p>
            </div>
          )}

          {/* Loading state */}
          {isPaid === null && (
            <div className="flex-1 flex items-center justify-center bg-cream">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-teal rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}

          {/* Full chat (paid users) */}
          {isPaid === true && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎓</div>
                    <p className="text-sm text-text-3 mb-4">Hi! I&apos;m your SPD certification study assistant.</p>
                    <div className="space-y-2">
                      {['What are the sterilization methods?', 'Explain the decontamination process', 'What is a biological indicator?'].map((s) => (
                        <button key={s} onClick={() => setChatInput(s)} className="block w-full text-left text-xs bg-white text-teal px-3 py-2 rounded-lg hover:bg-teal hover:text-white transition border border-cream-2">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] text-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-teal text-white rounded-br-sm' : 'bg-white text-text border border-cream-2 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-text border border-cream-2 px-4 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-teal rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-cream-2 p-3 bg-white">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleChatKey}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-2 text-sm border border-cream-2 rounded-full focus:outline-none focus:border-teal font-mono"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={sendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center hover:bg-teal-2 disabled:opacity-50 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Feedback Modal ── */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFeedbackOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="bg-navy px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white">Send Feedback</h2>
              <button onClick={() => setFeedbackOpen(false)} className="text-white/60 hover:text-white transition" aria-label="Close">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-correct-bg text-correct rounded-full flex items-center justify-center mx-auto mb-4 bounce-in">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-serif text-lg text-navy">Thank you!</p>
                <p className="text-sm text-text-3 mt-1">Your feedback has been received.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">Feedback Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((ft) => (
                      <button key={ft.value} type="button" onClick={() => setFeedbackType(ft.value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-mono transition-all ${feedbackType === ft.value ? 'border-teal bg-teal/10 text-teal' : 'border-cream-2 bg-cream hover:border-teal/30'}`}>
                        <span className="mr-1.5">{ft.icon}</span>{ft.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">
                    Message <span className="text-wrong">*</span>
                  </label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={feedbackType === 'bug' ? 'Describe the bug and steps to reproduce it...' : feedbackType === 'feature' ? 'What feature would you like to see?' : feedbackType === 'question' ? 'What would you like to know?' : 'What would you like to share?'}
                    rows={4} maxLength={2000} required
                    className="w-full px-4 py-3 rounded-lg border-2 border-cream-2 bg-cream focus:border-teal focus:outline-none resize-none text-sm"
                  />
                  <div className="text-xs text-text-3 text-right mt-1">{feedbackMessage.length}/2000</div>
                </div>

                {!userId && (
                  <div>
                    <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">
                      Email <span className="text-text-3">(optional, for follow-up)</span>
                    </label>
                    <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg border-2 border-cream-2 bg-cream focus:border-teal focus:outline-none text-sm" />
                  </div>
                )}

                {submitError && <p className="text-xs text-wrong text-center">{submitError}</p>}

                <button type="submit" disabled={isSubmitting || !feedbackMessage.trim()}
                  className="w-full py-3 px-6 rounded-lg bg-teal text-white font-mono text-sm tracking-wider uppercase hover:bg-teal-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>

                <p className="text-xs text-text-3 text-center">Your feedback helps us improve SPD Cert Companion</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
