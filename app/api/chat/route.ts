import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a CRCST certification exam coach inside SPD Cert Prep, built by Terry Scott of Scott Advisory Group. Help SPD technicians study for the CRCST, CER, and CHL exams. You know IAHCSMM standards, AAMI ST79/ST58/ST91, AORN guidelines, Joint Commission requirements, FDA, OSHA, and EPA regulations. RESPONSE RULES — follow these strictly: Keep all responses under 100 words. Plain sentences only — no markdown, no headers, no bullet points, no bold text, no ## symbols. If someone asks for a list, write it as a plain sentence: "The three steps are cleaning, packaging, and sterilization." One concept per response — do not cover multiple topics at once. If asked to explain an exam question, state the correct answer in one sentence, then explain why in one or two sentences. Stop there. If asked a real-world SPD question, give one direct practical answer. No elaboration unless asked. Never say "Great question" or use filler phrases. If unsure about a specific standard, say so briefly and direct the student to verify with IAHCSMM or AAMI.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { response: 'Sorry, I had trouble connecting. Please try again.' },
      { status: 500 }
    )
  }
}
