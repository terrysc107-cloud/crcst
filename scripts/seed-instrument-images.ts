/**
 * Reads data/instruments.json (produced by scrape-instrument-images.ts),
 * uploads each image to Supabase Storage bucket 'instruments', and upserts
 * rows into the instrument_images table.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *     npx tsx scripts/seed-instrument-images.ts
 *
 * Note: the anon key is sufficient only if the bucket is public and RLS
 * allows service-role inserts.  For production, set SUPABASE_SERVICE_ROLE_KEY
 * instead and the script will use it automatically.
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

interface ManifestEntry {
  name: string
  category: string
  domain: string
  localPath: string
  attribution: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or a Supabase key env var')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'instruments.json')
const BUCKET = 'instruments'

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('data/instruments.json not found. Run scrape-instrument-images.ts first.')
    process.exit(1)
  }

  const manifest: ManifestEntry[] = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
  console.log(`Seeding ${manifest.length} instruments…\n`)

  for (const entry of manifest) {
    const localFile = path.join(process.cwd(), entry.localPath)
    if (!fs.existsSync(localFile)) {
      console.warn(`  skip (file missing): ${entry.localPath}`)
      continue
    }

    const storageKey = `${entry.category}.jpg`
    const fileBuffer = fs.readFileSync(localFile)

    // Upload to Supabase Storage (upsert)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error(`  upload error for ${entry.name}:`, uploadError.message)
      continue
    }

    // Upsert DB row
    const { error: dbError } = await supabase.from('instrument_images').upsert(
      {
        name: entry.name,
        category: entry.category,
        domain: entry.domain,
        storage_key: storageKey,
        attribution: entry.attribution || null,
        active: true,
      },
      { onConflict: 'storage_key' }
    )

    if (dbError) {
      console.error(`  db error for ${entry.name}:`, dbError.message)
    } else {
      console.log(`  seeded: ${entry.name}`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => { console.error(err); process.exit(1) })
