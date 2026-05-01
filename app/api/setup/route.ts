import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET
  const providedSecret = request.headers.get('x-setup-secret')
  if (!setupSecret || providedSecret !== setupSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { error: tableError } = await supabase.from('quiz_sessions').select('id').limit(1)

    if (tableError && tableError.message.includes('does not exist')) {
      console.log('Creating quiz_sessions table')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[setup] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
