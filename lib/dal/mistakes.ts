import { createClient, SupabaseClient } from '@supabase/supabase-js'

type Cert = 'crcst' | 'chl' | 'cer'

function getServerClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function certFilter(query: any, cert: Cert) {
  if (cert === 'chl') return query.like('question_id', 'chl-%')
  if (cert === 'cer') return query.like('question_id', 'cer-%')
  return query
    .not('question_id', 'like', 'chl-%')
    .not('question_id', 'like', 'cer-%')
}

// Returns question IDs answered incorrectly, most-recent first.
export async function getRecentMistakeIds(
  userId: string,
  cert: Cert,
  limit = 20,
  client?: SupabaseClient
): Promise<string[]> {
  const sb = client ?? getServerClient()

  const { data, error } = await certFilter(
    sb
      .from('question_state')
      .select('question_id')
      .eq('user_id', userId)
      .eq('last_result', 'incorrect')
      .order('last_seen', { ascending: false })
      .limit(limit),
    cert
  )

  if (error) {
    console.error('getRecentMistakeIds error:', error)
    return []
  }
  return (data ?? []).map((r: { question_id: string }) => r.question_id)
}

// Returns count of questions currently marked incorrect (for badge display).
export async function getRecentMistakeCount(
  userId: string,
  cert: Cert,
  client?: SupabaseClient
): Promise<number> {
  const sb = client ?? getServerClient()

  const { count, error } = await certFilter(
    sb
      .from('question_state')
      .select('question_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('last_result', 'incorrect'),
    cert
  )

  if (error) {
    console.error('getRecentMistakeCount error:', error)
    return 0
  }
  return count ?? 0
}
