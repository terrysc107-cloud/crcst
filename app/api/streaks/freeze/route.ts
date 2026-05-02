import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { manualFreeze } from '@/lib/dal/streaks'

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

  const result = await manualFreeze(user.id)

  if (!result.success) {
    return NextResponse.json({ error: 'No freeze credits available' }, { status: 400 })
  }

  return NextResponse.json(result)
}
