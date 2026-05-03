/**
 * Upload scraped instrument images to Supabase Storage and seed the DB.
 *
 * Prerequisites:
 *   1. Run scripts/scrape-instrument-images.ts first
 *   2. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   3. Supabase Storage bucket "instruments" must exist (public)
 *   4. instrument_images table must exist (scripts/create-instrument-images-table.sql)
 *
 * Usage:
 *   npx tsx scripts/seed-instrument-images.ts
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const META_FILE = path.join(process.cwd(), "data", "instruments.json");
const IMAGES_DIR = path.join(process.cwd(), "public", "instruments");
const BUCKET = "instruments";

interface InstrumentMeta {
  id: string;
  label: string;
  domain: string;
  filename: string;
  local_path: string;
  wikimedia_url: string;
  license: string;
  author: string;
  category: string;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sb = createClient(url, key);
  const instruments: InstrumentMeta[] = JSON.parse(fs.readFileSync(META_FILE, "utf-8"));

  let uploaded = 0;
  let skipped = 0;

  for (const inst of instruments) {
    const filePath = path.join(IMAGES_DIR, inst.filename);
    if (!fs.existsSync(filePath)) {
      console.log(`  ✗ missing file ${inst.filename}`);
      skipped++;
      continue;
    }

    const storagePath = `${inst.category}/${inst.filename}`;
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = inst.filename.endsWith(".png") ? "image/png" : "image/jpeg";

    // Upload to storage
    const { error: uploadErr } = await sb.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

    if (uploadErr) {
      console.log(`  ✗ upload failed ${inst.filename}: ${uploadErr.message}`);
      skipped++;
      continue;
    }

    const { data: publicUrl } = sb.storage.from(BUCKET).getPublicUrl(storagePath);

    // Upsert into instrument_images table
    const { error: dbErr } = await sb.from("instrument_images").upsert({
      label: inst.label,
      domain: inst.domain,
      image_url: publicUrl.publicUrl,
      storage_path: storagePath,
      wikimedia_url: inst.wikimedia_url,
      license: inst.license,
      author: inst.author,
      category: inst.category,
      is_active: true,
    });

    if (dbErr) {
      console.log(`  ✗ db error ${inst.label}: ${dbErr.message}`);
      skipped++;
      continue;
    }

    console.log(`  ✓ ${inst.label} — ${inst.filename}`);
    uploaded++;
  }

  console.log(`\nDone. Uploaded ${uploaded}, skipped ${skipped}.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
