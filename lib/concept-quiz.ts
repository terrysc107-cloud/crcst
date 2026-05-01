import type { Question, VariantType } from './questions'

// Returns a deduplicated list of questions for a quiz session using concept-aware selection.
// For questions that share a concept_id, only one variant is returned per concept per session.
// Questions without a concept_id are always included as-is.
export function selectConceptAwareQuestions(
  questions: Question[],
  seenVariantsByConceptInSession: Map<string, Set<string>>,
  limit?: number
): Question[] {
  const seenConcepts = new Set<string>()
  const result: Question[] = []

  for (const q of questions) {
    if (!q.concept_id) {
      result.push(q)
      continue
    }

    // If we already picked a variant for this concept this session, skip
    if (seenConcepts.has(q.concept_id)) continue

    // Prefer a variant type the user hasn't seen before for this concept
    const seenTypes = seenVariantsByConceptInSession.get(q.concept_id) ?? new Set<string>()
    const variantType = q.variant_type ?? 'direct'
    if (seenTypes.has(variantType) && seenTypes.size < 5) {
      // Skip — user already saw this variant type, a better one will come later in the array
      continue
    }

    seenConcepts.add(q.concept_id)
    result.push(q)
  }

  return limit ? result.slice(0, limit) : result
}

// Given a set of questions grouped by concept, pick the next unseen variant.
// Returns null if all variants for the concept have been seen.
export function pickNextVariant(
  allVariants: Question[],
  conceptId: string,
  seenVariantTypes: Set<VariantType>
): Question | null {
  const conceptVariants = allVariants.filter((q) => q.concept_id === conceptId)
  // Prefer unseen variant types, ordered by priority
  const priority: VariantType[] = ['direct', 'application', 'scenario', 'inverse', 'distractor_swap']
  for (const vt of priority) {
    if (seenVariantTypes.has(vt)) continue
    const match = conceptVariants.find((q) => q.variant_type === vt)
    if (match) return match
  }
  // All types seen — return any (for spaced repetition cycle)
  return conceptVariants[0] ?? null
}

// Utility: group questions by concept_id
export function groupByConceptId(questions: Question[]): Map<string, Question[]> {
  const map = new Map<string, Question[]>()
  for (const q of questions) {
    if (!q.concept_id) continue
    const existing = map.get(q.concept_id) ?? []
    existing.push(q)
    map.set(q.concept_id, existing)
  }
  return map
}
