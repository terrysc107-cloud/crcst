import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { recordActivity } from '@/lib/dal/streaks'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getServiceClient()
  const { data: { user } } = await sb.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if user is Pro to determine freeze credit logic
  const { data: profile } = await sb
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  const isPro = profile?.tier === 'pro' || profile?.tier === 'triple_crown'
  const state = await recordActivity(user.id, isPro)

  return NextResponse.json(state)
}
