/**
 * Scrape surgical / sterile-processing instrument images from Wikimedia Commons.
 *
 * Usage:
 *   npx tsx scripts/scrape-instrument-images.ts
 *
 * Output:
 *   public/instruments/          ← downloaded images (JPEG, PNG)
 *   data/instruments.json        ← metadata array ready to seed the DB
 *
 * Requires:
 *   SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local  (optional, for auto-upload)
 *
 * The script is intentionally conservative:
 *   - 500 ms pause between API requests
 *   - Skips files larger than 2 MB
 *   - Only accepts CC-BY / CC-BY-SA / CC0 / PD licenses
 *   - Deduplicates by normalized title
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// ── Config ────────────────────────────────────────────────────────────────────

const OUT_DIR = path.join(process.cwd(), "public", "instruments");
const META_FILE = path.join(process.cwd(), "data", "instruments.json");
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
const REQUEST_DELAY_MS = 500;
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

/** Wikimedia Commons categories to crawl (and their instrument label) */
const CATEGORIES: { category: string; label: string; domain: string }[] = [
  // ── Surgical clamps / hemostats ──────────────────────────────────────────
  { category: "Hemostatic_forceps", label: "Hemostat / Mosquito Clamp", domain: "Instrument Identification" },
  { category: "Kelly_forceps", label: "Kelly Clamp", domain: "Instrument Identification" },
  { category: "Kocher_forceps", label: "Kocher Clamp", domain: "Instrument Identification" },
  // ── Scissors ─────────────────────────────────────────────────────────────
  { category: "Mayo_scissors", label: "Mayo Scissors", domain: "Instrument Identification" },
  { category: "Metzenbaum_scissors", label: "Metzenbaum Scissors", domain: "Instrument Identification" },
  // ── Retractors ────────────────────────────────────────────────────────────
  { category: "Weitlaner_retractors", label: "Weitlaner Retractor", domain: "Instrument Identification" },
  { category: "Richardson_retractors", label: "Richardson Retractor", domain: "Instrument Identification" },
  { category: "Army-Navy_retractors", label: "Army-Navy Retractor", domain: "Instrument Identification" },
  // ── Needle holders ────────────────────────────────────────────────────────
  { category: "Needle_holders", label: "Needle Holder", domain: "Instrument Identification" },
  // ── Tissue forceps ────────────────────────────────────────────────────────
  { category: "Adson_forceps", label: "Adson Tissue Forceps", domain: "Instrument Identification" },
  { category: "DeBakey_forceps", label: "DeBakey Tissue Forceps", domain: "Instrument Identification" },
  { category: "Rat-tooth_forceps", label: "Rat-Tooth Forceps", domain: "Instrument Identification" },
  // ── Scalpel handles ───────────────────────────────────────────────────────
  { category: "Scalpel_handles", label: "Scalpel Handle", domain: "Instrument Identification" },
  // ── Towel clips ───────────────────────────────────────────────────────────
  { category: "Backhaus_towel_clamps", label: "Backhaus Towel Clamp", domain: "Instrument Identification" },
  // ── Suction ───────────────────────────────────────────────────────────────
  { category: "Frazier_suction_tips", label: "Frazier Suction Tip", domain: "Instrument Identification" },
  { category: "Yankauer_suction", label: "Yankauer Suction", domain: "Instrument Identification" },
  // ── Specula / dilators ────────────────────────────────────────────────────
  { category: "Vaginal_specula", label: "Vaginal Speculum", domain: "Instrument Identification" },
  { category: "Hegar_dilators", label: "Hegar Dilator", domain: "Instrument Identification" },
  // ── Curettes ─────────────────────────────────────────────────────────────
  { category: "Curettes", label: "Curette", domain: "Instrument Identification" },
  // ── Endoscopy ─────────────────────────────────────────────────────────────
  { category: "Endoscopes", label: "Endoscope", domain: "Endoscope Identification" },
  { category: "Bronchoscopes", label: "Bronchoscope", domain: "Endoscope Identification" },
];

const ALLOWED_LICENSE_PREFIXES = ["cc-by", "cc0", "pd", "public-domain"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_").toLowerCase();
}

function isAllowedLicense(license: string): boolean {
  const l = license.toLowerCase();
  return ALLOWED_LICENSE_PREFIXES.some((p) => l.startsWith(p));
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "SPDCertPrep-InstrumentScraper/1.0 (https://spdcertprep.com)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
  });
}

function downloadFile(url: string, dest: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "SPDCertPrep-InstrumentScraper/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
        return;
      }
      let size = 0;
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_FILE_BYTES) { req.destroy(); resolve(-1); return; }
        chunks.push(chunk);
      });
      res.on("end", () => {
        if (size <= MAX_FILE_BYTES) {
          fs.writeFileSync(dest, Buffer.concat(chunks));
          resolve(size);
        }
      });
    });
    req.on("error", reject);
  });
}

// ── API calls ─────────────────────────────────────────────────────────────────

interface CMember { title: string; }
interface ApiCategoryMembersResponse {
  query: { categorymembers: CMember[] };
  continue?: { cmcontinue: string };
}

async function getCategoryMembers(category: string, limit = 30): Promise<string[]> {
  const titles: string[] = [];
  let cont = "";
  while (titles.length < limit) {
    const contParam = cont ? `&cmcontinue=${encodeURIComponent(cont)}` : "";
    const url = `${COMMONS_API}?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmtype=file&cmlimit=50&format=json${contParam}`;
    const data = await fetchJson(url) as ApiCategoryMembersResponse;
    const members = data?.query?.categorymembers ?? [];
    for (const m of members) {
      if (titles.length >= limit) break;
      titles.push(m.title);
    }
    if (!data.continue?.cmcontinue || titles.length >= limit) break;
    cont = data.continue.cmcontinue;
    await sleep(REQUEST_DELAY_MS);
  }
  return titles;
}

interface ImageInfo {
  url: string;
  size: number;
  extmetadata?: {
    LicenseShortName?: { value: string };
    Artist?: { value: string };
    ImageDescription?: { value: string };
  };
}
interface ApiImageInfoResponse {
  query: { pages: Record<string, { title: string; imageinfo?: ImageInfo[] }> };
}

async function getImageInfo(fileTitle: string): Promise<{ url: string; license: string; author: string } | null> {
  const url = `${COMMONS_API}?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800&format=json`;
  const data = await fetchJson(url) as ApiImageInfoResponse;
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const license = info.extmetadata?.LicenseShortName?.value ?? "";
  if (!isAllowedLicense(license)) return null;
  if (info.size > MAX_FILE_BYTES) return null;

  const author = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") ?? "Wikimedia Commons";
  return { url: info.url, license, author };
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });

  const results: InstrumentMeta[] = [];
  const seen = new Set<string>();
  let totalSaved = 0;
  let totalSkipped = 0;

  for (const cat of CATEGORIES) {
    console.log(`\n▶ ${cat.label} (${cat.category})`);
    let saved = 0;

    const members = await getCategoryMembers(cat.category, 15);
    await sleep(REQUEST_DELAY_MS);

    for (const title of members) {
      if (saved >= 5) break; // max 5 good images per category

      const normalizedTitle = title.replace(/^File:/i, "").toLowerCase();
      if (seen.has(normalizedTitle)) continue;

      const info = await getImageInfo(title);
      await sleep(REQUEST_DELAY_MS);

      if (!info) {
        totalSkipped++;
        continue;
      }

      const ext = path.extname(info.url).split("?")[0].toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        totalSkipped++;
        continue;
      }

      const filename = `${cat.category.toLowerCase()}_${sanitizeFilename(normalizedTitle)}`;
      const localFilename = filename.slice(0, 120) + ext;
      const destPath = path.join(OUT_DIR, localFilename);

      if (fs.existsSync(destPath)) {
        console.log(`  ✓ cached  ${localFilename}`);
      } else {
        const bytes = await downloadFile(info.url, destPath);
        if (bytes < 0) {
          console.log(`  ✗ too big ${title}`);
          totalSkipped++;
          continue;
        }
        console.log(`  ↓ saved   ${localFilename} (${Math.round(bytes / 1024)} KB)`);
      }

      seen.add(normalizedTitle);
      results.push({
        id: `inst-${results.length + 1}`,
        label: cat.label,
        domain: cat.domain,
        filename: localFilename,
        local_path: `/instruments/${localFilename}`,
        wikimedia_url: info.url,
        license: info.license,
        author: info.author,
        category: cat.category,
      });
      saved++;
      totalSaved++;
    }
  }

  fs.writeFileSync(META_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Done. Saved ${totalSaved} images, skipped ${totalSkipped}.`);
  console.log(`   Metadata → ${META_FILE}`);
  console.log(`   Images   → ${OUT_DIR}`);
  console.log(`\nNext step: run scripts/seed-instrument-images.ts to upload to Supabase Storage.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
