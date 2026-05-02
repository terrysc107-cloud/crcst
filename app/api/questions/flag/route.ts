import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { question_id, note, user_id } = await req.json()
    if (!question_id) {
      return NextResponse.json({ error: 'question_id required' }, { status: 400 })
    }
    const { error } = await supabaseAdmin.from('question_flags').insert({
      question_id: String(question_id),
      note: note ?? null,
      user_id: user_id ?? null,
    })
    if (error) {
      console.error('[flag] insert error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[flag] unexpected error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
