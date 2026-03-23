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

  return (
    <header className="bg-navy sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link href="/dashboard" className="hover:opacity-80 transition">
        <div className="font-serif text-teal-3 text-sm">
          SPD Cert <em className="text-amber">Companion</em>
        </div>
        <div className="text-xs text-navy-3 tracking-widest">
          CRCST - CER - CIS - CHL
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <div className="bg-navy-2 border border-amber text-amber text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <span>🔥</span>
          <span>{streak}</span>
        </div>
        {user && (
          <button
            onClick={handleSignOut}
            className="text-xs border border-navy-3 text-text-3 px-3 py-1 rounded hover:text-teal-3 hover:border-teal-3 transition"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  )
}
