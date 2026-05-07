#!/usr/bin/env tsx
/**
 * Generate additional CER and CHL exam questions per chapter using Claude.
 *
 * Reads the existing hand-curated banks (lib/questions-cer.ts, lib/questions-chl.ts),
 * groups them by chapter, then asks Sonnet 4.6 to draft N new questions per chapter
 * that match the style and don't duplicate. Writes the result as TypeScript array
 * literals to:
 *   lib/questions-cer-generated.ts
 *   lib/questions-chl-generated.ts
 *
 * Progress is checkpointed to data/additional-questions-progress.json after every
 * chapter, so the script can be safely interrupted and resumed.
 *
 * Run:        npx tsx scripts/generate-additional-questions.ts
 * Override:   PER_CHAPTER=15 npx tsx scripts/generate-additional-questions.ts
 *             ONLY=cer npx tsx scripts/generate-additional-questions.ts
 *             ONLY=chl npx tsx scripts/generate-additional-questions.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

import { cerQuestions, type CERQuestion } from "../lib/questions-cer";
import { chlQuestions, type Question as CHLQuestion } from "../lib/questions-chl";

const client = new Anthropic();

const DATA_DIR = path.join(__dirname, "../data");
const LIB_DIR = path.join(__dirname, "../lib");
const PROGRESS_FILE = path.join(DATA_DIR, "additional-questions-progress.json");
const CER_OUTPUT = path.join(LIB_DIR, "questions-cer-generated.ts");
const CHL_OUTPUT = path.join(LIB_DIR, "questions-chl-generated.ts");

const PER_CHAPTER = parseInt(process.env.PER_CHAPTER ?? "10", 10);
const CONCURRENCY = 4;
const ONLY = (process.env.ONLY ?? "").toLowerCase();

const SYSTEM_PROMPT = `You are an expert HSPA (Healthcare Sterile Processing Association) \
certification exam writer. You craft new practice questions for CER (Certified Endoscope \
Reprocessor) and CHL (Certified in Healthcare Leadership) candidates that mirror the style, \
difficulty mix, and clinical accuracy of real certification exams.

Hard rules — every output must satisfy these:
- Output ONLY a valid JSON array. No markdown, no prose, no code fences.
- Each item is an object with exactly these keys (no extras): id, domain, chapter, type, \
question, options, correct, explanation, difficulty.
- "type" is "mcq" (with options a/b/c/d) or "true_false" (with options a/b only — a="True", b="False").
- "options" is an object with letter keys (a/b/c/d for mcq; a/b for true_false).
- "correct" is exactly one of "a", "b", "c", or "d" — and the letter that maps to the correct option.
- "difficulty" is exactly one of "easy", "medium", "hard". Aim for a roughly balanced mix.
- "explanation" is 1-3 sentences explaining WHY the answer is correct, citing relevant \
clinical reasoning.
- "question" is a complete, grammatically correct stem with a clear single answer.
- All four options for MCQs must be plausible distractors at the same length and specificity \
level — no joke options, no give-aways.
- Do NOT duplicate any existing question stem provided in the context. Cover different \
sub-concepts within the chapter where possible.
- Every fact must be accurate to current HSPA / IAHCSMM / AAMI / AORN standards. If unsure, \
prefer well-established practices over edge cases.`;

interface GeneratedQuestion {
  id: string;
  domain: string;
  chapter: number;
  type: "mcq" | "true_false";
  question: string;
  options: { a: string; b: string; c?: string; d?: string };
  correct: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface ChapterTask {
  cert: "cer" | "chl";
  chapter: number;
  domain: string;
  samples: Array<{ question: string; correct: string; explanation: string }>;
  startIndex: number;
}

type ProgressMap = Record<string, GeneratedQuestion[]>;

function loadProgress(): ProgressMap {
  if (!fs.existsSync(PROGRESS_FILE)) return {};
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
}

function saveProgress(progress: ProgressMap): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function buildChapterTasks(
  cert: "cer" | "chl",
  questions: Array<CERQuestion | CHLQuestion>,
): ChapterTask[] {
  const byChapter = new Map<number, Array<CERQuestion | CHLQuestion>>();
  for (const q of questions) {
    if (!byChapter.has(q.chapter)) byChapter.set(q.chapter, []);
    byChapter.get(q.chapter)!.push(q);
  }

  return [...byChapter.entries()]
    .sort(([a], [b]) => a - b)
    .map(([chapter, qs]) => {
      const domains = new Map<string, number>();
      for (const q of qs) domains.set(q.domain, (domains.get(q.domain) ?? 0) + 1);
      const dominantDomain = [...domains.entries()].sort((a, b) => b[1] - a[1])[0][0];

      const samples = qs.slice(0, 25).map((q) => ({
        question: q.question,
        correct: q.options[q.correct] ?? "",
        explanation: q.explanation,
      }));

      const startIndex = qs.length + 1;

      return {
        cert,
        chapter,
        domain: dominantDomain,
        samples,
        startIndex,
      };
    });
}

function chapterKey(task: ChapterTask): string {
  return `${task.cert}-ch${task.chapter}`;
}

function buildUserPrompt(task: ChapterTask, count: number): string {
  const certLabel = task.cert === "cer" ? "CER (Endoscope Reprocessor)" : "CHL (Healthcare Leadership)";
  const idPrefix = task.cert === "cer" ? `cer-ch${task.chapter}-` : `chl-${task.chapter}-`;

  const sampleBlock = task.samples
    .map(
      (s, i) =>
        `Sample ${i + 1}:\n  Q: ${s.question}\n  A: ${s.correct}\n  Why: ${s.explanation}`,
    )
    .join("\n\n");

  const typeMixLine =
    task.cert === "cer"
      ? `- Mix question types: ~${Math.max(1, Math.round(count * 0.7))} mcq + ~${Math.max(1, Math.round(count * 0.3))} true_false`
      : `- All questions MUST be type "mcq" with 4 options a/b/c/d. Do not generate true_false items.`;

  return `Cert: ${certLabel}
Chapter: ${task.chapter}
Primary domain: ${task.domain}

Existing questions in this chapter (do not duplicate stems or core concepts already covered):

${sampleBlock}

Task: Generate exactly ${count} new questions for chapter ${task.chapter} of the ${certLabel} curriculum.

Required formatting for each question:
- id: "${idPrefix}gen-1", "${idPrefix}gen-2", ... up to "${idPrefix}gen-${count}"
- domain: "${task.domain}" (or a closely related sub-domain visible in the samples)
- chapter: ${task.chapter}
${typeMixLine}
- Mix difficulty: roughly 30% easy / 50% medium / 20% hard
- Explore sub-topics, scenarios, and edge cases that the existing samples did NOT cover

Return ONLY the JSON array of ${count} question objects. No prose, no fences.`;
}

function validate(arr: unknown, expected: number, task: ChapterTask): GeneratedQuestion[] {
  if (!Array.isArray(arr)) throw new Error("Response is not an array");
  if (arr.length === 0) throw new Error("Response array is empty");

  const seen = new Set<string>();
  const out: GeneratedQuestion[] = [];

  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const q = raw as Record<string, unknown>;
    const id = String(q.id ?? "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const type: "mcq" | "true_false" = q.type === "true_false" ? "true_false" : "mcq";
    // CHL bank only supports 4-option MCQs; skip true/false items returned for CHL
    if (task.cert === "chl" && type === "true_false") continue;
    const opts = (q.options ?? {}) as Record<string, unknown>;
    const correct = String(q.correct ?? "").trim().toLowerCase();
    if (!["a", "b", "c", "d"].includes(correct)) continue;
    if (type === "mcq" && (!opts.a || !opts.b || !opts.c || !opts.d)) continue;
    if (type === "true_false" && (!opts.a || !opts.b)) continue;
    if (!opts[correct as keyof typeof opts]) continue;

    const difficulty = ["easy", "medium", "hard"].includes(String(q.difficulty))
      ? (q.difficulty as "easy" | "medium" | "hard")
      : "medium";

    out.push({
      id,
      domain: String(q.domain ?? task.domain),
      chapter: Number(q.chapter ?? task.chapter),
      type,
      question: String(q.question ?? "").trim(),
      options: {
        a: String(opts.a),
        b: String(opts.b),
        ...(opts.c ? { c: String(opts.c) } : {}),
        ...(opts.d ? { d: String(opts.d) } : {}),
      },
      correct: correct as "a" | "b" | "c" | "d",
      explanation: String(q.explanation ?? "").trim(),
      difficulty,
    });
  }

  if (out.length < Math.max(1, Math.floor(expected * 0.5))) {
    throw new Error(`Only ${out.length}/${expected} valid questions returned`);
  }
  return out;
}

async function generateForChapter(task: ChapterTask): Promise<GeneratedQuestion[]> {
  const userPrompt = buildUserPrompt(task, PER_CHAPTER);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        // @ts-expect-error cache_control valid at runtime
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`JSON parse failed: ${(err as Error).message}\n--- raw ---\n${text.slice(0, 500)}`);
  }
  return validate(parsed, PER_CHAPTER, task);
}

function emitTsFile(
  cert: "cer" | "chl",
  questions: GeneratedQuestion[],
  outputPath: string,
): void {
  const typeName = cert === "cer" ? "CERQuestion" : "CHLQuestion";
  const importLine =
    cert === "cer"
      ? `import type { CERQuestion } from "./questions-cer";`
      : `import type { Question as CHLQuestion } from "./questions-chl";`;
  const exportName = cert === "cer" ? "cerGeneratedQuestions" : "chlGeneratedQuestions";

  const sorted = [...questions].sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.id.localeCompare(b.id);
  });

  const body = sorted.map((q) => {
    const optsParts = [
      `a: ${JSON.stringify(q.options.a)}`,
      `b: ${JSON.stringify(q.options.b)}`,
      ...(q.options.c ? [`c: ${JSON.stringify(q.options.c)}`] : []),
      ...(q.options.d ? [`d: ${JSON.stringify(q.options.d)}`] : []),
    ];
    const fields = [
      `id: ${JSON.stringify(q.id)}`,
      ...(cert === "cer" ? [`type: ${JSON.stringify(q.type)}`] : []),
      `domain: ${JSON.stringify(q.domain)}`,
      `chapter: ${q.chapter}`,
      `question: ${JSON.stringify(q.question)}`,
      `options: { ${optsParts.join(", ")} }`,
      `correct: ${JSON.stringify(q.correct)}`,
      `explanation: ${JSON.stringify(q.explanation)}`,
      `difficulty: ${JSON.stringify(q.difficulty)}`,
    ];
    return `  {\n    ${fields.join(",\n    ")},\n  }`;
  });

  const content = `// AUTO-GENERATED — populated by scripts/generate-additional-questions.ts
// Do not hand-edit; rerun the script to regenerate.

${importLine}

export const ${exportName}: ${typeName}[] = [
${body.join(",\n")},
];
`;

  fs.writeFileSync(outputPath, content);
  console.log(`  wrote ${questions.length} questions → ${path.relative(process.cwd(), outputPath)}`);
}

async function processQueue(
  tasks: ChapterTask[],
  progress: ProgressMap,
  cert: "cer" | "chl",
): Promise<void> {
  const remaining = tasks.filter((t) => !progress[chapterKey(t)]);
  console.log(
    `  ${cert.toUpperCase()}: ${tasks.length} chapters total · ${remaining.length} remaining · ${PER_CHAPTER} questions each`,
  );

  let completed = tasks.length - remaining.length;
  let errors = 0;

  for (let i = 0; i < remaining.length; i += CONCURRENCY) {
    const batch = remaining.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (task) => {
        const key = chapterKey(task);
        try {
          const qs = await generateForChapter(task);
          progress[key] = qs;
          completed++;
          process.stdout.write(
            `    ✓ ${key} (${qs.length} questions) — ${completed}/${tasks.length}\n`,
          );
        } catch (err) {
          errors++;
          console.error(`    ✗ ${key}: ${(err as Error).message}`);
        }
      }),
    );
    saveProgress(progress);
  }

  if (errors > 0) console.log(`  ${errors} chapter(s) failed — re-run to retry.`);
}

async function main(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const progress = loadProgress();

  const cerTasks = buildChapterTasks("cer", cerQuestions);
  const chlTasks = buildChapterTasks("chl", chlQuestions);

  const runCer = ONLY === "" || ONLY === "cer";
  const runChl = ONLY === "" || ONLY === "chl";

  if (runCer) {
    console.log("\n[CER]");
    await processQueue(cerTasks, progress, "cer");
  }
  if (runChl) {
    console.log("\n[CHL]");
    await processQueue(chlTasks, progress, "chl");
  }

  // Emit final TS files from progress map
  console.log("\n[Output]");
  if (runCer) {
    const cerOut: GeneratedQuestion[] = cerTasks.flatMap(
      (t) => progress[chapterKey(t)] ?? [],
    );
    emitTsFile("cer", cerOut, CER_OUTPUT);
  }
  if (runChl) {
    const chlOut: GeneratedQuestion[] = chlTasks.flatMap(
      (t) => progress[chapterKey(t)] ?? [],
    );
    emitTsFile("chl", chlOut, CHL_OUTPUT);
  }

  console.log("\nDone.");
  console.log("Next: run `npx tsx scripts/generate-question-variants.ts` to add wording variants for the new questions.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
