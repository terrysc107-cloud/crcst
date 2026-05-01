import { NextRequest, NextResponse } from 'next/server'
import { createClientWithAuthHeader, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAuth = createClientWithAuthHeader(authHeader)
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, message, email, pageUrl, userAgent } = body

    if (!type || !message) {
      return NextResponse.json({ error: 'Type and message are required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message is too long (max 2000 characters)' }, { status: 400 })
    }

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin.from('feedback').insert({
      user_id: user.id,
      type,
      message: message.trim(),
      email: email?.trim() || null,
      page_url: pageUrl || null,
      user_agent: userAgent || null,
    })

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
