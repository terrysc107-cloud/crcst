#!/usr/bin/env tsx
/**
 * Generate 2 alternate phrasings for every question in the CRCST, CHL, and CER
 * banks using Claude Haiku. Results are written to data/question-variants.json
 * (keyed by question ID) and consumed by lib/question-variant.ts at quiz time.
 *
 * Run:  npx tsx scripts/generate-question-variants.ts
 *
 * The script saves progress to data/question-variants-progress.json after every
 * batch, so it can be safely interrupted and resumed without re-processing
 * already-completed questions.
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// Question files export AppQuestion arrays with id + question text
import { QUESTIONS as CRCST } from "../lib/questions";
import { QUESTIONS as CHL } from "../lib/questions-chl";
import { QUESTIONS as CER } from "../lib/questions-cer";

const client = new Anthropic();

const DATA_DIR  = path.join(__dirname, "../data");
const OUTPUT    = path.join(DATA_DIR, "question-variants.json");
const PROGRESS  = path.join(DATA_DIR, "question-variants-progress.json");
const BATCH     = 5;   // concurrent Claude requests
const DELAY_MS  = 300; // pause between batches (ms)

type VariantMap = Record<string, string[]>; // question_id → [variant1, variant2]

// Cached system prompt — sent with cache_control so Haiku only processes it once
const SYSTEM_PROMPT = `You are an expert HSPA (Healthcare Sterile Processing Association) \
certification exam writer. Reword quiz questions so learners cannot pass by memorising \
exact phrasing — exactly how real certification exams vary question structure to test \
genuine understanding rather than recall.

Rules:
- Generate EXACTLY 2 alternate phrasings of the question stem only
- Never alter the answer options or change which answer is correct
- Vary structure: active ↔ passive voice, scenario framing, \
"which of the following…", negative phrasing, fill-in-the-blank lead-in, etc.
- Use clinically valid synonyms for technical terms where appropriate
- Every variant must be a complete, grammatically correct question
- Return ONLY a valid JSON array of exactly 2 strings — no markdown, no extra text`;

async function generateVariants(
  id: string,
  question: string,
  cert: string
): Promise<string[]> {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Cert: ${cert}\n\nQuestion: "${question}"\n\nReturn: ["variant1", "variant2"]`,
      },
    ],
  });

  const raw =
    msg.content[0].type === "text" ? msg.content[0].text.trim() : "";

  // Strip accidental markdown code fences
  const cleaned = raw
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const arr = JSON.parse(cleaned);
  if (
    !Array.isArray(arr) ||
    arr.length !== 2 ||
    arr.some((s) => typeof s !== "string" || s.trim() === "")
  ) {
    throw new Error(`Unexpected response: ${raw}`);
  }
  return arr as string[];
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  // Resume from previous run if available
  const done: VariantMap = fs.existsSync(PROGRESS)
    ? JSON.parse(fs.readFileSync(PROGRESS, "utf-8"))
    : {};

  const all = [
    ...CRCST.map((q) => ({ id: q.id, question: q.question, cert: "CRCST" })),
    ...CHL.map((q)   => ({ id: q.id, question: q.question, cert: "CHL"   })),
    ...CER.map((q)   => ({ id: q.id, question: q.question, cert: "CER"   })),
  ];

  const remaining = all.filter((q) => !(q.id in done));
  const total     = all.length;

  console.log(
    `Questions: ${total} total | ${total - remaining.length} done | ${remaining.length} remaining`
  );

  if (remaining.length === 0) {
    console.log("All variants already generated — writing final output.");
    fs.writeFileSync(OUTPUT, JSON.stringify(done, null, 2));
    return;
  }

  let errors = 0;

  for (let i = 0; i < remaining.length; i += BATCH) {
    const batch = remaining.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (q) => {
        try {
          done[q.id] = await generateVariants(q.id, q.question, q.cert);
        } catch (err) {
          console.error(`\n  ✗ [${q.cert}] id=${q.id}: ${err}`);
          done[q.id] = []; // mark so we don't retry indefinitely on resume
          errors++;
        }
      })
    );

    // Persist after every batch so interruption loses at most one batch
    fs.writeFileSync(PROGRESS, JSON.stringify(done, null, 2));

    const completed = Object.keys(done).length;
    const pct       = Math.round((completed / total) * 100);
    process.stdout.write(`\r  ${completed}/${total} (${pct}%)   `);

    if (i + BATCH < remaining.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\n\nFinished. ${errors} error(s).`);

  // Write the final output and clean up progress file
  fs.writeFileSync(OUTPUT, JSON.stringify(done, null, 2));
  if (fs.existsSync(PROGRESS)) fs.unlinkSync(PROGRESS);
  console.log(`✓  Variants written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
