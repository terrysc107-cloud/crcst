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

// ─── Tier labels for UI grouping ─────────────────────────────────────────────
export const LEVEL_TIERS = [
  { label: 'Foundations',           levels: [1, 2, 3, 4, 5] },
  { label: 'Chapter Deep Dives',    levels: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  { label: 'Processing Excellence', levels: [16, 17, 18, 19, 20] },
  { label: 'Systems & Leadership',  levels: [21, 22, 23, 24] },
]

export const TOTAL_LEVELS = 24

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

  // ── Tier 2: Chapter Deep Dives (Levels 6–15) ─────────────────────────────
  {
    id: 6,
    name: 'SPD Foundations & Terminology',
    description: 'The language of sterile processing. You can\'t communicate, document, or advance without it.',
    domains: ['SPD Overview', 'Medical Terminology'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'SPD Workflow Zones', definition: 'Decontamination → Inspection/Assembly/Packaging → Sterilization → Sterile Storage. Each zone has distinct PPE, airflow, and traffic requirements. Items always flow one direction — never backward.' },
        { term: 'Prefixes for Body Position', definition: 'Endo- (within), Exo- (outside), Peri- (surrounding), Trans- (through/across). Common on instrument names: endoscope, percutaneous, transesophageal.' },
        { term: 'Root Words for Procedures', definition: '-ectomy (removal), -oscopy (visual examination), -otomy (incision/cutting into), -plasty (repair/reconstruction). Knowing roots decodes instrument names and surgical case types.' },
        { term: 'Scope of Practice', definition: 'SPD techs reprocess instruments — they do not sterilize implants for release without a passing BI, do not make clinical decisions, and do not override physician or IFU instructions.' },
        { term: 'OR Case Tray Documentation', definition: 'Each instrument set must have a complete count sheet. Contents, condition, and sterilization data must be traceable. Documentation is a regulatory requirement, not a formality.' },
      ],
      focusTip: 'Medical terminology questions on the exam test whether you can decode instrument names and surgical terms — not whether you memorized a glossary. Learn the most common roots, prefixes, and suffixes.',
    },
  },
  {
    id: 7,
    name: 'Anatomy for SP Technicians',
    description: 'You don\'t need to know anatomy like a nurse — but you do need to understand how body systems connect to instrument risk and reprocessing decisions.',
    domains: ['Anatomy'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Sterile Body Sites', definition: 'Bloodstream, CSF, joints, peritoneum, urinary tract (upper), and most internal organs are sterile under normal conditions. Instruments entering these sites require sterilization — not just HLD.' },
        { term: 'Mucous Membrane Classification', definition: 'GI tract lining, respiratory tract, and urogenital tract are mucous membranes. Instruments contacting these require High-Level Disinfection at minimum (Spaulding semi-critical).' },
        { term: 'Intact Skin Classification', definition: 'Instruments touching only intact, unbroken skin are non-critical. Low-level disinfection is the minimum standard. Examples: BP cuffs, stethoscopes, bed rails.' },
        { term: 'Body Cavity Risk Levels', definition: 'Abdominal cavity, thoracic cavity, cranial vault = critical. GI lumen = semi-critical. Exterior wound surfaces = critical if tissue is disrupted. Risk drives reprocessing level.' },
        { term: 'Bone and Joint Implications', definition: 'Orthopedic instruments penetrate bone and joint spaces — critical items requiring sterilization. Complex hinged joints in orthopedic instruments increase cleaning difficulty.' },
      ],
      focusTip: 'Anatomy questions on the CRCST exam almost always connect to a Spaulding Classification decision. Ask yourself: where does this instrument contact the body? That determines the reprocessing requirement.',
    },
  },
  {
    id: 8,
    name: 'Microbiology Mastery',
    description: 'Understanding what you\'re fighting — and why some microorganisms survive standard reprocessing — is foundational to every SPD decision.',
    domains: ['Microbiology'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Spore-Forming Bacteria', definition: 'Bacillus and Clostridium species form endospores — the most resistant form of life to heat and chemical agents. Destroying spores is the benchmark of sterilization efficacy. BIs use spores for this reason.' },
        { term: 'Biofilm', definition: 'A community of microorganisms embedded in a protective matrix on surfaces. Biofilm is up to 1,000× more resistant to disinfectants than planktonic (free-floating) bacteria. Mechanical cleaning must remove it before disinfection/sterilization.' },
        { term: 'Gram-Positive vs. Gram-Negative', definition: 'Gram-negative bacteria (e.g., E. coli, Pseudomonas) have an outer lipopolysaccharide membrane that makes them harder to kill with some disinfectants. Gram stain determines cell wall structure.' },
        { term: 'Prions (Non-Standard)', definition: 'Misfolded proteins — not living organisms. Resist autoclaving, alcohol, formaldehyde, and most disinfectants. CJD-associated instruments require special AAMI ST79 protocols or single-use policy.' },
        { term: 'Resistance Hierarchy', definition: 'Most resistant to least: Prions > Bacterial spores > Mycobacteria > Non-lipid viruses > Fungi > Vegetative bacteria > Lipid-enveloped viruses. Sterilization kills all levels. HLD kills all but spores in large numbers.' },
      ],
      focusTip: 'The resistance hierarchy and prion protocols are heavily tested. Memorize the order. Prions and spores are the two categories that standard reprocessing cannot reliably eliminate — know what each requires.',
    },
  },
  {
    id: 9,
    name: 'Infection Prevention Deep Dive',
    description: 'SPD is the front line of infection prevention. Every reprocessing decision either breaks or reinforces the chain of infection.',
    domains: ['Infection Prevention', 'Safety'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'HAI (Healthcare-Associated Infection)', definition: 'Infections acquired in a healthcare setting that were not present on admission. SPD reprocessing failures are a direct cause of HAIs — SSIs (surgical site infections) in particular.' },
        { term: 'Transmission-Based Precautions', definition: 'Contact (gloves/gown), Droplet (mask, eye protection within 3 feet), Airborne (N95, negative pressure room). These supplement Standard Precautions for known pathogens.' },
        { term: 'PPE Donning and Doffing Order', definition: 'Donning: gown → gloves → mask/respirator → eye protection. Doffing: gloves → eye protection → gown → mask. Remove the most contaminated items first to prevent self-contamination.' },
        { term: 'Bloodborne Pathogen Standard', definition: 'OSHA 29 CFR 1910.1030. Requires engineering controls, PPE, hepatitis B vaccination offer, exposure incident protocol, and annual training. Legally enforceable — violations carry penalties.' },
        { term: 'Sharps Safety', definition: 'Never recap needles by hand. Use a one-handed scoop or safety device. Dispose in puncture-resistant sharps containers. Needle stick = exposure incident requiring immediate reporting and post-exposure protocol.' },
      ],
      focusTip: 'PPE donning/doffing order is a direct exam question — not just a concept. Memorize the sequence exactly. Also know: Standard Precautions apply to ALL patients, not just those with known infections.',
    },
  },
  {
    id: 10,
    name: 'Regulations & Standards',
    description: 'Know who makes the rules, which ones are laws, and what happens when they conflict.',
    domains: ['Quality & Regulatory'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'AAMI (Association for the Advancement of Medical Instrumentation)', definition: 'Publishes technical standards for medical device reprocessing — ST79 (steam sterilization), ST58 (chemical sterilization/HLD), ST91 (flexible endoscopes). AAMI standards are voluntary best practices unless adopted by law.' },
        { term: 'OSHA (Occupational Safety and Health Administration)', definition: 'Federal agency with legal enforcement authority. OSHA standards are mandated law — not guidelines. Key standards: Bloodborne Pathogens (1910.1030), Hazard Communication, Respiratory Protection.' },
        { term: 'CDC (Centers for Disease Control)', definition: 'Publishes infection control guidelines based on evidence. CDC guidelines are recommendations, not regulations — but widely adopted as the standard of care in legal and accreditation contexts.' },
        { term: 'The Joint Commission (TJC)', definition: 'Accreditation body for hospitals. TJC surveys compliance with NPSG (National Patient Safety Goals) and infection control standards. Losing TJC accreditation has severe financial consequences for hospitals.' },
        { term: 'Manufacturer IFU Authority', definition: 'The manufacturer\'s Instructions for Use are legally validated reprocessing instructions. When IFU conflicts with a general standard, IFU governs for that specific device. Facilities must follow IFU or document a validated alternative.' },
      ],
      focusTip: 'The exam regularly asks "which organization requires X" or "which standard covers Y." Know OSHA = law, AAMI = voluntary standard, CDC = guidance, TJC = accreditation. Hierarchy matters on conflict questions.',
    },
  },
  {
    id: 11,
    name: 'Decontamination Deep Dive',
    description: 'Decontamination is the highest-volume work in SPD and the domain with the most exam questions. Master it.',
    domains: ['Decontamination'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Decontamination Area Requirements', definition: 'Negative air pressure (air flows in, not out), separate from clean areas, designated traffic flow, dedicated PPE. Physical separation from the clean side is required by code.' },
        { term: 'Washer-Disinfector Cycle Phases', definition: 'Pre-rinse (cold water, removes gross soil without fixing protein) → Enzymatic wash → Rinse → Thermal disinfection (93°C minimum for A0 value) → Drying. Know each phase and its purpose.' },
        { term: 'Thermal Disinfection (A0 Value)', definition: 'A0 is a measure of thermal disinfection efficacy. A0 ≥ 600 is required for semi-critical items. Achieved at 90°C for 1 min, 80°C for 10 min, or 93°C for 2.5 min.' },
        { term: 'Cannulated Instrument Cleaning', definition: 'Hollow instruments must be flushed with enzymatic solution through the lumen — not just surface cleaned. A brush sized to the internal diameter is required. Biofilm in cannulas is not removed by surface washing.' },
        { term: 'Water Quality for Reprocessing', definition: 'Tap water is acceptable for initial rinsing. Softened water for mechanical washing. Purified (RIN/DI) water for final rinse to prevent mineral deposits that can interfere with sterilization.' },
      ],
      focusTip: 'The most common decontamination failures on the exam involve cannulated instruments and IFU non-compliance. Always assume a hollow instrument needs lumen flushing — surface washing alone is never sufficient.',
    },
  },
  {
    id: 12,
    name: 'Disinfection & Endoscope Reprocessing',
    description: 'Disinfection levels, chemical agents, and the strict reprocessing protocol for flexible endoscopes — one of the highest HAI-risk areas in any facility.',
    domains: ['Disinfection', 'Endoscope Reprocessing'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Three Levels of Disinfection', definition: 'High-Level (HLD): kills all organisms except high numbers of spores. Intermediate-Level (ILD): kills mycobacteria, most viruses and fungi, vegetative bacteria. Low-Level (LLD): kills vegetative bacteria and lipid viruses. Match level to Spaulding classification.' },
        { term: 'Glutaraldehyde (Cidex)', definition: 'HLD chemical sterilant. Requires minimum contact time (typically 20–45 min at 20°C for HLD). Highly toxic — requires ventilation, PPE, and exposure monitoring. Solutions have defined reuse life and must be tested with MEC strips.' },
        { term: 'MEC (Minimum Effective Concentration)', definition: 'The minimum concentration at which a disinfectant is effective. HLD solutions must be tested with MEC test strips before each use — expired or diluted solutions below MEC must be discarded.' },
        { term: 'Flexible Endoscope Reprocessing Steps', definition: 'Bedside flush → Leak test → Manual cleaning (brushing all channels) → AER (Automated Endoscope Reprocessor) cycle → Rinse → Drying → Proper storage (vertical/hanging). No step may be skipped.' },
        { term: 'Endoscope Drying & Storage', definition: 'Moisture remaining in endoscope channels allows Pseudomonas and other gram-negative bacteria to multiply rapidly. Forced-air drying of all channels is required. Store hanging vertically or horizontal in ventilated cabinet — never coiled tightly.' },
      ],
      focusTip: 'Endoscope reprocessing is a high-stakes topic — HAIs from inadequately processed scopes are well-documented. Know the full 7-step sequence and the rationale for each step. The leak test before immersion is a frequent exam point.',
    },
  },
  {
    id: 13,
    name: 'Surgical Instruments',
    description: 'Every instrument has a name, a purpose, and a correct way to be inspected and processed. Know the most common ones cold.',
    domains: ['Instrumentation'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Ring-Handle Instruments', definition: 'Scissors, hemostats, needle holders, tissue forceps. Inspect: box locks (smooth action, no wobble), cutting edges (aligned, no nicks), ratchets (lock at first position, do not slip). Process open — never closed.' },
        { term: 'Retractors', definition: 'Hold tissue/organs out of the surgical field. Self-retaining (e.g., Weitlaner, Balfour) lock in place. Inspect all joints and ratchet mechanisms. Long retractors require inspection along entire shaft for bends.' },
        { term: 'Electrosurgical Instruments', definition: 'Must be inspected for insulation integrity — cracks allow current leakage and patient burns. Bipolar forceps tips must be clean (charred tissue resists current). Test insulation with an insulation tester, not visually alone.' },
        { term: 'Malleable Instruments', definition: 'Instruments designed to be bent to a specific angle intraoperatively (ribbon retractors, malleable probes). Must be returned to straight/original form before packaging. Process flat, not stacked.' },
        { term: 'Instrument Inspection Under Magnification', definition: 'AAMI recommends a 3.5× magnification loupe or magnifying lamp for instrument inspection. The naked eye misses cracks, pitting, and alignment issues that compromise function and cleaning.' },
      ],
      focusTip: 'Instrument questions on the exam test whether you know how each type fails and what to look for during inspection. Know the common failure modes: box lock wear, ratchet slippage, insulation cracks, cutting edge damage.',
    },
  },
  {
    id: 14,
    name: 'Complex & Specialty Instruments',
    description: 'Power tools, robotic instruments, and multi-part specialty sets — the instruments most likely to be misprocessed and most dangerous when they are.',
    domains: ['Assembly', 'Instrumentation'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Power Tool Reprocessing', definition: 'Pneumatic and electric drills, saws, reamers — ALWAYS follow manufacturer IFU. Many cannot be fully immersed. Lubricate per IFU after cleaning, before sterilization. Test trigger function before packaging.' },
        { term: 'Robotic Instrument Processing', definition: 'Robotic instruments (e.g., da Vinci) have complex lumens, articulating wrists, and embedded electronics. Require specialized cleaning adaptors, specific IFU-defined detergents, and confirmation of use-count limits.' },
        { term: 'Rigid Endoscopes (Scopes)', definition: 'Laparoscopes, arthroscopes, cystoscopes. Inspect optics (hold to light — image should be clear, not cloudy). Check for barrel cracks. Most are steam-sterilizable but verify IFU — optics can delaminate if reprocessed improperly.' },
        { term: 'Instrument Sets & Count Sheets', definition: 'Complex sets must match their count sheet exactly. Missing instruments are tracked with a deficiency tag — the set cannot go to OR without resolution. Instrument accountability starts in SPD, not in the OR.' },
        { term: 'Tip Protectors During Packaging', definition: 'Delicate tips (micro scissors, Castroviejo needle holders) require plastic tip guards during packaging to prevent puncture of packaging material and protect precision tips. Tip protectors must be sterile or sterile-compatible.' },
      ],
      focusTip: 'Power tool and robotic instrument IFU questions appear frequently. The answer is always the same: follow the IFU. Never assume a power tool can be immersed — check first. Use-count limits on robotic instruments are a patient safety issue.',
    },
  },
  {
    id: 15,
    name: 'Packaging & Preparation',
    description: 'Packaging is the last line of defense before the sterile field. A compromised package means a contaminated instrument — no matter how well it was sterilized.',
    domains: ['Packaging', 'Assembly'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Packaging Material Types', definition: 'Woven textile (reusable — requires revalidation, 150-wash limit tracking), non-woven polypropylene (single-use, superior barrier), peel pouches (paper/plastic), rigid containers (stainless, aluminum, polymer — require filter/valve inspection).' },
        { term: 'Sequential (Double) Wrapping', definition: 'Two wraps applied sequentially allow aseptic presentation — the outer wrap is removed before the inner, which maintains sterility at the sterile field. Each wrap must be heat-sealed or taped — no pins.' },
        { term: 'Chemical Indicators (CIs)', definition: 'CI placement: external CI on every package (confirms exposure), internal CI inside every package (confirms conditions reached interior). Type 5 integrating indicators are the most reliable internal CIs short of a BI.' },
        { term: 'Labeling Requirements', definition: 'Every package must show: sterilizer number, cycle/load number, date of sterilization, contents. Traceable to the specific sterilization run for recall purposes. Labels must be placed after sealing — not before.' },
        { term: 'Rigid Container Inspection', definition: 'Before every use: inspect lid gasket (cracks = compromised seal), filter/valve condition, latch mechanism. After sterilization: check for condensation inside (wet pack = reprocess). Never override a failed container check.' },
      ],
      focusTip: 'Know the difference between external and internal chemical indicators and what each confirms. The exam asks about CI placement and interpretation frequently. Also know the rigid container inspection points — gasket, filter, latch.',
    },
  },

  // ── Tier 3: Processing Excellence (Levels 16–20) ──────────────────────────
  {
    id: 16,
    name: 'High-Temperature Sterilization',
    description: 'Steam sterilization is the gold standard. Master the cycles, parameters, and monitoring for gravity and pre-vacuum sterilizers.',
    domains: ['Sterilization'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Gravity Displacement Cycle', definition: 'Steam enters at the top and pushes air out through the drain at the bottom by gravity. Slower — air removal is incomplete. Used for unwrapped items, porous loads with caution. Typical parameters: 132°C for 10–30 min (wrapped).' },
        { term: 'Pre-Vacuum (Dynamic Air Removal) Cycle', definition: 'Vacuum pump actively removes air before steam injection — more thorough air removal, faster cycle. Required for porous loads and complex instruments. Typical: 132–135°C for 4 minutes.' },
        { term: 'Bowie-Dick Test', definition: 'Air-removal test for pre-vacuum sterilizers ONLY. Run on an empty sterilizer at the start of each day before the first patient load. A uniform color change = adequate air removal. Failure = do not use sterilizer.' },
        { term: 'IUSS Parameters', definition: 'Gravity: 132°C for 3 min unwrapped. Pre-vacuum: 132°C for 3–4 min unwrapped. IUSS never used for implants without a BI that is fully incubated before use. Implant IUSS must be documented with justification.' },
        { term: 'Load Release Criteria', definition: 'All three monitoring types must pass: mechanical printout within parameters + chemical indicator correct color change + BI negative (weekly minimum, each load with implants). Any single failure = quarantine the load.' },
      ],
      focusTip: 'Know the difference between gravity and pre-vacuum parameters and when each is used. The Bowie-Dick test is pre-vacuum only — a common exam trap. Memorize the implant BI rule: always incubate before release.',
    },
  },
  {
    id: 17,
    name: 'Low-Temperature Sterilization',
    description: 'Heat-sensitive instruments require alternative sterilization methods — each with distinct parameters, hazards, and limitations.',
    domains: ['Sterilization', 'Equipment'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Ethylene Oxide (EO/EtO)', definition: 'Alkylating gas that kills all microorganisms. Works at low temperatures (~55°C). Requires aeration after cycle (12–16 hours minimum) to off-gas toxic residuals before use. EO is a known carcinogen — strict exposure limits and ventilation required.' },
        { term: 'Hydrogen Peroxide Gas Plasma (STERRAD)', definition: 'Low-temperature (~50°C), no toxic residuals, short cycle (28–75 min). Cannot process cellulose (paper), liquids, or long narrow lumens. Requires special non-woven polypropylene pouches — paper pouches absorb H₂O₂.' },
        { term: 'Vaporized Hydrogen Peroxide (VHP)', definition: 'Similar to gas plasma but used for larger chamber volumes and room decontamination. Penetrates complex lumens better than gas plasma with appropriate adaptors. Same packaging restrictions as gas plasma.' },
        { term: 'Ozone Sterilization', definition: 'Generated on-site from oxygen. Short cycle (~4.5 hours), no toxic byproducts (converts back to oxygen and water). Compatible with stainless steel, some polymers. Lumen penetration limitations apply.' },
        { term: 'Packaging Requirements', definition: 'EO: validated pouches, wraps, or rigid containers with breathable filter. Gas plasma: non-woven polypropylene only — no cellulose, no cloth wraps. Mismatched packaging is a sterilization failure, not just a packaging error.' },
      ],
      focusTip: 'For every low-temp method, know: temperature range, cycle time, toxic byproducts (or lack thereof), packaging requirements, and lumen limitations. EO aeration time and gas plasma packaging restriction are classic exam questions.',
    },
  },
  {
    id: 18,
    name: 'Sterile Storage & Transport',
    description: 'A sterile item stays sterile only through careful storage and transport. Know the conditions, the events that compromise sterility, and the rules for distribution.',
    domains: ['Sterile Storage'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Environmental Parameters', definition: 'Temperature: 65–75°F (18–24°C). Relative humidity: 35–70%. Positive air pressure (sterile storage is cleaner than adjacent areas). HVAC should provide at least 4 air changes per hour, with 20% outside air.' },
        { term: 'Shelf Clearances', definition: 'AAMI ST79: items must be stored ≥8–10 inches from the floor, ≥18 inches from the ceiling, ≥2 inches from outside walls. These clearances prevent contamination from floor traffic, sprinkler activation, and wall condensation.' },
        { term: 'Event-Related Sterility', definition: 'Packages are sterile until an event compromises the barrier — not until an expiration date. Disqualifying events: torn/punctured packaging, wet package, dropped from height, opened incorrectly. Inspect before every use.' },
        { term: 'Transport Requirements', definition: 'Use enclosed, rigid carts for transport between departments. Never carry sterile packages loose or in open containers. Carts must be covered. Sterile items transported outside the facility require additional outer packaging.' },
        { term: 'FIFO Rotation', definition: 'First In, First Out — oldest items used first. Prevents any item from sitting indefinitely. New stock loaded behind existing stock. Even with event-related sterility, FIFO is the standard practice.' },
      ],
      focusTip: 'Shelf clearances are memorized numbers the exam will test directly: 8–10 inches from floor, 18 inches from ceiling, 2 inches from walls. Also know the difference between event-related sterility (current standard) vs. date-related (outdated).',
    },
  },
  {
    id: 19,
    name: 'Monitoring & Recordkeeping',
    description: 'If it isn\'t documented, it didn\'t happen. Monitoring and documentation are how SPD proves its work and protects patients — and the facility.',
    domains: ['Quality & Regulatory', 'Inventory & Distribution'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Sterilization Load Records', definition: 'Each load must have a permanent record: sterilizer ID, cycle number, date/time, operator ID, load contents, mechanical printout, CI results, BI results (when run). Records must be retained per facility policy — typically 3–10 years.' },
        { term: 'Biological Indicator Frequency', definition: 'Steam: at minimum once per week and in every load containing implants. EO: every load. Gas plasma: minimum per manufacturer — typically every load. Positive BI = sterilization failure protocol.' },
        { term: 'Sterilization Failure Protocol', definition: '1) Remove sterilizer from service. 2) Quarantine all loads processed since last passing BI. 3) Notify risk management and infection control. 4) Recall potentially affected items. 5) Investigate root cause. 6) Document everything.' },
        { term: 'Instrument Tracking Systems', definition: 'RFID and barcode systems track instruments from decontamination through sterilization to patient use. Provides traceability for recalls, identifies high-use instruments, supports quality metrics. Documentation requirement — not optional in accredited facilities.' },
        { term: 'Corrective Action Documentation', definition: 'When a process failure occurs (wrong temperature, short exposure time, equipment malfunction), a corrective action form must document: what happened, root cause, immediate action, preventive measures. Part of the quality management system.' },
      ],
      focusTip: 'Sterilization failure protocol steps are tested in sequence. Know all 5 steps in order. Also know the BI testing frequency for each sterilization method — implants always require a BI per load regardless of method.',
    },
  },
  {
    id: 20,
    name: 'Quality & Production',
    description: 'Quality management in SPD is not an audit function — it\'s an operating discipline that prevents harm before it reaches the patient.',
    domains: ['Quality & Regulatory'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Process Improvement Models', definition: 'PDCA (Plan-Do-Check-Act) and DMAIC (Define-Measure-Analyze-Improve-Control) are common frameworks. SPD uses these to address recurring issues: wet packs, BI failures, instrument complaints.' },
        { term: 'Key Performance Indicators (KPIs)', definition: 'Common SPD KPIs: BI pass rate, instrument complaint rate, tray accuracy, on-time case delivery, wet pack rate. KPIs must be tracked, trended, and reviewed — not just collected.' },
        { term: 'Root Cause Analysis (RCA)', definition: 'Used after a significant event (patient infection, sterilization failure, recall). Identifies the underlying cause — not the proximate cause. The "5 Whys" technique drills down to systemic issues, not individual blame.' },
        { term: 'Loaner Instrument Protocol', definition: 'Required steps: 1) Receive loaners ≥24 hours before case. 2) Verify inventory against vendor manifest. 3) Decontaminate — even if packaged. 4) Inspect. 5) Package and sterilize. 6) No loaners to OR without completing full cycle.' },
        { term: 'SPD Performance Standards', definition: 'AAMI ST79 recommends facilities establish written policies for processing times, inspection standards, and quality benchmarks. TJC surveys for evidence of ongoing monitoring and quality improvement — not just that policies exist.' },
      ],
      focusTip: 'Quality questions often present scenarios: "A wet pack is found after the sterilizer cycle — what is the FIRST action?" The answer is always the procedural correct step, not the fastest or most convenient one. Know the protocols, not just the concepts.',
    },
  },

  // ── Tier 4: Systems & Leadership (Levels 21–24) ───────────────────────────
  {
    id: 21,
    name: 'Supply Chain & Information Technology',
    description: 'SPD is a supply chain. Managing inventory, tracking instruments through digital systems, and understanding the data layer of modern processing.',
    domains: ['Inventory & Distribution', 'Information Technology'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Par Level Inventory Management', definition: 'Par level = the minimum quantity of a supply that must be on hand at all times. When inventory falls to par, a reorder is triggered. Below par = potential case delay. Setting accurate par levels is a clinical and operational function.' },
        { term: 'Case Cart System', definition: 'Case carts are assembled in SPD with the instruments and supplies for a specific surgical procedure. Each cart is built from a preference card. Accuracy rate on case carts is a direct quality metric.' },
        { term: 'RFID Instrument Tracking', definition: 'Radio-frequency identification tags embedded in instrument handles or attached to trays enable real-time location tracking, use count monitoring, and automated documentation. Reduces manual count discrepancies and enables recalls.' },
        { term: 'EMR Integration', definition: 'Modern instrument tracking systems integrate with the electronic medical record (EMR) to document which specific instruments were used on which patient. Creates the chain of traceability required for targeted recalls.' },
        { term: 'Surgeon Preference Cards', definition: 'Digital documents specifying the instruments, supplies, and positioning equipment a surgeon requires for each procedure. SPD builds case carts from preference cards. Outdated preference cards are a leading cause of case cart errors.' },
      ],
      focusTip: 'IT and supply chain questions test your understanding of how SPD systems connect to patient care — not technical IT knowledge. Focus on traceability, par levels, preference cards, and case cart accuracy as core concepts.',
    },
  },
  {
    id: 22,
    name: 'Safety for Sterile Processing',
    description: 'SPD is one of the most hazardous work environments in healthcare. Chemical, sharps, ergonomic, and electrical hazards are present every shift.',
    domains: ['Safety'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Chemical Hazard Communication (HazCom)', definition: 'OSHA requires Safety Data Sheets (SDS) for every hazardous chemical in the workplace. SDS must be accessible to all employees. Employees must be trained on chemical hazards before exposure. Labels must not be removed.' },
        { term: 'Ergonomic Hazards in SPD', definition: 'Heavy instrument sets (up to 25 lbs), repetitive scrubbing motions, prolonged standing, and cart pushing are primary ergonomic risks. Use mechanical lifts for sets over personal capability. Report ergonomic injury symptoms early.' },
        { term: 'Decontamination Area PPE Requirements', definition: 'Minimum required: gloves (puncture-resistant), liquid-resistant gown/apron, face shield or goggles + mask (splash protection), shoe covers. All PPE must be removed before leaving decontamination — never worn into clean areas.' },
        { term: 'Compressed Gas Safety', definition: 'Compressed gas cylinders must be chained or secured upright — never stored horizontal. EO cylinders are stored in separate, ventilated areas with restricted access. A falling unsecured cylinder can become a projectile.' },
        { term: 'Exposure Incident Response', definition: 'Any needlestick, splash to mucous membrane, or exposure to blood/body fluids: 1) Wash area thoroughly. 2) Report immediately to supervisor. 3) Seek medical evaluation per facility protocol within 1–2 hours. 4) Document on incident report.' },
      ],
      focusTip: 'The decontamination PPE sequence and exposure incident response steps are high-frequency exam topics. Know exactly what PPE is required in decontamination and the exact steps after an exposure — in order.',
    },
  },
  {
    id: 23,
    name: 'Communication & Human Relations',
    description: 'SPD professionals work in every department of a hospital. Communication, teamwork, and conflict management are professional skills — and they\'re tested on the exam.',
    domains: ['Professional Development'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'Chain of Command', definition: 'Follow the organizational hierarchy for issue escalation: immediate supervisor → department manager → director → administration. Bypass the chain only when patient safety is immediately at risk and the normal path is unavailable.' },
        { term: 'Interdepartmental Communication', definition: 'SPD serves OR, ICU, ED, procedural areas, and clinics. Clear, accurate, professional communication with OR charge nurses and surgical coordinators about instrument availability prevents case delays and errors.' },
        { term: 'Conflict Resolution Principles', definition: 'Address interpersonal conflicts directly and privately when possible. Focus on behaviors and outcomes — not personalities. Escalate to supervisor if direct resolution fails. Document in writing when the conflict affects patient care or workplace safety.' },
        { term: 'Teamwork in SPD', definition: 'SPD is a production environment. Each tech\'s work directly affects every downstream process. Cross-training, communication at shift handoff, and mutual accountability are operational requirements — not soft skills.' },
        { term: 'Professionalism Under Pressure', definition: 'OR schedule pressure is never a valid reason to release a compromised item. SPD professionals must communicate clearly when an item is not ready — even to surgeons or supervisors. Patient safety is the non-negotiable priority.' },
      ],
      focusTip: 'Communication questions often present a scenario where a supervisor or OR nurse is applying pressure to release an item that isn\'t ready. The correct answer is always: follow the protocol, communicate the problem, do not compromise safety.',
    },
  },
  {
    id: 24,
    name: 'Professional Development',
    description: 'Your career in SPD — certifications, continuing education, advancement, and the professional identity of the field.',
    domains: ['Professional Development', 'Medical Terminology'],
    questionCount: 15,
    passingScore: 80,
    studyGuide: {
      keyConcepts: [
        { term: 'HSPA (Healthcare Sterile Processing Association)', definition: 'The professional association for SPD technicians and managers. Administers the CRCST, CHL, CER, and CIS certifications. Membership provides access to Communiqué journal, education resources, and advocacy.' },
        { term: 'CRCST Recertification Requirements', definition: '12 CEUs (continuing education units) required annually to maintain CRCST certification. CEUs must be in relevant sterile processing topics. Failure to recertify = certification lapse. This app is designed to support your CEU journey.' },
        { term: 'CEU Credit Hour Standard', definition: '1 contact hour of approved education = 1 CEU. HSPA approves specific educational activities and programs. Self-study, conferences, webinars, and employer-sponsored training may qualify with proper documentation.' },
        { term: 'Career Advancement Pathways', definition: 'CRCST → CHL (lead tech / supervisory) → CSPM (management) or CIS (instrument specialist). Each certification adds scope and increases earning potential. The CHL exam emphasizes leadership, training, and department management.' },
        { term: 'Continuing Competency', definition: 'Certification is not a one-time credential — it represents ongoing professional commitment. SPD leaders are expected to stay current with AAMI standards updates, new instrument technologies, and evidence-based reprocessing practices.' },
      ],
      focusTip: 'Professional development questions test your knowledge of HSPA, certification requirements, and career pathways. Know CRCST = 12 CEUs/year. Know the difference between CRCST (technician), CHL (lead/supervisor), and CIS (instrument specialist) scope.',
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
  // ── Tier 1: Foundations ──────────────────────────────────────────────────
  { id: 'domain-foundation',           name: 'Foundation',               description: 'Passed Level 1 — Safety, Microbiology & SPD Overview.',           icon: '🏛',  color: '#14BDAC', triggerLabel: 'Pass Level 1' },
  { id: 'domain-contamination-control',name: 'Contamination Control',    description: 'Passed Level 2 — Decontamination & Infection Prevention.',        icon: '🧪',  color: '#14BDAC', triggerLabel: 'Pass Level 2' },
  { id: 'domain-processing-workflow',  name: 'Processing Workflow',      description: 'Passed Level 3 — Disinfection, Packaging & Instrumentation.',     icon: '⚙️', color: '#14BDAC', triggerLabel: 'Pass Level 3' },
  { id: 'domain-sterilization',        name: 'Sterilization',            description: 'Passed Level 4 — Sterilization & Equipment.',                     icon: '🔬',  color: '#14BDAC', triggerLabel: 'Pass Level 4' },
  { id: 'domain-systems-compliance',   name: 'Systems & Compliance',     description: 'Passed Level 5 — Storage, Quality & Distribution.',               icon: '📋',  color: '#14BDAC', triggerLabel: 'Pass Level 5' },
  // ── Tier 2: Chapter Deep Dives ───────────────────────────────────────────
  { id: 'domain-spd-foundations',      name: 'SPD Foundations',          description: 'Passed Level 6 — SPD Foundations & Medical Terminology.',         icon: '📖',  color: '#4a9eff', triggerLabel: 'Pass Level 6' },
  { id: 'domain-anatomy',              name: 'Anatomy Certified',        description: 'Passed Level 7 — Anatomy for SP Technicians.',                    icon: '🫀',  color: '#4a9eff', triggerLabel: 'Pass Level 7' },
  { id: 'domain-microbiology',         name: 'Micro Mastery',            description: 'Passed Level 8 — Microbiology Mastery.',                          icon: '🦠',  color: '#4a9eff', triggerLabel: 'Pass Level 8' },
  { id: 'domain-infection-prevention', name: 'Infection Preventer',      description: 'Passed Level 9 — Infection Prevention Deep Dive.',                icon: '🛡️', color: '#4a9eff', triggerLabel: 'Pass Level 9' },
  { id: 'domain-regulations',          name: 'Standards Expert',         description: 'Passed Level 10 — Regulations & Standards.',                      icon: '⚖️', color: '#4a9eff', triggerLabel: 'Pass Level 10' },
  { id: 'domain-decon-deep',           name: 'Decon Deep Dive',          description: 'Passed Level 11 — Decontamination Deep Dive.',                    icon: '💧',  color: '#4a9eff', triggerLabel: 'Pass Level 11' },
  { id: 'domain-disinfection',         name: 'Disinfection Specialist',  description: 'Passed Level 12 — Disinfection & Endoscope Reprocessing.',        icon: '🔭',  color: '#4a9eff', triggerLabel: 'Pass Level 12' },
  { id: 'domain-instruments',          name: 'Instrument Technician',    description: 'Passed Level 13 — Surgical Instruments.',                         icon: '🔧',  color: '#4a9eff', triggerLabel: 'Pass Level 13' },
  { id: 'domain-complex-instruments',  name: 'Complex Instrument Pro',   description: 'Passed Level 14 — Complex & Specialty Instruments.',              icon: '🤖',  color: '#4a9eff', triggerLabel: 'Pass Level 14' },
  { id: 'domain-packaging',            name: 'Packaging Expert',         description: 'Passed Level 15 — Packaging & Preparation.',                      icon: '📦',  color: '#4a9eff', triggerLabel: 'Pass Level 15' },
  // ── Tier 3: Processing Excellence ────────────────────────────────────────
  { id: 'domain-high-temp',            name: 'Steam Master',             description: 'Passed Level 16 — High-Temperature Sterilization.',               icon: '♨️', color: '#DAA520', triggerLabel: 'Pass Level 16' },
  { id: 'domain-low-temp',             name: 'Low-Temp Specialist',      description: 'Passed Level 17 — Low-Temperature Sterilization.',                icon: '❄️', color: '#DAA520', triggerLabel: 'Pass Level 17' },
  { id: 'domain-sterile-storage',      name: 'Storage Guardian',         description: 'Passed Level 18 — Sterile Storage & Transport.',                  icon: '🗄️', color: '#DAA520', triggerLabel: 'Pass Level 18' },
  { id: 'domain-monitoring',           name: 'Quality Monitor',          description: 'Passed Level 19 — Monitoring & Recordkeeping.',                   icon: '📊',  color: '#DAA520', triggerLabel: 'Pass Level 19' },
  { id: 'domain-quality',              name: 'Quality Leader',           description: 'Passed Level 20 — Quality & Production.',                         icon: '🏆',  color: '#DAA520', triggerLabel: 'Pass Level 20' },
  // ── Tier 4: Systems & Leadership ─────────────────────────────────────────
  { id: 'domain-supply-chain',         name: 'Supply Chain Pro',         description: 'Passed Level 21 — Supply Chain & Information Technology.',        icon: '🔗',  color: '#f472b6', triggerLabel: 'Pass Level 21' },
  { id: 'domain-safety-mastery',       name: 'Safety Champion',          description: 'Passed Level 22 — Safety for Sterile Processing.',                icon: '🦺',  color: '#f472b6', triggerLabel: 'Pass Level 22' },
  { id: 'domain-communication',        name: 'SPD Communicator',         description: 'Passed Level 23 — Communication & Human Relations.',              icon: '🤝',  color: '#f472b6', triggerLabel: 'Pass Level 23' },
  { id: 'domain-professional-dev',     name: 'Career Ready',             description: 'Passed Level 24 — Professional Development.',                     icon: '🎓',  color: '#f472b6', triggerLabel: 'Pass Level 24' },
  // ── Achievement badges ───────────────────────────────────────────────────
  { id: 'full-circuit',    name: 'Full Circuit',  description: 'Completed all 24 progression levels.',     icon: '🎯', color: '#DAA520', triggerLabel: 'Complete all 24 levels' },
  { id: 'precision',       name: 'Precision',     description: 'Scored 90% or higher on any level.',       icon: '⚡', color: '#4a9eff', triggerLabel: 'Score 90%+ on any level' },
  { id: 'perfect-round',   name: 'Perfect Round', description: 'Scored 100% on any level.',               icon: '💎', color: '#f472b6', triggerLabel: 'Score 100% on any level' },
]

// Map level id → domain badge id
export const LEVEL_BADGE_MAP: Record<number, string> = {
  1:  'domain-foundation',
  2:  'domain-contamination-control',
  3:  'domain-processing-workflow',
  4:  'domain-sterilization',
  5:  'domain-systems-compliance',
  6:  'domain-spd-foundations',
  7:  'domain-anatomy',
  8:  'domain-microbiology',
  9:  'domain-infection-prevention',
  10: 'domain-regulations',
  11: 'domain-decon-deep',
  12: 'domain-disinfection',
  13: 'domain-instruments',
  14: 'domain-complex-instruments',
  15: 'domain-packaging',
  16: 'domain-high-temp',
  17: 'domain-low-temp',
  18: 'domain-sterile-storage',
  19: 'domain-monitoring',
  20: 'domain-quality',
  21: 'domain-supply-chain',
  22: 'domain-safety-mastery',
  23: 'domain-communication',
  24: 'domain-professional-dev',
}

export function getBadgeById(id: string): ProgressionBadge | undefined {
  return PROGRESSION_BADGES.find(b => b.id === id)
}
