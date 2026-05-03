/**
 * Scrapes CC-licensed instrument photos from Wikimedia Commons and saves them
 * to public/instruments/ along with a data/instruments.json manifest.
 *
 * Usage:
 *   npx tsx scripts/scrape-instrument-images.ts
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

interface WikimediaResult {
  title: string
  url: string
  attribution: string
}

interface InstrumentManifestEntry {
  name: string
  category: string
  domain: string
  localPath: string
  attribution: string
}

// Instrument categories to scrape.
// Each entry: [display name, Wikimedia search term, domain]
const CATEGORIES: [string, string, string][] = [
  // Instrument ID
  ['Kelly Clamp', 'Kelly hemostat', 'Instrument ID'],
  ['Mosquito Hemostat', 'Mosquito hemostat', 'Instrument ID'],
  ['Crile Hemostat', 'Crile hemostat', 'Instrument ID'],
  ['Rochester-Pean Forceps', 'Rochester-Pean forceps', 'Instrument ID'],
  ['Mayo Straight Scissors', 'Mayo scissors straight', 'Instrument ID'],
  ['Mayo Curved Scissors', 'Mayo scissors curved', 'Instrument ID'],
  ['Metzenbaum Scissors', 'Metzenbaum scissors', 'Instrument ID'],
  ['Iris Scissors', 'Iris scissors surgical', 'Instrument ID'],
  ['Needle Holder', 'Mayo-Hegar needle holder', 'Instrument ID'],
  ['Debakey Forceps', 'DeBakey tissue forceps', 'Instrument ID'],
  ['Adson Forceps', 'Adson forceps', 'Instrument ID'],
  ['Russian Forceps', 'Russian tissue forceps', 'Instrument ID'],
  ['Weitlaner Retractor', 'Weitlaner retractor', 'Instrument ID'],
  ['Balfour Retractor', 'Balfour retractor', 'Instrument ID'],
  ['Army-Navy Retractor', 'Army-Navy retractor', 'Instrument ID'],
  ['Richardson Retractor', 'Richardson retractor', 'Instrument ID'],
  ['Senn Retractor', 'Senn retractor', 'Instrument ID'],
  ['Allis Clamp', 'Allis tissue forceps', 'Instrument ID'],
  ['Babcock Clamp', 'Babcock forceps', 'Instrument ID'],
  ['Towel Clip', 'Backhaus towel clamp', 'Instrument ID'],
  ['Scalpel Handle', 'Bard-Parker scalpel handle', 'Instrument ID'],
  ['Yankauer Suction', 'Yankauer suction catheter', 'Instrument ID'],
  // Endoscope ID
  ['Rigid Laparoscope', 'laparoscope rigid endoscope', 'Endoscope ID'],
  ['Flexible Gastroscope', 'flexible gastroscope endoscope', 'Endoscope ID'],
  ['Colonoscope', 'colonoscope flexible', 'Endoscope ID'],
  ['Arthroscope', 'arthroscope rigid', 'Endoscope ID'],
  ['Bronchoscope', 'bronchoscope flexible', 'Endoscope ID'],
]

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'
const OUT_DIR = path.join(process.cwd(), 'public', 'instruments')
const MANIFEST_PATH = path.join(process.cwd(), 'data', 'instruments.json')

function httpsGet(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SPDCertCompanion/1.0' } }, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

async function wikimediaSearch(term: string): Promise<WikimediaResult | null> {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6', // File: namespace
    gsrsearch: `${term} filetype:bitmap`,
    gsrlimit: '5',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '640',
    format: 'json',
    origin: '*',
  })

  const raw = await httpsGet(`${WIKIMEDIA_API}?${params}`)
  const json = JSON.parse(raw.toString())
  const pages = json?.query?.pages
  if (!pages) return null

  for (const page of Object.values(pages) as any[]) {
    const info = page?.imageinfo?.[0]
    if (!info?.url) continue
    const url: string = info.thumburl ?? info.url
    const author = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '') ?? 'Unknown'
    const license = info.extmetadata?.LicenseShortName?.value ?? 'Unknown license'
    return {
      title: page.title,
      url,
      attribution: `${author} — ${license} (Wikimedia Commons)`,
    }
  }
  return null
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const data = await httpsGet(url)
  fs.writeFileSync(dest, data)
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })

  const manifest: InstrumentManifestEntry[] = []

  for (const [name, searchTerm, domain] of CATEGORIES) {
    const category = name.toLowerCase().replace(/\s+/g, '-')
    const destFile = path.join(OUT_DIR, `${category}.jpg`)

    if (fs.existsSync(destFile)) {
      console.log(`  skip (exists): ${name}`)
      manifest.push({ name, category, domain, localPath: `public/instruments/${category}.jpg`, attribution: '' })
      continue
    }

    console.log(`  searching: ${name}`)
    try {
      const result = await wikimediaSearch(searchTerm)
      if (!result) {
        console.warn(`    no result for: ${searchTerm}`)
        continue
      }
      await downloadFile(result.url, destFile)
      manifest.push({
        name,
        category,
        domain,
        localPath: `public/instruments/${category}.jpg`,
        attribution: result.attribution,
      })
      console.log(`    saved: ${category}.jpg`)
    } catch (err) {
      console.error(`    error for ${name}:`, err)
    }

    // Polite delay
    await new Promise((r) => setTimeout(r, 500))
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\nDone. ${manifest.length} instruments saved to data/instruments.json`)
}

main().catch((err) => { console.error(err); process.exit(1) })
