'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'bug' | 'feature' | 'question' | 'other'

const feedbackTypes: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'bug', label: 'Report Bug', icon: '🐛' },
  { value: 'feature', label: 'Suggest Feature', icon: '💡' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'other', label: 'Other', icon: '💬' },
]

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('feature')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setEmail(user.email || '')
      }
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          email: email || null,
          pageUrl: typeof window !== 'undefined' ? window.location.href : null,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          userId,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setMessage('')
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-teal text-white shadow-lg hover:bg-teal-2 transition-all duration-200 flex items-center justify-center group"
        aria-label="Send feedback"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="absolute right-full mr-3 px-2 py-1 bg-navy text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Feedback
        </span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal */}
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-navy px-6 py-4 flex items-center justify-between">
              <h2 className="font-serif text-lg text-white">Send Feedback</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Type Selector */}
                <div>
                  <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((ft) => (
                      <button
                        key={ft.value}
                        type="button"
                        onClick={() => setType(ft.value)}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-mono transition-all ${
                          type === ft.value
                            ? 'border-teal bg-teal/10 text-teal'
                            : 'border-cream-2 bg-cream hover:border-teal/30'
                        }`}
                      >
                        <span className="mr-1.5">{ft.icon}</span>
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">
                    Message <span className="text-wrong">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === 'bug'
                        ? 'Describe the bug and steps to reproduce it...'
                        : type === 'feature'
                        ? 'What feature would you like to see?'
                        : type === 'question'
                        ? 'What would you like to know?'
                        : 'What would you like to share?'
                    }
                    rows={4}
                    maxLength={2000}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-cream-2 bg-cream focus:border-teal focus:outline-none resize-none text-sm"
                  />
                  <div className="text-xs text-text-3 text-right mt-1">
                    {message.length}/2000
                  </div>
                </div>

                {/* Email (optional if not logged in) */}
                {!userId && (
                  <div>
                    <label className="text-xs font-mono text-text-3 tracking-wider uppercase block mb-2">
                      Email <span className="text-text-3">(optional, for follow-up)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg border-2 border-cream-2 bg-cream focus:border-teal focus:outline-none text-sm"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-3 px-6 rounded-lg bg-teal text-white font-mono text-sm tracking-wider uppercase hover:bg-teal-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>

                <p className="text-xs text-text-3 text-center">
                  Your feedback helps us improve SPD Cert Companion
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
