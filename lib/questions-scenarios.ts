// ─────────────────────────────────────────────────────────────────────────────
// lib-questions-scenarios.ts
// Scenario-based, situational judgment, and critical thinking questions
// for SPD Cert Prep — spdcertprep.com
//
// PURPOSE: Build cognitive decision-making skills beyond exam recall.
// These questions simulate real-world situations a sterile processing
// technician, endoscope reprocessor, or department leader will face.
//
// QUESTION TYPES:
//   "scenario"    — A situation is described. What do you do?
//   "decision"    — Multiple valid-seeming options. Which is correct and why?
//   "pitfall"     — A common mistake is presented. Identify and correct it.
//   "sequence"    — Steps are out of order or one is missing. Fix it.
//   "regulatory"  — Standards/compliance application in real context.
//   "judgment"    — No single "textbook" answer — requires weighing factors.
// ─────────────────────────────────────────────────────────────────────────────

export type ScenarioType =
  | "scenario"
  | "decision"
  | "pitfall"
  | "sequence"
  | "regulatory"
  | "judgment";

export interface ScenarioQuestion {
  id: string;
  type: ScenarioType;
  domain: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  question: string;
  context?: string;           // Optional setup paragraph before the question
  options: { a: string; b: string; c: string; d: string };
  correct: "a" | "b" | "c" | "d";
  explanation: string;        // WHY — the reasoning, not just the answer
  realWorldNote?: string;     // What actually happens in practice
  standardRef?: string;       // AAMI, CDC, HSPA, OSHA reference if applicable
  tags: string[];
}

export const scenarioQuestions: ScenarioQuestion[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // DECONTAMINATION & CLEANING — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-decon-001",
    type: "scenario",
    domain: "Decontamination & Cleaning",
    difficulty: "intermediate",
    context: "You are manually cleaning a flexible colonoscope. About halfway through brushing the instrument channel, you notice the enzymatic detergent solution in the sink basin has turned dark brown.",
    question: "What does this indicate and what is the correct next action?",
    options: {
      a: "This is normal — continue cleaning in the same solution until the brushing step is complete",
      b: "The solution has become heavily contaminated with bioburden. Discard it, rinse the scope, prepare fresh solution, and complete the cleaning cycle",
      c: "Add more enzymatic concentrate to the existing solution to boost its cleaning power and continue",
      d: "The scope is clean enough — dark color means the detergent has absorbed all the soil, so skip rinsing",
    },
    correct: "b",
    explanation: "Dark or heavily discolored enzymatic solution signals high bioburden contamination. Continuing to clean in the same solution re-deposits contamination onto the scope. The correct action is to discard the solution immediately, rinse the scope and basin, prepare fresh enzymatic solution at the correct concentration and temperature, and complete the process. Enzymatic solutions must be changed for each scope AND whenever visibly contaminated.",
    realWorldNote: "This is one of the most common shortcuts taken under time pressure — techs keep using the same basin across multiple scopes. Each scope gets dirtier than the last one cleaned. Biofilm risk escalates with every scope processed in contaminated solution.",
    standardRef: "AAMI ST91 — enzymatic solution changed per IFU and after each endoscope",
    tags: ["enzymatic cleaning", "manual cleaning", "colonoscope", "bioburden", "solution change"],
  },

  {
    id: "scen-decon-002",
    type: "pitfall",
    domain: "Decontamination & Cleaning",
    difficulty: "foundational",
    context: "A new technician tells you they used the same reusable cleaning brush for three scopes in a row because 'it still looked clean and the shift was busy.'",
    question: "What is the error and what is the correct practice?",
    options: {
      a: "No error — if the brush looks clean, it is clean, and reusing it saves time during busy periods",
      b: "The brush should have been replaced after every other scope, not every scope",
      c: "Reusable brushes must be cleaned and high-level disinfected between each scope — using the same brush transfers contamination from scope to scope",
      d: "The brush only needs to be changed once per shift, regardless of how many scopes were processed",
    },
    correct: "c",
    explanation: "A reusable cleaning brush used on one scope is contaminated with that scope's bioburden. Using it on the next scope transfers that contamination directly into the channels being cleaned. Reusable brushes must be cleaned and high-level disinfected between each scope. Disposable single-use brushes eliminate this risk entirely and are the preferred option when cross-contamination risk is a concern.",
    realWorldNote: "This is one of the most common reprocessing errors found during audits. Visually 'clean' brushes harbor significant microbial contamination. The time saved is not worth the patient safety risk.",
    standardRef: "SGNA Guidelines — brush reprocessing between each scope use",
    tags: ["cleaning brush", "cross contamination", "reusable brush", "manual cleaning", "audit failure"],
  },

  {
    id: "scen-decon-003",
    type: "scenario",
    domain: "Decontamination & Cleaning",
    difficulty: "intermediate",
    context: "An OR nurse drops off a rigid laparoscope and tells you 'it just needs a quick clean, the case was only 10 minutes.' You inspect it and notice tissue debris on the shaft and inside the port.",
    question: "How does the length of the procedure affect your reprocessing approach?",
    options: {
      a: "A 10-minute case means minimal contamination — a shorter cleaning cycle is appropriate",
      b: "Procedure length is irrelevant. Every used instrument receives the full reprocessing cycle regardless of how long it was used",
      c: "You can skip the leak test since it was only used briefly",
      d: "Skip enzymatic soaking since there isn't much visible soil",
    },
    correct: "b",
    explanation: "The length of a procedure has no bearing on the required reprocessing cycle. An instrument used for 5 minutes can carry the same infectious risk as one used for 5 hours — a single contact with blood, tissue, or body fluid creates a contamination risk that requires full reprocessing. Visible debris confirms contamination. Every step of the full cycle applies: inspection, cleaning, rinsing, HLD or sterilization, and storage.",
    realWorldNote: "'It was only a quick case' is one of the most common justifications for shortcuts in sterile processing. OR staff often don't understand that reprocessing requirements are binary — contaminated or not — not proportional to procedure time.",
    tags: ["procedure length", "full reprocessing cycle", "rigid endoscope", "laparoscope", "shortcuts"],
  },

  {
    id: "scen-decon-004",
    type: "decision",
    domain: "Decontamination & Cleaning",
    difficulty: "advanced",
    context: "During manual cleaning of a duodenoscope, you notice the elevator mechanism feels stiff and doesn't move as freely as it should. The scope passed the leak test. It was used this morning on a patient with a known ESBL infection.",
    question: "What is the correct course of action?",
    options: {
      a: "Complete the standard reprocessing cycle and return the scope to service — it passed the leak test",
      b: "Complete enhanced reprocessing per your facility's duodenoscope protocol (including double HLD or sterilization), quarantine the scope, and notify your supervisor and infection prevention about the stiff elevator and the ESBL patient exposure",
      c: "Return the scope to service after standard HLD — the stiff elevator is a mechanical issue, not an infection risk",
      d: "Discard the scope immediately without cleaning it since it was used on an ESBL patient",
    },
    correct: "b",
    explanation: "Duodenoscopes require enhanced reprocessing protocols due to the elevator mechanism's known infection transmission risk. A stiff elevator indicates potential mechanical damage creating additional hard-to-clean recesses. Combined with ESBL exposure, this scope requires: (1) enhanced reprocessing per facility protocol, (2) quarantine pending inspection, (3) supervisor and infection prevention notification. The scope should not return to service until it has been thoroughly inspected and cleared. Document everything.",
    realWorldNote: "Duodenoscope-related CRE and ESBL outbreaks at major medical centers trace directly to inadequate cleaning of the elevator mechanism. A stiff elevator can harbor organisms that survive even properly performed HLD.",
    standardRef: "CDC Essential Elements — enhanced duodenoscope reprocessing protocols; FDA Safety Communication on duodenoscopes",
    tags: ["duodenoscope", "elevator mechanism", "ESBL", "enhanced reprocessing", "infection prevention", "CHL decision making"],
  },

  {
    id: "scen-decon-005",
    type: "scenario",
    domain: "Decontamination & Cleaning",
    difficulty: "foundational",
    context: "You are cleaning an endoscope and realize it has been sitting in the soaking basin for 3 hours since the procedure ended. Point-of-use pre-cleaning was not performed.",
    question: "What is the primary concern and how should you proceed?",
    options: {
      a: "No concern — soaking in water keeps the scope moist and prevents soil from drying",
      b: "The 3-hour delay means biofilm has likely begun forming and soil has dried in channels. Complete the full reprocessing cycle with extra attention to brushing and soaking steps, and document the delay",
      c: "The scope should be discarded — any delay over 1 hour makes it unsafe to reprocess",
      d: "Run it through the AER immediately since the soak compensated for the missed pre-cleaning",
    },
    correct: "b",
    explanation: "Reprocessing beginning more than one hour after use is called 'delayed processing.' Sitting in plain water without enzymatic solution does not prevent biofilm formation — it can actually promote microbial growth. Dried soil in channels significantly increases cleaning difficulty. The correct approach is to complete the full reprocessing cycle with meticulous attention to each step, particularly the enzymatic soak and channel brushing. Document the delay. Do not skip steps or assume the AER will compensate.",
    realWorldNote: "Soaking scopes in plain water for extended periods is a common mistake. Techs assume the scope is 'staying clean' but plain water does not inhibit biofilm — it supports it. If delayed processing is unavoidable, keeping the scope moist with enzymatic solution is preferable to plain water.",
    standardRef: "AAMI ST91 — delayed processing protocols",
    tags: ["delayed processing", "biofilm", "pre-cleaning", "1-hour rule", "documentation"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAK TESTING — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-leak-001",
    type: "scenario",
    domain: "Leak Testing",
    difficulty: "intermediate",
    context: "You perform a leak test on a gastroscope and notice a very slow, small stream of bubbles coming from the bending section area. The next procedure is scheduled in 45 minutes and there are no backup scopes available. The charge nurse asks you to 'just run it through the AER and get it back.'",
    question: "What do you do?",
    options: {
      a: "Run it through the AER as requested — a small leak is unlikely to cause problems for a single case",
      b: "Patch the leak with waterproof tape, complete reprocessing, and return it to service for the one case",
      c: "Remove the scope from service immediately, complete the leaking scope reprocessing protocol, notify the charge nurse the scope cannot be used, and document everything. The procedure must be postponed or rescheduled",
      d: "Complete standard reprocessing and flag the scope for repair after the next case",
    },
    correct: "c",
    explanation: "A leaking scope cannot be returned to service regardless of scheduling pressure. Fluid invasion through the leak will damage internal components, contaminate the scope's interior in ways that cannot be adequately disinfected, and create direct patient risk. The correct sequence: follow the leaking scope protocol (depressurize 30 seconds, clean the affected area, tape if minor), complete reprocessing, quarantine, notify the charge nurse and supervisor, and document. Patient safety overrides scheduling pressure every time. This is also a CHL decision-making test — the right answer protects both the patient and the department.",
    realWorldNote: "Scheduling pressure is the #1 reason defective scopes end up back in patient use. Charge nurses are not reprocessing experts — your job is to be the expert. Document your refusal to return a defective scope in writing.",
    standardRef: "AAMI ST91 — leak testing failure protocol; SGNA Guidelines",
    tags: ["leak testing", "scope failure", "scheduling pressure", "patient safety", "CHL decision", "documentation", "scope removal from service"],
  },

  {
    id: "scen-leak-002",
    type: "decision",
    domain: "Leak Testing",
    difficulty: "foundational",
    context: "You are about to perform a leak test on a flexible bronchoscope and realize the water-resistant cap is missing from the scope.",
    question: "What should you do before proceeding with the leak test?",
    options: {
      a: "Proceed with the leak test without the cap — the test will still detect leaks",
      b: "Do not proceed. Locate the correct water-resistant cap before performing the leak test. Proceeding without it risks fluid damage to internal components",
      c: "Use a cap from a different scope model as a temporary substitute",
      d: "Skip the leak test since the scope will be going through the AER anyway",
    },
    correct: "b",
    explanation: "The water-resistant cap must be in place before performing a leak test. Without it, the pressurization process can force fluid into sensitive internal components including the video chip, electrical connections, and internal optics. This can cause catastrophic damage that costs thousands of dollars to repair. Never proceed with a leak test on a scope with a missing or improperly seated water-resistant cap. Locate the correct cap, or if unavailable, do not perform the leak test — quarantine the scope and notify your supervisor.",
    tags: ["leak testing", "water-resistant cap", "bronchoscope", "fluid invasion", "scope protection"],
  },

  {
    id: "scen-leak-003",
    type: "scenario",
    domain: "Leak Testing",
    difficulty: "advanced",
    context: "During a dynamic leak test (scope submerged and pressurized), you observe a rapid, continuous stream of large bubbles from the bending section. This is clearly a major leak.",
    question: "What is the correct immediate sequence of actions?",
    options: {
      a: "Remove scope from water immediately, turn off the leak tester, let it depressurize, proceed with patching and full cleaning",
      b: "Keep the scope in water and continue the test to map the full extent of the damage before removing it",
      c: "Remove the scope from the water, release the pressure immediately by opening the control valve or turning off the mechanical tester, wait 30 seconds for full depressurization, then proceed with the leaking scope protocol",
      d: "Turn off the leak tester while the scope is still submerged, then remove it and proceed directly to the AER",
    },
    correct: "c",
    explanation: "A major leak requires: (1) remove scope from water, (2) release pressure per the method being used — turn off mechanical tester or open control valve on manual tester, (3) allow 30 seconds for full depressurization before touching or moving the bending section. Removing the scope while still pressurized and then abruptly opening the valve can force water deeper into the scope. The 30-second wait is not optional — it allows the pressure to equalize safely. Then proceed with the leaking scope cleaning protocol before sending for repair.",
    realWorldNote: "Techs often panic with a major leak and try to rush — turning off the tester while the scope is still submerged, then yanking it out. Each rushed step pushes more contaminated water into the scope's interior.",
    standardRef: "AAMI ST91 — leak test failure; IFU-specific leak test protocols",
    tags: ["major leak", "leak test", "depressurization", "30 seconds", "bending section", "leaking scope protocol"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HIGH-LEVEL DISINFECTION — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-hld-001",
    type: "decision",
    domain: "High-Level Disinfection",
    difficulty: "intermediate",
    context: "You are about to begin a manual HLD soak on a colonoscope. You test the glutaraldehyde solution and the test strip indicates the concentration has dropped below the minimum effective concentration (MEC). The solution was mixed two days ago and hasn't reached its stated reuse life.",
    question: "What is the correct action?",
    options: {
      a: "Use the solution anyway — it hasn't reached its reuse life so it must still be effective",
      b: "Add more glutaraldehyde concentrate to bring the concentration back up, then proceed",
      c: "Discard the solution immediately. A failed MEC test means the solution cannot guarantee adequate disinfection regardless of reuse life remaining",
      d: "Use the solution for this one scope but discard it after — it probably has enough activity left for one more cycle",
    },
    correct: "c",
    explanation: "MEC test failure means DISCARD — no exceptions. Reuse life (the number of days the manufacturer says the activated solution can be used) is a maximum, not a guarantee. If the MEC test strip shows the concentration has dropped below the minimum effective concentration before that date, the solution is no longer viable. Adding more concentrate to a depleted solution does not restore efficacy — the chemistry has changed. Document the failure, discard the solution, prepare fresh solution, verify concentration before use, and document the new solution preparation.",
    realWorldNote: "The reuse life date and the MEC test are two independent checks — both must pass. Many techs assume 'day 14 of 14' means the solution is still good without testing. The test strip is the only way to know.",
    standardRef: "AAMI ST91 — HLD solution monitoring; MEC vs. MRC distinction",
    tags: ["MEC", "glutaraldehyde", "HLD solution", "test strip failure", "discard", "manual HLD"],
  },

  {
    id: "scen-hld-002",
    type: "scenario",
    domain: "High-Level Disinfection",
    difficulty: "intermediate",
    context: "After completing manual HLD on a flexible scope, you are rinsing it according to the manufacturer's IFU. A coworker tells you 'just rinse it three times with tap water — that's what everyone does here.'",
    question: "How should you respond and what is the correct practice?",
    options: {
      a: "Follow your coworker's advice — three rinses with tap water is standard industry practice",
      b: "The IFU specifies the exact rinsing method for that specific scope and disinfectant combination. Follow the IFU — not informal departmental shortcuts. Some IFUs require sterile water for the final rinse",
      c: "One thorough rinse with tap water is sufficient — over-rinsing wastes time",
      d: "Skip rinsing entirely if you used a low-concentration disinfectant",
    },
    correct: "b",
    explanation: "Rinsing after HLD must follow the manufacturer's IFU for that specific scope and disinfectant combination. The rinse method, water type, and number of rinses varies. Some disinfectants require a final rinse with sterile water to prevent recontamination from tap water organisms. 'What everyone does here' is not a standard — it's a potential HAI waiting to happen. Disinfectant residue left from inadequate rinsing can cause patient tissue damage. IFU compliance is both a quality and regulatory requirement.",
    realWorldNote: "Facility-wide informal shortcuts often develop over time and become 'the way we do things here.' When a surveyor or HAI investigation arrives, 'that's what everyone does' is not a defensible answer.",
    standardRef: "AAMI ST91 — post-HLD rinsing requirements; FDA IFU compliance",
    tags: ["post-HLD rinse", "IFU compliance", "tap water", "sterile water", "informal shortcuts", "disinfectant residue"],
  },

  {
    id: "scen-hld-003",
    type: "scenario",
    domain: "High-Level Disinfection",
    difficulty: "advanced",
    context: "Your AER completes a cycle. When you open it, you notice there is visible moisture inside one of the scope's channels when you hold it up to the light. The scope is needed for a procedure in 30 minutes.",
    question: "What do you do?",
    options: {
      a: "Return the scope to service — the AER completed its cycle so the scope is disinfected even if moist",
      b: "The scope cannot be used. Moisture remaining after HLD and rinsing creates a recontamination environment for microbial growth. Purge all channels with forced air per IFU, verify dryness, then store or return to service",
      c: "Use a cotton swab to absorb the visible moisture and return the scope to service",
      d: "Re-run the scope through the AER — the second cycle will dry the channels",
    },
    correct: "b",
    explanation: "Moisture remaining in endoscope channels after HLD is a recognized recontamination risk. Moist channels provide the warm, nutrient-rich environment microorganisms need to grow — even after a properly performed HLD cycle. The IFU-specified drying step (forced air purge through all channels, followed in some cases by a 70% alcohol flush) is not optional. The scope must be properly dried before it can be safely stored or used. This means the 30-minute deadline cannot be met — patient safety over scheduling.",
    realWorldNote: "Post-HLD moisture is responsible for a significant percentage of post-colonoscopy infections. The drying step is one of the most skipped steps in busy endoscopy units.",
    standardRef: "AAMI ST91 — post-HLD drying requirements; SGNA drying protocols",
    tags: ["post-HLD drying", "moisture", "recontamination", "forced air purge", "alcohol flush", "AER cycle"],
  },

  {
    id: "scen-hld-004",
    type: "judgment",
    domain: "High-Level Disinfection",
    difficulty: "advanced",
    context: "A physician wants to use their personal scope — one they own privately — for a procedure at your facility. They tell you it was 'cleaned at my office' and just needs to be checked in. You have never seen this scope before and there is no IFU available.",
    question: "What is the appropriate response?",
    options: {
      a: "Accept the scope and run it through your standard AER cycle since all scopes reprocess the same way",
      b: "The scope cannot be used until it has been fully inspected, properly reprocessed per its specific IFU, and documented. Request the IFU from the manufacturer. If the IFU is unavailable, the scope cannot be reprocessed safely at your facility and cannot be used",
      c: "Accept the scope if the physician signs a waiver accepting responsibility for any infection issues",
      d: "Run a quick visual inspection — if it looks clean, it's acceptable for use",
    },
    correct: "b",
    explanation: "Every endoscope entering your facility's reprocessing system must be reprocessed according to its device-specific IFU. 'Cleaned at my office' is not a documented, verified reprocessing event. Without the IFU, you cannot confirm the correct chemicals, methods, or verification steps for that scope. Facility liability, patient safety, and regulatory compliance all require full reprocessing with proper documentation. This is also a CHL scenario — leaders protect the department by establishing and enforcing clear scope intake policies.",
    realWorldNote: "Physician-owned scopes brought into facilities are a real and documented infection risk vector. Several HAI investigations have traced outbreaks to privately owned equipment that bypassed facility reprocessing standards.",
    tags: ["physician-owned scope", "IFU", "scope intake policy", "liability", "CHL leadership", "loaned scope protocol"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STERILIZATION — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-steril-001",
    type: "regulatory",
    domain: "Sterilization",
    difficulty: "advanced",
    context: "A load comes out of the steam sterilizer and the biological indicator (BI) reading is taken. 48 hours later, the BI result comes back POSITIVE (growth detected). The load has already been distributed to the OR and several items have been used in patient procedures.",
    question: "What is the correct sequence of actions?",
    options: {
      a: "Recall the unused items from the load, reprocess them, and document. No need to notify anyone about the used items",
      b: "Quarantine any remaining unprocessed items from the load, immediately notify your supervisor and infection prevention, initiate a recall of all items from that load (used and unused), document everything, identify all patients who received care with items from that load, and do not release any other loads processed after the failed load until the sterilizer has been inspected and qualified",
      c: "Re-run the BI test — the first result may have been a false positive. Release the remaining items once the re-test passes",
      d: "The items were already used so there is nothing to be done — document the positive BI and move on",
    },
    correct: "b",
    explanation: "A positive biological indicator is a sterilization failure. The full response protocol: (1) Quarantine all items from the failed load that have not been used. (2) Notify supervisor and infection prevention immediately. (3) Initiate a recall of ALL items from that load — used and unused. (4) Work with infection prevention to identify all patients who received care with items from that load for HAI surveillance. (5) Place the sterilizer out of service. (6) Investigate the cause (loading error, cycle failure, BI handling error). (7) Document every step. Do not release any subsequent loads until the sterilizer is qualified.",
    realWorldNote: "A positive BI is one of the highest-stakes events in sterile processing. The response must be immediate and thorough. False positives do occur, but you must assume a true failure and act accordingly until the investigation proves otherwise.",
    standardRef: "AAMI ST79 — biological indicator monitoring; positive BI response protocol; AORN Guidelines",
    tags: ["positive BI", "sterilization failure", "recall", "infection prevention", "patient notification", "sterilizer quarantine", "CHL response"],
  },

  {
    id: "scen-steril-002",
    type: "scenario",
    domain: "Sterilization",
    difficulty: "intermediate",
    context: "A surgeon requests Immediate Use Steam Sterilization (IUSS) of an arthroscope because the case is starting in 15 minutes and the scheduled scope was dropped. You check the IFU and cannot find authorization for IUSS for this specific scope model.",
    question: "What is the correct response?",
    options: {
      a: "Run the IUSS cycle anyway — the surgeon needs it and steam sterilization works on all metal instruments",
      b: "IUSS cannot be performed without manufacturer authorization in the IFU. Inform the surgeon and OR charge nurse that this scope is not approved for IUSS, explore alternatives (loaner scope, postpone case), and document the request and your response",
      c: "Run a quick gravity cycle — it's shorter than a pre-vacuum cycle and will save time",
      d: "Ask the surgeon to sign off on the IUSS — their authorization supersedes the IFU",
    },
    correct: "b",
    explanation: "IUSS can only be performed on devices that are explicitly authorized for it in their IFU. Authorization for standard steam sterilization does not automatically include IUSS — they are different cycle parameters. Running unauthorized IUSS can damage the device and, more critically, does not guarantee sterility for that specific device's design. The tech's role is to communicate this clearly and professionally — not to override the IFU under time pressure. Document the interaction. This is a professional boundary that protects patients and protects you.",
    realWorldNote: "IUSS is one of the most misused practices in perioperative care. 'We always do it this way' is not IFU compliance. Regulatory bodies have increasingly scrutinized IUSS use, and facilities have received citations for IUSS on non-authorized devices.",
    standardRef: "AAMI ST79 — IUSS requirements; Joint Commission IUSS standards",
    tags: ["IUSS", "IFU authorization", "arthroscope", "surgeon pressure", "steam sterilization", "professional boundary"],
  },

  {
    id: "scen-steril-003",
    type: "decision",
    domain: "Sterilization",
    difficulty: "intermediate",
    context: "You load a pre-vacuum steam sterilizer and start the cycle. The cycle aborts midway with an error indicating a loss of vacuum. The load contains a mix of general instruments and one orthopedic implant set.",
    question: "What is the correct course of action for the load?",
    options: {
      a: "Release the non-implant items since the sterilizer likely got most of the way through the cycle, and re-run the implant set only",
      b: "The entire load must be considered non-sterile. All items must be reprocessed. The implant set requires a new biological indicator cycle with a passing result before release. Do not release any items from the aborted cycle. Document the cycle failure and the sterilizer error",
      c: "Run the cycle again and if it passes, release the load — the second successful cycle compensates for the failed first one",
      d: "Release the general instruments — they don't require the same level of sterility assurance as implants",
    },
    correct: "b",
    explanation: "An aborted cycle means the load is non-sterile — all items must be reprocessed. There is no partial credit in sterilization. The cycle either completes and meets all parameters or it does not. For the implant set: under AAMI ST79, implants require a biological indicator with every cycle and results must be reviewed before release (no early release without passing BI). The aborted cycle means starting from the beginning for everything — clean, package, and re-sterilize with a new BI for implants. Document the aborted cycle and the error code.",
    realWorldNote: "Releasing general instruments from an aborted cycle 'because it got most of the way through' is a documented source of SSIs. Sterility is not a spectrum — a load is sterile or it isn't.",
    standardRef: "AAMI ST79 — implant BI requirements; aborted cycle protocols",
    tags: ["aborted cycle", "implant", "biological indicator", "early release", "pre-vacuum sterilizer", "vacuum loss"],
  },

  {
    id: "scen-steril-004",
    type: "scenario",
    domain: "Sterilization",
    difficulty: "foundational",
    context: "A supervisor asks you to skip the Bowie Dick test today because the department is behind and 'it always passes anyway.'",
    question: "What should you do?",
    options: {
      a: "Skip the test — the supervisor's authority overrides the testing requirement",
      b: "Skip it this once but document the supervisor's request",
      c: "Perform the Bowie Dick test as required. It is a daily regulatory and manufacturer requirement for pre-vacuum steam sterilizers. 'It always passes' is not evidence that it will pass today, and a failed test that went undetected could mean non-sterile loads were released",
      d: "Suggest running two Bowie Dick tests tomorrow to make up for skipping today",
    },
    correct: "c",
    explanation: "The Bowie Dick test must be performed daily on pre-vacuum (dynamic air removal) steam sterilizers — this is both a manufacturer IFU requirement and supported by AAMI ST79 and AORN standards. Its purpose is to detect air removal failures that would compromise sterilization. 'It always passes' means nothing on the day it doesn't. A failed test that was never run means potentially non-sterile loads were released. The test takes minutes and protects patients. If pressured to skip required testing, document the interaction. This is also a CHL integrity scenario.",
    realWorldNote: "Bowie Dick test skipping is cited in regulatory inspections. Joint Commission surveyors ask to see Bowie Dick test logs — gaps in the log indicate compliance failures.",
    standardRef: "AAMI ST79 — daily Bowie Dick test requirement; Joint Commission standards",
    tags: ["Bowie Dick", "pre-vacuum sterilizer", "daily testing", "supervisor pressure", "compliance", "CHL integrity"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INSTRUMENT HANDLING & INSPECTION — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-instr-001",
    type: "scenario",
    domain: "Instrument Handling & Inspection",
    difficulty: "foundational",
    context: "You are inspecting a Mayo scissors after cleaning. You notice a small crack at the screw box and the blades have visible pitting. The instrument still opens and closes.",
    question: "What should you do?",
    options: {
      a: "Return the instrument to service — it still functions and minor cosmetic damage is acceptable",
      b: "Remove the instrument from service. The crack at the screw box is a structural failure that affects sterilization efficacy and can harbor microorganisms. Pitting indicates corrosion and bioburden trapping. Tag the instrument, document the defects, and send for repair or replacement",
      c: "Use the instrument for one more case and then remove it",
      d: "Apply instrument lubricant to the crack and return it to service",
    },
    correct: "b",
    explanation: "Cracks and pitting are not cosmetic issues — they are patient safety failures. A crack at the screw box: (1) creates a crevice that harbors microorganisms that cannot be reliably reached by sterilants, (2) represents structural compromise that can lead to failure during a procedure, and (3) traps organic soil that resists cleaning. Pitting indicates corrosion with microscopic channels that harbor and protect microorganisms from disinfection and sterilization. Remove immediately, tag, and document. An instrument that 'still works' is not the same as one that is safe for patient use.",
    realWorldNote: "CIS exam content focuses heavily on instrument inspection criteria. In practice, instruments with these defects are a direct patient safety issue — a cracked instrument that breaks during surgery requires additional procedure time and anesthesia. Corrosion products can also be toxic to tissue.",
    tags: ["instrument inspection", "Mayo scissors", "pitting", "crack", "removal from service", "CIS content"],
  },

  {
    id: "scen-instr-002",
    type: "decision",
    domain: "Instrument Handling & Inspection",
    difficulty: "intermediate",
    context: "A tray comes back from the OR with a note: 'instrument hit the floor during the case, wiped off, and used anyway.' The surgeon wants it back in the next tray for a case tomorrow.",
    question: "How do you handle this instrument?",
    options: {
      a: "Process it normally — it was wiped off and used, so it's already been through the case",
      b: "The instrument must complete the full decontamination and reprocessing cycle before being included in any tray. Additionally, document the incident and notify your supervisor — floor contamination followed by continued use is a sterility breach that may need to be reviewed by infection prevention",
      c: "Soak it in disinfectant overnight and add it to tomorrow's tray",
      d: "Return it to the OR to ask the surgeon if it seemed to cause any problems",
    },
    correct: "b",
    explanation: "Floor contact followed by reuse without reprocessing is a sterility and infection prevention breach. The instrument requires full decontamination and reprocessing regardless of what happened after the floor contact. Beyond the processing issue: this is an incident that should be documented and reported. Infection prevention may need to assess whether the patient is at increased infection risk. The fact that 'it was wiped off' does not restore sterility — wiping with an OR towel is not a recognized sterilization method.",
    realWorldNote: "Floor contamination events in the OR are supposed to be reported and managed in real time. When they aren't — and the instrument is returned to use — the sterilization department often discovers the breach only when the tray returns.",
    tags: ["floor contamination", "OR breach", "incident documentation", "infection prevention", "reprocessing requirement"],
  },

  {
    id: "scen-instr-003",
    type: "pitfall",
    domain: "Instrument Handling & Inspection",
    difficulty: "intermediate",
    context: "A tech routinely leaves ratcheted instruments locked closed when packaging them for sterilization because 'it keeps the tray neat and the instruments from moving around.'",
    question: "What is the problem with this practice?",
    options: {
      a: "No problem — locked instruments are easier to count and keep organized",
      b: "Locked ratchets hold tension on the metal joints, preventing proper steam penetration into the box lock area and preventing the instrument from fully opening during sterilization — both compromise sterilization efficacy. All ratcheted instruments must be packaged and sterilized in the open or unlocked position",
      c: "The only concern is that locked instruments take longer to sterilize — double the exposure time",
      d: "Locking instruments is fine as long as the sets are loaded vertically",
    },
    correct: "b",
    explanation: "Instruments must be sterilized in the open or unlocked position for two reasons: (1) a locked ratchet creates metal-on-metal contact at the box lock area that steam or sterilant cannot penetrate — creating a non-sterile zone on the instrument, and (2) spring tension in a locked ratchet can cause the instrument to snap shut with force during sterilization, potentially damaging the instrument or other items in the tray. This is basic instrument packaging principle — it's on CRCST and CIS content outlines and inspectors look for it.",
    tags: ["ratcheted instruments", "locked position", "packaging", "steam penetration", "box lock", "CIS content", "CRCST content"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PPE & SAFETY — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-ppe-001",
    type: "scenario",
    domain: "PPE & Worker Safety",
    difficulty: "foundational",
    context: "A tech comes to you frustrated: 'These heavy gloves make it impossible to feel what I'm doing when I'm brushing the endoscope channels. I work better with regular exam gloves.'",
    question: "How do you respond and what is the appropriate practice?",
    options: {
      a: "Agree — fine motor tasks are better done with thin gloves, and regular exam gloves provide adequate protection",
      b: "The PPE requirements for the decontamination area are set by OSHA's Bloodborne Pathogen Standard, not by personal preference. Heavy-duty, puncture-resistant gloves are required. Technique improves with practice. The tech should not modify their PPE based on comfort — the risk of exposure to bloodborne pathogens is real and can result from a single needle stick or splash",
      c: "Compromise — use heavy gloves for transport but switch to exam gloves for cleaning",
      d: "Allow the tech to use whatever gloves they prefer as long as they're being careful",
    },
    correct: "b",
    explanation: "PPE requirements for the decontamination area are regulatory requirements under OSHA's Bloodborne Pathogen Standard — not suggestions. Heavy-duty, puncture-resistant gloves protect against sharps embedded in instrument sets and brush-tip punctures. Substituting exam gloves because of tactile preference is a compliance violation and creates genuine injury risk. New techs frequently find thick gloves awkward at first — technique does improve with practice. Supervisors must enforce PPE standards consistently.",
    realWorldNote: "Hands and forearms are the most common sites of workplace injury in sterile processing. A single sharps puncture in the decontamination area requires an incident report, post-exposure evaluation, and potentially prophylactic treatment.",
    standardRef: "OSHA Bloodborne Pathogen Standard — 29 CFR 1910.1030",
    tags: ["PPE", "decontamination area", "gloves", "OSHA", "Bloodborne Pathogen Standard", "sharps injury"],
  },

  {
    id: "scen-ppe-002",
    type: "scenario",
    domain: "PPE & Worker Safety",
    difficulty: "intermediate",
    context: "During manual HLD, you accidentally splash glutaraldehyde solution into your eyes. You feel burning and irritation immediately.",
    question: "What is the correct immediate response?",
    options: {
      a: "Rinse your eyes with the nearest available water source for a few seconds and continue working",
      b: "Immediately go to the eyewash station (within 10 seconds), flush both eyes continuously for a minimum of 15 minutes, notify your supervisor, and seek medical evaluation — even if symptoms seem mild",
      c: "Apply eye drops from the first aid kit and monitor for worsening symptoms",
      d: "Finish the HLD task first since the scope is in mid-cycle, then address the eye exposure",
    },
    correct: "b",
    explanation: "Chemical eye exposure is a medical emergency. The correct response is immediate, uninterrupted 15-minute eye flushing at the eyewash station — the 15-minute requirement exists because shorter rinses do not adequately dilute or remove chemical agents from ocular tissue. Notify your supervisor immediately. Seek medical evaluation — glutaraldehyde is a potent irritant and sensitizer that can cause lasting damage if not properly treated. Never delay treatment for work tasks. Document the incident.",
    realWorldNote: "Glutaraldehyde sensitization is a recognized occupational hazard in endoscopy units. Repeated exposures can cause increasingly severe reactions including asthma-like symptoms. Each exposure must be taken seriously and documented.",
    standardRef: "OSHA — eyewash station requirements; ANSI Z358.1",
    tags: ["chemical splash", "glutaraldehyde", "eye exposure", "eyewash station", "15 minutes", "occupational hazard", "incident report"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // QUALITY SYSTEMS & DOCUMENTATION — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-qual-001",
    type: "judgment",
    domain: "Quality & Documentation",
    difficulty: "advanced",
    context: "You are a CHL reviewing your department's documentation log. You notice that a coworker has been backdating load records — filling in Bowie Dick test results and load logs for days the sterilizer was actually down for maintenance. When you ask about it, the coworker says 'I was just filling in the gaps so we wouldn't get cited.'",
    question: "What is the correct response as a healthcare leader?",
    options: {
      a: "Let it go — the sterilizer works fine now and the documentation gaps would have caused more problems than the backdating",
      b: "Speak to the coworker privately and ask them not to do it again",
      c: "This is falsification of medical records — a serious ethical and regulatory violation. You must report this to your department director and compliance officer immediately. The falsified records must be corrected with accurate information and an explanation. The patients who received care during the undocumented period may need to be assessed for risk",
      d: "Continue the backdating practice for now and raise it at the next department meeting",
    },
    correct: "c",
    explanation: "Falsification of sterilization records is not a minor paperwork issue — it is falsification of medical records, which is both a regulatory violation and potentially a patient safety issue. If loads were processed during the maintenance period using an unqualified sterilizer, patients may have received non-sterile instruments. A CHL's ethical and professional responsibility is to report this immediately and ensure accurate records are restored. 'Filling in gaps' to avoid citations is the definition of falsification. The leader who discovers and conceals falsification is as liable as the person who committed it.",
    realWorldNote: "Documentation falsification has been found at multiple healthcare facilities during CMS and Joint Commission surveys. The consequences — including loss of accreditation, CMS sanctions, and individual professional liability — are far greater than the original compliance gap would have been.",
    standardRef: "CMS Conditions of Participation; Joint Commission Record-Keeping Standards; AAMI ST79 documentation requirements",
    tags: ["documentation falsification", "Bowie Dick test", "CHL ethics", "compliance", "record keeping", "patient safety notification", "CMS"],
  },

  {
    id: "scen-qual-002",
    type: "regulatory",
    domain: "Quality & Documentation",
    difficulty: "intermediate",
    context: "A CMS surveyor visits your endoscopy unit. They specifically ask to see documentation of your duodenoscope reprocessing records, including MEC test results, AER cycle documentation, and evidence of staff competency for enhanced reprocessing.",
    question: "This scenario illustrates which regulatory reality that every SPD tech and CHL should understand?",
    options: {
      a: "CMS only cares about surgical instruments — endoscope reprocessing documentation is not a survey focus",
      b: "CMS surveyors are specifically required to ask about duodenoscope reprocessing due to documented national infection outbreaks. Facilities must maintain complete, accessible documentation of every HLD cycle including staff competency records. Inability to produce these records can result in deficiency citations",
      c: "Surveyor requests for documentation are only relevant if your facility has had an infection outbreak",
      d: "Only the medical director needs to respond to surveyor questions about reprocessing",
    },
    correct: "b",
    explanation: "Following multiple national HAI outbreaks linked to inadequately reprocessed duodenoscopes, CMS added specific duodenoscope reprocessing requirements to their survey process. Surveyors are specifically trained to ask about: IFU compliance, MEC testing records, AER cycle documentation, enhanced reprocessing protocols, and staff competency verification. Every endoscopy unit must be able to produce this documentation on demand. This is not optional and is not limited to facilities with prior outbreaks.",
    realWorldNote: "Facilities have received Condition-level deficiencies (the most serious CMS citation category) for inadequate duodenoscope reprocessing documentation. These citations can threaten Medicare/Medicaid participation.",
    standardRef: "CMS — Survey and Certification; CDC Essential Elements; FDA Duodenoscope Safety Communication",
    tags: ["CMS survey", "duodenoscope", "documentation", "competency records", "AER documentation", "deficiency citation"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CRITICAL THINKING — CLINICAL REASONING CHAINS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-think-001",
    type: "decision",
    domain: "Critical Thinking",
    difficulty: "advanced",
    context: "Three patients who underwent colonoscopy in your unit over the past two weeks have developed post-procedure infections with the same organism. Infection prevention notifies your department and asks you to review your processes.",
    question: "As the lead tech, what is your systematic approach to identifying the source?",
    options: {
      a: "Assume the infections are coincidental and wait for more cases to confirm a pattern",
      b: "Systematically review: the reprocessing records for all scopes used in those cases (MEC tests, soak times, rinse steps), staff competency and who performed the reprocessing, AER performance logs, water quality reports, drying practices, storage conditions, and whether any protocol deviations occurred. Cooperate fully with infection prevention. Remove suspect scopes from service pending investigation",
      c: "Switch to a different disinfectant immediately to address the problem",
      d: "Restrict the investigation to equipment only — staff practices are HR's responsibility",
    },
    correct: "b",
    explanation: "A cluster of post-procedure infections is a potential HAI outbreak requiring systematic investigation across every variable in the reprocessing chain. Common outbreak sources include: MEC test failures that went undetected, inadequate soak time, inadequate rinsing, contaminated water supply, AER malfunction, improper drying, inadequate storage, or compromised staff practices. No single variable should be excluded. Remove suspect equipment from service during investigation. Every finding must be documented. Cooperating fully with infection prevention is both a professional obligation and, in most states, legally required.",
    realWorldNote: "Most HAI outbreaks linked to endoscope reprocessing involve process failures that were present long before the cluster emerged. Investigations often reveal shortcuts that had become normalized over time.",
    tags: ["HAI outbreak", "infection cluster", "root cause analysis", "colonoscope", "reprocessing investigation", "AER", "CHL response"],
  },

  {
    id: "scen-think-002",
    type: "sequence",
    domain: "Critical Thinking",
    difficulty: "intermediate",
    context: "A new tech describes their process for returning a scope to service after HLD: 'I drain it, put the valves back on, coil it in the cabinet, and hang a date tag.'",
    question: "What critical steps are missing from this sequence?",
    options: {
      a: "Nothing is missing — that sequence covers the essential steps after HLD",
      b: "The tech skipped: (1) purging all channels with forced air to remove moisture, (2) an alcohol flush of all channels per IFU, (3) visual inspection of the scope after drying, and (4) valves should NOT be replaced — scopes should be stored with valves removed to allow air circulation and prevent moisture trapping",
      c: "They only need to add a second MEC test after HLD is complete",
      d: "The only missing step is running the scope through a second AER cycle to verify dryness",
    },
    correct: "b",
    explanation: "The post-HLD sequence before storage must include: (1) purge all channels with forced air — this removes the bulk of liquid from internal channels, (2) flush all channels with 70% alcohol per IFU — alcohol displaces remaining water and evaporates rapidly, dramatically reducing residual moisture, (3) visual inspection of the scope and channels, (4) store with valves REMOVED — replacing valves before storage traps moisture and impedes air circulation in channels. Storing a moist scope leads to microbial growth during hang time. These steps are consistently tested on CRCST and CER exams and consistently skipped in practice.",
    standardRef: "AAMI ST91 — post-HLD drying and storage; SGNA Guidelines",
    tags: ["post-HLD sequence", "alcohol flush", "forced air purge", "valve removal", "storage", "CER content"],
  },

  {
    id: "scen-think-003",
    type: "judgment",
    domain: "Critical Thinking",
    difficulty: "foundational",
    context: "You are training a new technician. They ask you: 'Does it really matter if I wear all the PPE? The scopes look clean by the time I handle them and I've never gotten sick.'",
    question: "How do you explain the rationale for PPE compliance to reinforce the right mindset?",
    options: {
      a: "Tell them the PPE is really just for show during surveys — experienced techs use their judgment",
      b: "Explain that contamination is invisible. Scopes that look clean can carry hepatitis B, hepatitis C, HIV, C. diff spores, and other pathogens undetectable by appearance. PPE protects against exposure you cannot see or predict. 'Never gotten sick' is survivor bias — the protection has been working. Every exposure that didn't happen is because of PPE, not in spite of skipping it",
      c: "Tell them to just follow the rules without explanation",
      d: "Agree that experienced techs can use their own judgment on PPE",
    },
    correct: "b",
    explanation: "This answer is about cultivating the right professional mindset, not just rule compliance. The most important concept is that absence of visible contamination does not mean absence of infectious material. Bloodborne pathogens and spore-forming organisms are not detectable by sight. 'I've never gotten sick' is not evidence that PPE is unnecessary — it is evidence that PPE is working. Every tech who has never had a needle stick or bloodborne pathogen exposure has benefited from engineering controls and PPE. Building this mindset in new techs is the difference between a culture of compliance and a culture of safety.",
    realWorldNote: "Complacency about PPE is one of the leading predictors of occupational exposure events in sterile processing departments. It tends to develop in proportion to time on the job — the longer someone works without incident, the less urgency they feel.",
    tags: ["PPE rationale", "invisible contamination", "bloodborne pathogens", "new tech training", "safety culture", "complacency"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADERSHIP & DEPARTMENT MANAGEMENT (CHL-FOCUSED)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-chl-001",
    type: "judgment",
    domain: "Leadership & Department Management",
    difficulty: "advanced",
    context: "You are the SPD manager. A surgeon emails you directly, bypassing the charge nurse, demanding that IUSS be performed on a complex laparoscopic instrument set 'routinely' because it saves time. They have done this at other hospitals and it was never a problem.",
    question: "How do you respond as a healthcare leader?",
    options: {
      a: "Accommodate the surgeon's request — keeping surgeons satisfied is important for OR-SPD relationships",
      b: "Respond professionally but firmly: IUSS is reserved for urgent, unplanned situations where there is no alternative — not for convenience or time-saving. Routine IUSS is not compliant with AAMI ST79 or Joint Commission standards. Offer to work with OR scheduling to ensure adequate instrument sets and turnaround time are available to eliminate the need for IUSS",
      c: "Ask the charge nurse to handle the response so you don't have the conflict",
      d: "Allow IUSS for this surgeon specifically as long as it's documented",
    },
    correct: "b",
    explanation: "IUSS is defined as sterilization for immediate use in an unplanned, urgent situation — not a routine workflow shortcut. Routine IUSS is a Joint Commission citation risk and an AAMI ST79 violation. As a CHL, your role is to protect patient safety, protect your department's compliance standing, and work collaboratively with the OR to solve the underlying problem (insufficient instrument sets or unrealistic turnaround expectations) without compromising standards. Responding professionally and offering a solution demonstrates the leadership competency tested by the CHL exam.",
    standardRef: "AAMI ST79 — IUSS definition and appropriate use; Joint Commission standards",
    tags: ["IUSS", "CHL leadership", "surgeon relationship", "compliance", "Joint Commission", "routine vs. emergency IUSS"],
  },

  {
    id: "scen-chl-002",
    type: "scenario",
    domain: "Leadership & Department Management",
    difficulty: "advanced",
    context: "During a monthly audit of your department, you discover that three different technicians have been using the same AER connector for two different scope models 'because the other connector got lost.' The practice has been going on for three weeks.",
    question: "As a manager, what actions do you take?",
    options: {
      a: "Reprimand the three techs and tell them not to do it again",
      b: "Immediately remove the mismatched connector from use and replace it with the correct connectors. Conduct a scope-specific review: for the scopes processed with the incorrect connector over the past three weeks, assess whether channels were adequately flushed (if not, those scopes may need re-reprocessing). Identify all patients whose procedures used potentially inadequately reprocessed scopes and notify infection prevention. Conduct a root cause analysis on how a connector was lost and went unreported for three weeks. Implement a daily connector inventory check",
      c: "Order the correct connector and switch to it once it arrives — the existing practice is low risk",
      d: "Document the incident and submit it to the quality department for future review",
    },
    correct: "b",
    explanation: "AER connectors are device-specific — they are designed to properly connect to specific endoscope ports to ensure all channels are flushed with disinfectant. Using an incorrect connector means some or all channels may not have been adequately contacted with the HLD solution for three weeks. This is a potential patient safety event requiring: immediate correction, scope reprocessing review, infection prevention notification, and patient risk assessment for procedures performed with those scopes. The root cause (lost connector not reported) needs to be addressed systemically — this is the quality improvement and leadership component.",
    realWorldNote: "Lost equipment that goes unreported is a systemic problem in many SPD departments. Creating a culture where staff report missing or damaged equipment without fear of punishment is a leadership challenge that directly impacts patient safety.",
    tags: ["AER connector", "CHL management", "scope-specific connector", "patient safety event", "root cause analysis", "infection prevention notification", "audit"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE & TRANSPORT — SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "scen-stor-001",
    type: "scenario",
    domain: "Storage & Transport",
    difficulty: "foundational",
    context: "You are checking the sterile storage area and notice that several instrument sets packaged in peel pouches are stored with the plastic side facing up (resting on the paper side). Some have been there for two weeks.",
    question: "Is there a concern here and what is the correct storage orientation?",
    options: {
      a: "No concern — peel pouches can be stored in any orientation",
      b: "Peel pouches should be stored plastic side down to protect the paper side (the breathing side) from damage and to prevent condensation pooling on the seal. Check all pouches for integrity issues. Any with compromised seals must be reprocessed",
      c: "The only concern is the two-week storage time — discard anything over one week",
      d: "Peel pouches should always be stored vertically in baskets, not lying flat in any orientation",
    },
    correct: "b",
    explanation: "Peel pouches should be stored with the plastic side down and paper side up — this protects the paper (which is the permeable side that allows sterilant penetration and air exchange) from surface damage. Storing plastic-side up can allow condensation to pool on the paper surface, potentially compromising the paper's integrity and the package seal. Additionally, inspect all pouches for any seal lifting, punctures, or moisture damage. Event-related sterility means packaging integrity determines sterility — not just time.",
    tags: ["peel pouch", "sterile storage", "package orientation", "event-related sterility", "package integrity"],
  },

  {
    id: "scen-stor-002",
    type: "decision",
    domain: "Storage & Transport",
    difficulty: "intermediate",
    context: "You receive a sterilized instrument tray from an outside vendor (loaner set). The packaging is intact, it has a passing chemical indicator, and the vendor says it was sterilized yesterday. The OR wants it for a case in two hours.",
    question: "What should you do before releasing this tray to the OR?",
    options: {
      a: "Release it immediately — the vendor is certified, the packaging is intact, and the CI passed",
      b: "Do not release the tray to the OR. All loaned instrument sets arriving from outside the facility must be inspected, tested, and reprocessed at your facility before use — regardless of vendor assurances. You cannot verify the vendor's sterilization process, and the tray must go through your own verified reprocessing cycle",
      c: "Accept the vendor's documentation and release it to the OR — verify their last inspection date instead",
      d: "Run it through a quick IUSS cycle to be safe, then release it",
    },
    correct: "b",
    explanation: "All loaned instrument sets arriving from outside your facility must be reprocessed by your facility before use. You cannot verify: the actual sterilization parameters, load configuration, biological indicator results, packaging integrity during transport, or storage conditions at the vendor. A passing chemical indicator only shows the set was exposed to a sterilization process — not that sterilization was achieved. This is standard practice per AAMI ST79 and is tested on CRCST, CIS, and CHL exams. The OR must be informed that the two-hour timeline is not achievable.",
    standardRef: "AAMI ST79 — loaner instrument processing requirements",
    tags: ["loaner set", "vendor sterilization", "reprocessing requirement", "chemical indicator", "transport integrity", "CIS content"],
  },

];

// ─── UTILITY EXPORTS ──────────────────────────────────────────────────────────

export const scenarioQuestionCount = scenarioQuestions.length;

export const scenariosByDomain = scenarioQuestions.reduce((acc, q) => {
  acc[q.domain] = acc[q.domain] || [];
  acc[q.domain].push(q);
  return acc;
}, {} as Record<string, ScenarioQuestion[]>);

export const scenariosByDifficulty = scenarioQuestions.reduce((acc, q) => {
  acc[q.difficulty] = acc[q.difficulty] || [];
  acc[q.difficulty].push(q);
  return acc;
}, {} as Record<string, ScenarioQuestion[]>);

export const scenariosByType = scenarioQuestions.reduce((acc, q) => {
  acc[q.type] = acc[q.type] || [];
  acc[q.type].push(q);
  return acc;
}, {} as Record<string, ScenarioQuestion[]>);

// Domains covered
export const SCENARIO_DOMAINS = [
  "Decontamination & Cleaning",
  "Leak Testing",
  "High-Level Disinfection",
  "Sterilization",
  "Instrument Handling & Inspection",
  "PPE & Worker Safety",
  "Quality & Documentation",
  "Critical Thinking",
  "Leadership & Department Management",
  "Storage & Transport",
] as const;

export default scenarioQuestions;
