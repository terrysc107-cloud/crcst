'use client'

import { useState, useRef, useEffect } from 'react'
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
  // Menu state
  const [menuOpen, setMenuOpen] = useState(false)

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
        setFeedbackEmail(user.email || '')
      }
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const openChat = () => { setMenuOpen(false); setChatOpen(true) }
  const openFeedback = () => { setMenuOpen(false); setFeedbackOpen(true) }

  return (
    <>
      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Sub-buttons (shown when menu open) */}
        {menuOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 slide-up">
            <button
              onClick={openChat}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-2 rounded-full shadow-md text-sm font-mono text-navy hover:bg-cream transition"
            >
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Chat
            </button>
            <button
              onClick={openFeedback}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-2 rounded-full shadow-md text-sm font-mono text-navy hover:bg-cream transition"
            >
              <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Feedback
            </button>
          </div>
        )}

        {/* Main toggle button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-12 h-12 rounded-full bg-teal text-white shadow-lg hover:bg-teal-2 transition-all duration-200 flex items-center justify-center"
          aria-label="Help menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 slide-up border border-cream-2">
          <div className="bg-navy text-white px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-mono text-sm font-medium">SPD Study Assistant</div>
              <div className="text-xs text-teal-3">Ask me anything!</div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-navy-3 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
