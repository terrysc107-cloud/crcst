'use client'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface HeaderProps {
  user: any
  streak?: number
}

export default function Header({ user, streak = 0 }: HeaderProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const dispatch = (type: 'open-ai-chat' | 'open-feedback') => {
    window.dispatchEvent(new CustomEvent(type))
  }

  return (
    <header className="bg-navy sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link href="/dashboard" className="hover:opacity-80 transition">
        <div className="font-serif text-teal-3 text-sm">
          SPD Cert <em className="text-amber">Companion</em>
        </div>
        <div className="text-xs text-navy-3 tracking-widest">
          CRCST - CHL - CER - SJT
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <div className="bg-navy-2 border border-amber text-amber text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <span>🔥</span>
          <span>{streak}</span>
        </div>
        <button
          onClick={() => dispatch('open-ai-chat')}
          aria-label="Open AI study chat"
          title="AI Chat"
          className="w-8 h-8 rounded-full border border-teal-3 text-teal-3 hover:bg-teal-3 hover:text-navy transition flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button
          onClick={() => dispatch('open-feedback')}
          aria-label="Send feedback or get help"
          title="Help & Feedback"
          className="w-8 h-8 rounded-full border border-navy-3 text-text-3 hover:text-teal-3 hover:border-teal-3 transition flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        {user && (
          <>
            <Link
              href="/dashboard"
              className="text-xs border border-teal-3 text-teal-3 px-3 py-1 rounded hover:bg-teal-3 hover:text-navy transition"
            >
              Account
            </Link>
            <button
              onClick={handleSignOut}
              className="text-xs border border-navy-3 text-text-3 px-3 py-1 rounded hover:text-teal-3 hover:border-teal-3 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  )
}
