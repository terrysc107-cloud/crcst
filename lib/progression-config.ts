export interface StudyConcept {
  term: string
  definition: string
}

export interface ProgressionLevel {
  id: number
  name: string
  description: string
  domains: string[]
  questionCount: number
  passingScore: number
  studyGuide: {
    keyConcepts: StudyConcept[]
    focusTip: string
  }
}

export interface BonusModule {
  id: string
  title: string
  description: string
  triggerType: 'consecutive_pass' | 'high_score' | 'fail_count'
  triggerValue: number
  lockedLabel: string
  content: string
  earnedMessage: string
}

export const PROGRESSION_LEVELS: ProgressionLevel[] = [
  {
    id: 1,
    name: 'Foundation',
    description: 'Understand why SPD exists — the safety principles and microbiology that make everything else matter.',
    domains: ['Safety', 'Microbiology', 'SPD Overview'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Spaulding Classification', definition: 'Divides items into Critical (enter sterile tissue → sterilization required), Semi-Critical (contact mucous membranes → HLD minimum), and Non-Critical (touch intact skin → low-level disinfection).' },
        { term: 'Sterility Assurance Level (SAL)', definition: 'Probability of a viable microorganism remaining on a processed item. The accepted standard is 10⁻⁶ — one chance in one million.' },
        { term: 'Chain of Infection', definition: '6 links: infectious agent, reservoir, portal of exit, mode of transmission, portal of entry, susceptible host. Break any single link to prevent infection.' },
        { term: 'Standard Precautions', definition: 'Treat all blood, body fluids, non-intact skin, and mucous membranes as potentially infectious — regardless of known diagnosis.' },
        { term: 'Prion Resistance', definition: 'Prions (e.g., Creutzfeldt-Jakob disease) resist standard sterilization. Require special decontamination protocols per AAMI ST79 and manufacturer IFU.' },
      ],
      focusTip: 'The Spaulding Classification appears throughout the exam. When a question mentions an item type, immediately classify it — the classification dictates the minimum required reprocessing method.',
    },
  },
  {
    id: 2,
    name: 'Contamination Control',
    description: 'Master the decontamination workflow — the highest-volume, highest-stakes domain on the CRCST exam.',
    domains: ['Decontamination', 'Infection Prevention'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Point-of-Use Treatment', definition: 'Immediate pre-cleaning at the point of use — remove gross soil before transport. Dried bioburden bonds to surfaces and is significantly harder to remove.' },
        { term: 'IFU (Instructions for Use)', definition: 'Manufacturer\'s validated reprocessing instructions. IFU compliance is legally and clinically required — always supersedes general guidelines when there is a conflict.' },
        { term: 'Enzymatic Cleaner', definition: 'Uses enzymes to break down proteins, fats, and carbohydrates. Requires correct dilution, water temperature, and contact time. Solutions are single-use — do not reuse.' },
        { term: 'Ultrasonic Cleaner', definition: 'Uses cavitation (rapid bubble formation and collapse) to dislodge debris from crevices. Must be degassed before the first use each day — trapped air reduces cavitation effectiveness.' },
        { term: 'pH of Cleaning Solutions', definition: 'Near-neutral pH (6.0–8.0) is recommended for most metal instruments to prevent corrosion. Alkaline cleaners are most common; acid cleaners target mineral deposits.' },
      ],
      focusTip: 'Most decontamination failures involve shortcuts: wrong dilution, temperature, contact time, or skipped steps. The exam tests IFU compliance heavily — when in doubt, always follow the manufacturer\'s instructions.',
    },
  },
  {
    id: 3,
    name: 'Processing Workflow',
    description: 'Navigate disinfection, packaging, and instrumentation — the mid-chain steps that connect cleaning to sterilization.',
    domains: ['Disinfection', 'Packaging', 'Instrumentation'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'High-Level Disinfection (HLD)', definition: 'Kills all microorganisms except large numbers of bacterial spores. Required for semi-critical items (e.g., endoscopes contacting mucous membranes). Not a substitute for sterilization on critical items.' },
        { term: 'Event-Related Sterility', definition: 'A package is sterile until an event compromises it — tear, moisture, puncture, or improper opening. Not based on calendar date. This is the current AAMI/AORN standard.' },
        { term: 'Peel Pack Integrity', definition: 'Heat seal must be complete — no channels, gaps, or bubbles. Paper side should face up in gravity/steam sterilizers. Any seal compromise = non-sterile; reprocess.' },
        { term: 'Instrument Set Weight Limit', definition: 'AAMI ST79 recommends a maximum of 25 lbs for wrapped instrument sets. Heavier sets impede steam penetration and frequently produce wet packs.' },
        { term: 'Inspection Before Packaging', definition: 'Every instrument must be inspected for cleanliness, function (hinges, locks, tips), and integrity before packaging. Packaging a visibly soiled instrument is a critical error.' },
      ],
      focusTip: 'Event-related sterility is among the most tested packaging concepts. Packages don\'t expire by date — they\'re compromised by events. Know all disqualifying events: moisture, tears, dropped, opened incorrectly.',
    },
  },
  {
    id: 4,
    name: 'Sterilization & Equipment',
    description: 'Sterilization is the highest-stakes domain. Only attempt it after the workflow is second nature.',
    domains: ['Sterilization', 'Equipment'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Biological Indicator (BI)', definition: 'Most reliable sterilization monitor. Contains live spores: Geobacillus stearothermophilus (steam/H₂O₂) or Bacillus atrophaeus (EO). A killed BI is the only confirmation sterilization conditions were lethal.' },
        { term: 'Bowie-Dick Test', definition: 'Air-removal test for pre-vacuum steam sterilizers. Detects air pockets that prevent steam penetration. Run daily before the first patient load — this is not a sterilization efficacy test.' },
        { term: 'IUSS (Immediate-Use Steam Sterilization)', definition: 'Flash sterilization for urgently needed or dropped instruments only. No wrapping; no storage. Never use for implants without a BI — and the BI must incubate before the implant is released.' },
        { term: 'Wet Pack', definition: 'Visible moisture after sterilization renders the package non-sterile. Must be reprocessed. OR schedule pressure is never a valid justification to release a wet pack.' },
        { term: 'Monitoring Hierarchy', definition: 'Biological indicator > Chemical indicator > Mechanical indicator (printout/gauge). Only BIs confirm actual killing of target microorganisms. Chemical indicators confirm conditions — not sterility.' },
      ],
      focusTip: 'Know the three monitoring types and their hierarchy cold. The exam tests scenarios where chemical indicators passed but sterility wasn\'t confirmed — the BI is always the final authority.',
    },
  },
  {
    id: 5,
    name: 'Systems & Compliance',
    description: 'Storage, quality, and distribution — the downstream systems thinking that separates technicians from leaders.',
    domains: ['Sterile Storage', 'Quality & Regulatory', 'Inventory & Distribution'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'FIFO (First In, First Out)', definition: 'Rotate stock so the oldest items are used first. Prevents indefinite shelf storage — critical for maintaining event-related sterility over time.' },
        { term: 'Loaner Instrument Protocol', definition: 'Loaner instruments must be decontaminated before first use — regardless of how they were packaged or shipped. This is non-negotiable and heavily tested on the exam.' },
        { term: 'Recall Procedure', definition: 'When a sterilization failure is confirmed, quarantine and recall all items processed since the last passing BI. Notify affected parties and document the full response.' },
        { term: 'Regulatory Standards Hierarchy', definition: 'OSHA (legally enforceable) > CDC guidelines > AAMI standards > AORN recommendations > facility policy. Know which is law versus best practice versus guidance.' },
        { term: 'Sterile Storage Conditions', definition: 'Temperature 65–75°F, humidity 35–70%, positive air pressure, away from floor/walls/ceilings. Solid shelving preferred over wire in high-dust areas.' },
      ],
      focusTip: 'Loaner instruments appear on nearly every CRCST exam. The answer is always the same: decontaminate on arrival regardless of packaging. Never assume a loaner is ready to use.',
    },
  },
]

export const BONUS_MODULES: BonusModule[] = [
  {
    id: 'real-case-breakdown',
    title: 'Real Case Breakdown',
    description: 'Analyze real-world SPD incidents — what went wrong, why, and what the correct response was.',
    triggerType: 'consecutive_pass',
    triggerValue: 2,
    lockedLabel: 'Complete 2 levels in a row to unlock',
    content: `# Real Case Breakdown

These scenarios are drawn from documented SPD incidents. Each one illustrates a failure point that appears on the CRCST exam — but more importantly, represents something that has harmed patients.

## Case 1: The Missed Biological Indicator
A hospital's steam sterilizer showed a passing chemical indicator but the biological indicator (BI) was never incubated. Instruments were released. Three weeks later, a post-op infection cluster traced back to inadequate sterilization.

**What went wrong:** Chemical indicators confirm conditions were met — they don't confirm sterility. BIs are the gold standard. The technician confused the two.

**Exam connection:** Know the hierarchy: BI > chemical indicator > mechanical indicator.

## Case 2: Wet Pack Released
A tray came out of the sterilizer with visible moisture under the wrap. It was released anyway due to OR schedule pressure.

**What went wrong:** Wet packs are considered non-sterile. Moisture creates a pathway for microorganisms to re-enter the package. The correct action is always to reprocess — pressure from OR is never a valid reason to release a compromised set.

**Exam connection:** Know the definition of a wet pack and the required response.

## Case 3: Wrong Enzymatic Soak Time
A technician used a 1-minute enzymatic soak instead of the manufacturer's required 5-minute soak, then proceeded to sterilization.

**What went wrong:** Enzymatic cleaners require contact time to break down bioburden. Insufficient time means soiling remains — and sterilants cannot penetrate organic material. The instrument was "sterilized" with bioburden still present.

**Exam connection:** Always follow manufacturer's IFU (Instructions for Use). IFU compliance is a tested concept across multiple domains.`,
    earnedMessage: 'You completed two levels without stopping. That momentum earned you access to cases where the stakes were real.',
  },
  {
    id: 'speed-round',
    title: 'Speed Round Challenge',
    description: 'Same questions, half the time. 15 questions, 4 minutes. Tests whether you know it or just think you do.',
    triggerType: 'high_score',
    triggerValue: 90,
    lockedLabel: 'Score 90% or higher on any level to unlock',
    content: 'speed-round',
    earnedMessage: 'You scored 90% or above. You don\'t just know the material — you know it fast. Let\'s find out how fast.',
  },
  {
    id: 'critical-mistakes-vault',
    title: 'Critical Mistakes Vault',
    description: 'A targeted review built from the questions this level is designed to trick you on. Study the traps, not just the answers.',
    triggerType: 'fail_count',
    triggerValue: 2,
    lockedLabel: 'Fail the same level twice to unlock',
    content: `# Critical Mistakes Vault

Failing twice means there's a pattern — not bad luck. This vault breaks down the most common reasoning traps in this level's question pool.

## Why You're Getting These Wrong

Most wrong answers on CRCST questions aren't random. They fall into three categories:

### Trap 1: Confusing "When" with "How"
Example: Questions about sterilization often have two correct-sounding answers — one describes the right *method* and one describes the right *situation to use it*. If the question asks "when," picking the "how" answer loses you the point.

**Fix:** Read the question stem twice. Underline the action word before you look at options.

### Trap 2: Almost-Right Distractors
CRCST distractors are designed by people who know what technicians mislearn. The wrong answer is often a real procedure — just not the right one for this context.

**Fix:** Instead of finding the right answer, first eliminate the answers that are right in a *different* context.

### Trap 3: Overconfidence on Familiar Terms
If you recognize a term (like "Spaulding Classification" or "ST79"), there's a risk of pattern-matching to an answer that uses the same term without reading carefully.

**Fix:** Slow down on questions with familiar terminology. That familiarity is where the trap is set.

## What to Do Next

1. Retry the level — questions are randomized, so you'll get a fresh draw from the domain pool.
2. For each question you miss, read the explanation fully — not just the correct answer.
3. Notice which domain tag appears most on your wrong answers. That's where your gap lives.`,
    earnedMessage: 'Failing twice on the same level isn\'t a problem — it\'s data. You\'ve earned access to the reasoning behind why these questions catch people.',
  },
]

export function getLevelById(id: number): ProgressionLevel | undefined {
  return PROGRESSION_LEVELS.find(l => l.id === id)
}

export function getBonusById(id: string): BonusModule | undefined {
  return BONUS_MODULES.find(b => b.id === id)
}

// ─── XP System ───────────────────────────────────────────────────────────────

export const XP_RULES = {
  attempt: 10,       // any attempt, pass or fail
  pass: 100,         // pass the level
  firstPass: 25,     // first-ever pass of this level (no prior pass on record)
  precision: 50,     // score 90%+
} as const

export interface XpTier {
  label: string
  minXp: number
  color: string
}

export const XP_TIERS: XpTier[] = [
  { label: 'Novice',     minXp: 0,    color: 'rgba(245,240,232,0.5)' },
  { label: 'Apprentice', minXp: 100,  color: '#14BDAC' },
  { label: 'Technician', minXp: 300,  color: '#4a9eff' },
  { label: 'Specialist', minXp: 600,  color: '#DAA520' },
  { label: 'Expert',     minXp: 1000, color: '#f472b6' },
]

export function getXpTier(totalXp: number): XpTier {
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_TIERS[i].minXp) return XP_TIERS[i]
  }
  return XP_TIERS[0]
}

export function getNextXpTier(totalXp: number): XpTier | null {
  for (const tier of XP_TIERS) {
    if (totalXp < tier.minXp) return tier
  }
  return null
}

export interface XpBreakdown {
  attempt: number
  pass: number
  firstPass: number
  precision: number
  total: number
}

// ─── Badge Locker ─────────────────────────────────────────────────────────────

export interface ProgressionBadge {
  id: string
  name: string
  description: string
  icon: string           // emoji or short symbol
  color: string          // accent color when earned
  triggerLabel: string   // shown when locked
}

export const PROGRESSION_BADGES: ProgressionBadge[] = [
  {
    id: 'domain-foundation',
    name: 'Foundation',
    description: 'Passed Level 1 — Safety, Microbiology & SPD Overview.',
    icon: '🏛',
    color: '#14BDAC',
    triggerLabel: 'Pass Level 1',
  },
  {
    id: 'domain-contamination-control',
    name: 'Contamination Control',
    description: 'Passed Level 2 — Decontamination & Infection Prevention.',
    icon: '🧪',
    color: '#14BDAC',
    triggerLabel: 'Pass Level 2',
  },
  {
    id: 'domain-processing-workflow',
    name: 'Processing Workflow',
    description: 'Passed Level 3 — Disinfection, Packaging & Instrumentation.',
    icon: '⚙️',
    color: '#14BDAC',
    triggerLabel: 'Pass Level 3',
  },
  {
    id: 'domain-sterilization',
    name: 'Sterilization',
    description: 'Passed Level 4 — Sterilization & Equipment.',
    icon: '🔬',
    color: '#14BDAC',
    triggerLabel: 'Pass Level 4',
  },
  {
    id: 'domain-systems-compliance',
    name: 'Systems & Compliance',
    description: 'Passed Level 5 — Storage, Quality & Distribution.',
    icon: '📋',
    color: '#14BDAC',
    triggerLabel: 'Pass Level 5',
  },
  {
    id: 'full-circuit',
    name: 'Full Circuit',
    description: 'Completed all five progression levels.',
    icon: '🎯',
    color: '#DAA520',
    triggerLabel: 'Complete all 5 levels',
  },
  {
    id: 'precision',
    name: 'Precision',
    description: 'Scored 90% or higher on any level.',
    icon: '⚡',
    color: '#4a9eff',
    triggerLabel: 'Score 90%+ on any level',
  },
  {
    id: 'perfect-round',
    name: 'Perfect Round',
    description: 'Scored 100% on any level.',
    icon: '💎',
    color: '#f472b6',
    triggerLabel: 'Score 100% on any level',
  },
]

// Map level id → domain badge id
export const LEVEL_BADGE_MAP: Record<number, string> = {
  1: 'domain-foundation',
  2: 'domain-contamination-control',
  3: 'domain-processing-workflow',
  4: 'domain-sterilization',
  5: 'domain-systems-compliance',
}

export function getBadgeById(id: string): ProgressionBadge | undefined {
  return PROGRESSION_BADGES.find(b => b.id === id)
}
