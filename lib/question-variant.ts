/**
 * Question wording variation algorithm.
 *
 * After the generation script runs, data/question-variants.json holds 2
 * alternate phrasings per question ID. This module decides — based on how
 * many times the user has answered a question correctly — whether to show
 * the original wording or a variant.
 *
 * Probability table:
 *   correct answers | variant probability
 *   --------------- | -------------------
 *        0          |  0%  — never seen / not yet correct; show original
 *        1          | 25%  — answered once; light variation
 *        2          | 55%  — comfortable; mix it up
 *       3+          | 85%  — mastered; almost always vary the wording
 *
 * This mirrors how real HSPA exams work: the same concept appears with
 * different sentence structure across test administrations so candidates
 * must understand the material, not memorise the phrasing.
 */

import variantsData from "@/data/question-variants.json";

const variants = variantsData as Record<string, string[]>;

function variantProbability(correctCount: number): number {
  if (correctCount <= 0) return 0;
  if (correctCount === 1) return 0.25;
  if (correctCount === 2) return 0.55;
  return 0.85;
}

/**
 * Return the question text to display.
 * Falls back to the original if no variants have been generated yet.
 */
export function selectQuestionText(
  questionId: string,
  originalText: string,
  correctCount: number
): string {
  const pool = (variants[questionId] ?? []).filter((v) => v.trim().length > 0);
  if (pool.length === 0) return originalText;
  if (Math.random() >= variantProbability(correctCount)) return originalText;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Build a { questionId → correctCount } map from raw question_attempts rows.
 * Pass this to selectQuestionText at quiz-start time.
 */
export function buildCorrectCountMap(
  attempts: Array<{ question_id: string; was_correct: boolean }>
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const a of attempts) {
    if (a.was_correct) {
      map[a.question_id] = (map[a.question_id] ?? 0) + 1;
    }
  }
  return map;
}
