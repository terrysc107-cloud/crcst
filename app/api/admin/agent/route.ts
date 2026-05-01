import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { NORTHSTAR_AGENTS } from '@/app/admin/agents/config'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { agentId, message, history = [] } = await request.json()

    const agent = NORTHSTAR_AGENTS.find((a) => a.id === agentId)
    if (!agent) {
      return NextResponse.json({ error: 'Unknown agent' }, { status: 400 })
    }

    // Build conversation messages for multi-turn context
    const conversationMessages = (history as Array<{ role: string; content: string }>)
      .slice(-10) // keep last 10 messages for context
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    conversationMessages.push({ role: 'user', content: message })

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: agent.prompt,
      messages: conversationMessages,
      maxOutputTokens: 2000,
    })

    return NextResponse.json({ response: result.text, agent: agent.name })
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Agent unavailable. Check your API key and try again.' },
      { status: 500 }
    )
  }
}
