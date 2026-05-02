export interface GlossaryTerm {
  term: string
  /** Short acronym or abbreviation if the term is an expansion */
  abbr?: string
  definition: string
  category: 'Standards & Regulations' | 'Sterilization' | 'Decontamination' | 'Microbiology' | 'Instruments & Equipment' | 'Quality & Safety' | 'Anatomy & Medical Terms'
}

export const GLOSSARY: GlossaryTerm[] = [
  // ── Standards & Regulations ──────────────────────────────────────────────
  {
    term: 'AAMI',
    abbr: 'Association for the Advancement of Medical Instrumentation',
    definition: 'The primary standards organization for sterile processing in the U.S. Publishes ST79 (steam sterilization), ST58 (chemical sterilization), and ST91 (endoscope reprocessing).',
    category: 'Standards & Regulations',
  },
  {
    term: 'ST79',
    definition: 'AAMI\'s comprehensive guide to steam sterilization and sterility assurance in health care facilities — the central reference standard for SPD practice.',
    category: 'Standards & Regulations',
  },
  {
    term: 'ST91',
    definition: 'AAMI standard specifically for flexible and semi-rigid endoscope reprocessing, covering cleaning, HLD, and storage.',
    category: 'Standards & Regulations',
  },
  {
    term: 'FDA',
    abbr: 'Food and Drug Administration',
    definition: 'U.S. federal agency that regulates medical devices (including sterilizers and chemical indicators), disinfectants classified as medical devices, and IFU compliance.',
    category: 'Standards & Regulations',
  },
  {
    term: 'OSHA',
    abbr: 'Occupational Safety and Health Administration',
    definition: 'Federal agency setting workplace safety standards. In SPD, OSHA\'s Bloodborne Pathogen Standard (29 CFR 1910.1030) governs PPE, sharps disposal, and exposure control plans.',
    category: 'Standards & Regulations',
  },
  {
    term: 'EPA',
    abbr: 'Environmental Protection Agency',
    definition: 'Regulates disinfectants and sterilants used in healthcare. Requires strict labeling on all disinfectant products used in SPD.',
    category: 'Standards & Regulations',
  },
  {
    term: 'CDC',
    abbr: 'Centers for Disease Control and Prevention',
    definition: 'U.S. public health agency whose Guideline for Disinfection and Sterilization in Healthcare Facilities (2008, updated) is a key practice reference for SPD.',
    category: 'Standards & Regulations',
  },
  {
    term: 'HSPA',
    abbr: 'Healthcare Sterile Processing Association',
    definition: 'Professional association for sterile processing professionals. Develops competency standards, certification programs (CRCST, CHL, CER), and continuing education.',
    category: 'Standards & Regulations',
  },
  {
    term: 'Joint Commission',
    definition: 'Accreditation body for U.S. hospitals. Surveys SPD practices against IC (Infection Control) and EC (Environment of Care) standards during accreditation visits.',
    category: 'Standards & Regulations',
  },
  {
    term: 'IFU',
    abbr: 'Instructions for Use',
    definition: 'Manufacturer-provided documentation specifying how a device or instrument must be cleaned, disinfected, or sterilized. IFU compliance is legally required and cannot be overridden by facility policy.',
    category: 'Standards & Regulations',
  },
  {
    term: 'MDR',
    abbr: 'Medical Device Report',
    definition: 'An FDA-required report when a medical device may have caused or contributed to a serious injury or death. SPD must report sterilizer malfunctions that result in patient harm.',
    category: 'Standards & Regulations',
  },
  {
    term: 'SDS',
    abbr: 'Safety Data Sheet',
    definition: 'Document provided by a chemical manufacturer describing hazards, handling, storage, PPE requirements, and emergency procedures. Required by OSHA\'s Hazard Communication Standard.',
    category: 'Standards & Regulations',
  },
  // ── Sterilization ────────────────────────────────────────────────────────
  {
    term: 'BI',
    abbr: 'Biological Indicator',
    definition: 'A standardized preparation of highly resistant spores (e.g., Geobacillus stearothermophilus for steam) used to challenge a sterilization process. Growth after incubation = positive BI = sterilization failure.',
    category: 'Sterilization',
  },
  {
    term: 'CI',
    abbr: 'Chemical Indicator',
    definition: 'A device that uses a chemical or physical change to indicate exposure to a sterilization process. Class 1 (process indicators) through Class 6 (emulating indicators) per ISO 11140-1.',
    category: 'Sterilization',
  },
  {
    term: 'PCD',
    abbr: 'Process Challenge Device',
    definition: 'A device (also called a test pack) that simulates worst-case sterilization conditions. Used with BIs and CIs to validate that the sterilant reached the most challenging point in the load.',
    category: 'Sterilization',
  },
  {
    term: 'Bowie-Dick Test',
    definition: 'A Class 2 chemical indicator test run daily in dynamic air-removal (pre-vacuum) steam sterilizers to verify adequate air removal and steam penetration. Failure means the sterilizer must be taken out of service.',
    category: 'Sterilization',
  },
  {
    term: 'EO',
    abbr: 'Ethylene Oxide',
    definition: 'A gaseous sterilant used for heat- and moisture-sensitive devices. Requires aeration time after the cycle to remove toxic residue. Regulated by OSHA and EPA.',
    category: 'Sterilization',
  },
  {
    term: 'Flash Sterilization',
    definition: 'An abbreviated sterilization cycle for immediate use — officially called IUSS (Immediate Use Steam Sterilization). Intended for emergency use only; items cannot be stored after a flash cycle.',
    category: 'Sterilization',
  },
  {
    term: 'IUSS',
    abbr: 'Immediate Use Steam Sterilization',
    definition: 'The current term for "flash sterilization." Permitted only when there is insufficient time to process using the preferred method and no documented patient harm has occurred with the device. See AAMI ST79.',
    category: 'Sterilization',
  },
  {
    term: 'SAL',
    abbr: 'Sterility Assurance Level',
    definition: 'The probability of a viable microorganism remaining on a sterilized item. The accepted SAL for sterilized medical devices is 10⁻⁶ (1 in 1,000,000 chance of a surviving microorganism).',
    category: 'Sterilization',
  },
  {
    term: 'Sporicidal',
    definition: 'Capable of killing bacterial and fungal spores. Only sterilization processes (or liquid chemical sterilants) achieve sporicidal activity. High-level disinfection does NOT reliably kill all spores.',
    category: 'Sterilization',
  },
  {
    term: 'Event-Related Sterility',
    definition: 'The concept that sterility is maintained based on how a package is handled and stored, not by a calendar expiration date alone. A package is considered sterile until an event compromises it (tear, moisture, puncture).',
    category: 'Sterilization',
  },
  // ── Decontamination ──────────────────────────────────────────────────────
  {
    term: 'Decontamination',
    definition: 'The process of reducing or removing microbial contamination to a level at which items are safe for further handling. Includes cleaning, disinfection, or sterilization depending on the item.',
    category: 'Decontamination',
  },
  {
    term: 'HLD',
    abbr: 'High-Level Disinfection',
    definition: 'A disinfection process that eliminates all vegetative bacteria, mycobacteria, fungi, and viruses, and inactivates most (but not all) bacterial spores. Required for semi-critical devices like flexible endoscopes.',
    category: 'Decontamination',
  },
  {
    term: 'AER',
    abbr: 'Automated Endoscope Reprocessor',
    definition: 'A machine that automates the HLD cycle for flexible endoscopes, including chemical flushing and rinsing of internal channels. Does not replace manual cleaning.',
    category: 'Decontamination',
  },
  {
    term: 'Enzymatic Detergent',
    definition: 'A cleaning agent containing enzymes (protease, lipase, amylase) that break down proteins, fats, and carbohydrates in bioburden. Must be used at the correct concentration, temperature, and changed per IFU.',
    category: 'Decontamination',
  },
  {
    term: 'Bioburden',
    definition: 'The total number of microorganisms contaminating an item before sterilization or disinfection. Reducing bioburden through thorough cleaning is critical — sterilants cannot penetrate heavy soil.',
    category: 'Decontamination',
  },
  {
    term: 'Biofilm',
    definition: 'A community of microorganisms encased in a self-produced matrix that adheres to surfaces. Biofilm is highly resistant to disinfectants and must be removed through mechanical cleaning before HLD or sterilization.',
    category: 'Decontamination',
  },
  {
    term: 'Spaulding Classification',
    definition: 'A framework categorizing medical devices by the risk of infection they pose: Critical (contact sterile tissue — must be sterilized), Semi-critical (contact mucous membranes — HLD minimum), Non-critical (contact intact skin — low-level disinfection).',
    category: 'Decontamination',
  },
  {
    term: 'PPE',
    abbr: 'Personal Protective Equipment',
    definition: 'Protective attire required in SPD decontamination areas per OSHA\'s Bloodborne Pathogen Standard: fluid-resistant gown, gloves, face shield or goggles, and appropriate footwear.',
    category: 'Quality & Safety',
  },
  {
    term: 'TWA',
    abbr: 'Time-Weighted Average',
    definition: 'The average concentration of a hazardous substance (e.g., EO, glutaraldehyde) that a worker can be exposed to over an 8-hour workday without adverse health effects. Established by OSHA for each substance.',
    category: 'Quality & Safety',
  },
  // ── Microbiology ─────────────────────────────────────────────────────────
  {
    term: 'Spore',
    definition: 'A dormant, highly resistant form produced by certain bacteria (e.g., Bacillus, Clostridium). Spores can survive extreme heat, chemicals, and desiccation. They are used as the challenge organism in biological indicators.',
    category: 'Microbiology',
  },
  {
    term: 'Prion',
    definition: 'An infectious, misfolded protein that causes diseases like CJD (Creutzfeldt-Jakob Disease). Prions resist all standard sterilization and disinfection. Instruments used on known or suspected prion cases require specialized reprocessing protocols.',
    category: 'Microbiology',
  },
  {
    term: 'HAI',
    abbr: 'Healthcare-Associated Infection',
    definition: 'An infection that develops on or after the third day of a hospital stay (or within 30 days post-surgery) and was not present on admission. SPD failures are a leading cause of HAIs from contaminated instruments.',
    category: 'Microbiology',
  },
  {
    term: 'MRSA',
    abbr: 'Methicillin-Resistant Staphylococcus aureus',
    definition: 'A drug-resistant bacterium that is a major cause of HAIs. Killed by proper sterilization and most disinfection processes, but must be treated with Standard Precautions during decontamination.',
    category: 'Microbiology',
  },
  {
    term: 'C. diff',
    abbr: 'Clostridioides difficile',
    definition: 'A spore-forming bacterium that causes severe diarrhea and colitis. Spores are resistant to alcohol-based hand rubs; soap and water handwashing and sporicidal agents (e.g., bleach) are required.',
    category: 'Microbiology',
  },
  {
    term: 'Asepsis',
    definition: 'The absence of pathogenic microorganisms. Surgical asepsis (sterile technique) is the complete absence of all microorganisms. Medical asepsis (clean technique) reduces the number and spread of microorganisms.',
    category: 'Microbiology',
  },
  // ── Instruments & Equipment ──────────────────────────────────────────────
  {
    term: 'ORIF',
    abbr: 'Open Reduction Internal Fixation',
    definition: 'A surgical procedure to repair a fractured bone using plates, screws, or rods. The instruments used are complex and require meticulous decontamination and assembly per the instrument tray card.',
    category: 'Anatomy & Medical Terms',
  },
  {
    term: 'Rigid Endoscope',
    definition: 'A non-flexible optical instrument used for direct visualization of body cavities (e.g., laparoscope, arthroscope, cystoscope). Classified as critical devices — must be sterilized between uses.',
    category: 'Instruments & Equipment',
  },
  {
    term: 'Flexible Endoscope',
    definition: 'A semi-critical device with internal channels used to visualize the GI tract, airway, or other lumens. Cannot typically withstand heat sterilization — processed by manual cleaning followed by HLD.',
    category: 'Instruments & Equipment',
  },
  {
    term: 'RFID',
    abbr: 'Radio Frequency Identification',
    definition: 'Tagging technology that provides real-time tracking of instruments and trays throughout the SPD workflow. Superior to barcodes because it does not require line-of-sight and can be read automatically.',
    category: 'Instruments & Equipment',
  },
  {
    term: 'PAR',
    abbr: 'Periodic Automatic Replenishment',
    definition: 'An inventory system where supply levels are maintained at pre-established par levels. When stock drops below par, replenishment is triggered automatically.',
    category: 'Instruments & Equipment',
  },
  // ── Quality & Safety ─────────────────────────────────────────────────────
  {
    term: 'RCA',
    abbr: 'Root Cause Analysis',
    definition: 'A reactive quality tool that examines a poor outcome (e.g., a positive BI after a load was released) to identify the underlying cause(s) and implement corrections to prevent recurrence.',
    category: 'Quality & Safety',
  },
  {
    term: 'FMEA',
    abbr: 'Failure Mode and Effects Analysis',
    definition: 'A proactive quality tool that systematically identifies potential failure points in a process before they occur. Used in SPD to prevent sterilization failures and instrument mix-ups.',
    category: 'Quality & Safety',
  },
  {
    term: 'Ergonomics',
    definition: 'The science of designing work and working conditions to fit the worker, reducing physical stress and injury risk. Critical in SPD where technicians handle heavy trays and perform repetitive motions.',
    category: 'Quality & Safety',
  },
  {
    term: 'Standard Precautions',
    definition: 'OSHA and CDC guidelines requiring that all patients be treated as if their blood and body fluids are potentially infectious, regardless of diagnosis. Governs PPE use in SPD decontamination.',
    category: 'Quality & Safety',
  },
  {
    term: 'Negative Air Pressure',
    definition: 'Required for the SPD decontamination area: air flows into the room (not out) so contaminants cannot escape to clean areas. The clean assembly/packaging area should have positive air pressure.',
    category: 'Quality & Safety',
  },
]

export const GLOSSARY_CATEGORIES = [
  'Standards & Regulations',
  'Sterilization',
  'Decontamination',
  'Microbiology',
  'Instruments & Equipment',
  'Quality & Safety',
  'Anatomy & Medical Terms',
] as const
