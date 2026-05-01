import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 90

const VARIANT_SYSTEM_PROMPT = `You are an expert certification exam question writer for the healthcare sterile processing field.
You write questions for CRCST, CHL, and CER certification exams administered by IAHCSMM and CBSPD.

VARIANT TYPES you can produce:
- direct: Standard phrasing — "The suffix -ectomy means: …"
- inverse: Ask for the term — "Which suffix indicates surgical removal?"
- application: Use a real instrument/procedure name — "A cholecystectomy removes the: …"
- scenario: Patient or workplace context — "A patient is scheduled for an appendectomy. This means the surgeon will: …"
- distractor_swap: Same correct stem and answer, but all wrong answers are replaced with new plausible distractors

RULES — follow these exactly:
1. Every variant must test the SAME knowledge as the source question. Do not introduce new concepts.
2. Wrong answers must be plausible — they should be real terms or procedures a student might confuse with the correct answer.
3. Correct answer must be unambiguously correct per IAHCSMM standards.
4. No answer should telegraph the correct choice (avoid "all of the above" or obviously wrong distractors).
5. Write in exam tone: clear, concise, professional. No trick questions.
6. Keep stems under 40 words. Keep each option under 12 words.
7. Explanation must say WHY the correct answer is correct (1–2 sentences, cite standards if applicable).

OUTPUT FORMAT — return valid JSON only, no markdown fences:
{
  "variants": [
    {
      "variant_type": "direct" | "inverse" | "application" | "scenario" | "distractor_swap",
      "stem": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why the correct answer is correct."
    }
  ]
}`

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

    const { sourceQuestion, concept, variantTypes, certType } = await request.json()

    if (!sourceQuestion || !concept) {
      return NextResponse.json({ error: 'sourceQuestion and concept are required' }, { status: 400 })
    }

    const requestedTypes: string[] = variantTypes ?? ['direct', 'inverse', 'application', 'scenario', 'distractor_swap']

    const userPrompt = `SOURCE QUESTION:
Stem: ${sourceQuestion.question}
Options: ${(sourceQuestion.options as string[]).map((o: string, i: number) => `${i}. ${o}`).join(' | ')}
Correct index: ${sourceQuestion.correct_answer}
Domain: ${sourceQuestion.domain}
Cert type: ${certType ?? 'CRCST'}
Explanation: ${sourceQuestion.explanation}

CONCEPT SUMMARY:
${concept}

Generate ${requestedTypes.length} question variant(s) with these types: ${requestedTypes.join(', ')}.
Return only the JSON object described in the system prompt.`

    const result = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: VARIANT_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 3000,
    })

    let parsed: { variants: unknown[] }
    try {
      parsed = JSON.parse(result.text)
    } catch {
      // Try to extract JSON if model wrapped it
      const match = result.text.match(/\{[\s\S]*\}/)
      if (!match) {
        return NextResponse.json({ error: 'Model returned invalid JSON', raw: result.text }, { status: 500 })
      }
      parsed = JSON.parse(match[0])
    }

    return NextResponse.json({
      variants: parsed.variants,
      sourceId: sourceQuestion.id,
      model: 'claude-sonnet-4-20250514',
    })
  } catch (error) {
    console.error('Variant generator error:', error)
    return NextResponse.json({ error: 'Generation failed. Check logs.' }, { status: 500 })
  }
}
