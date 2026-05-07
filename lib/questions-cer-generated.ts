// Additional CER (Certified Endoscope Reprocessor) practice questions —
// supplemental to the curated chapter bank in questions-cer.ts.
// Each chapter targets ~10 new items covering sub-topics, scenarios, and edge
// cases not addressed by the base chapter set.

import type { CERQuestion } from "./questions-cer";

export const cerGeneratedQuestions: CERQuestion[] = [

  // ═══════════════════════════════════════════════════════════════
  // CHAPTER 1: Introduction to Endoscopes — supplemental
  // ═══════════════════════════════════════════════════════════════

  {
    id: "cer-ch1-gen-1",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Which professional organization issues the CER (Certified Endoscope Reprocessor) credential?",
    options: { a: "AORN", b: "HSPA", c: "APIC", d: "AAMI" },
    correct: "b",
    explanation: "HSPA (Healthcare Sterile Processing Association, formerly IAHCSMM) issues the CER credential. AAMI publishes consensus standards such as ST91, AORN focuses on perioperative nursing, and APIC focuses on infection prevention.",
    difficulty: "easy",
  },
  {
    id: "cer-ch1-gen-2",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Which step is the FIRST step in flexible endoscope reprocessing after a clinical procedure ends?",
    options: { a: "Manual cleaning at the reprocessing sink", b: "Pre-cleaning (bedside / point-of-use cleaning) immediately after the procedure", c: "Leak testing", d: "High-level disinfection in the AER" },
    correct: "b",
    explanation: "Pre-cleaning at the point of use — wiping the insertion tube and flushing channels with detergent solution before the scope leaves the procedure room — is the first reprocessing step. Allowing organic soil to dry inside lumens makes complete removal extremely difficult and promotes biofilm formation that downstream steps cannot reliably reverse.",
    difficulty: "easy",
  },
  {
    id: "cer-ch1-gen-3",
    type: "true_false",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Under the Spaulding classification, most flexible endoscopes are considered semi-critical devices because they contact intact mucous membranes, requiring at minimum high-level disinfection between patients.",
    options: { a: "True", b: "False" },
    correct: "a",
    explanation: "True. Spaulding classifies devices as critical (sterilization required), semi-critical (HLD or sterilization), or non-critical (low-level disinfection). Flexible endoscopes that contact mucous membranes are semi-critical. Endoscopes that breach mucosa or enter sterile body sites are elevated to critical and require sterilization.",
    difficulty: "easy",
  },
  {
    id: "cer-ch1-gen-4",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "An endoscope reprocessing technician is asked to skip forced-air channel drying after HLD because the GI department is running behind schedule. What is the correct response?",
    options: {
      a: "Skip drying only for scopes that will be reused within the same shift",
      b: "Comply with the request — drying is a recommendation, not a requirement",
      c: "Follow the manufacturer's IFU and current professional standards, which require validated drying. Residual moisture in lumens supports rapid microbial growth and is a known cause of contamination at next use",
      d: "Wipe the insertion tube with alcohol and skip the channel drying step",
    },
    correct: "c",
    explanation: "Validated forced-air drying through every lumen is required after HLD per AAMI ST91, SGNA guidelines, and modern scope IFUs (typically a minimum of ~10 minutes). Standing moisture in channels is one of the most well-documented causes of post-reprocessing contamination. Production pressure does not modify reprocessing requirements.",
    difficulty: "medium",
  },
  {
    id: "cer-ch1-gen-5",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Which of the following best explains why biofilm in an endoscope channel is so difficult to address once formed?",
    options: {
      a: "Biofilm is visible to the naked eye and easy to brush away",
      b: "Biofilm only forms in single-use scopes",
      c: "Standard manual cleaning eliminates biofilm within seconds",
      d: "Microorganisms in biofilm produce a self-organized extracellular matrix that resists detergents, disinfectants, and some sterilants",
    },
    correct: "d",
    explanation: "Biofilm is a community of microorganisms embedded in a self-produced polymeric matrix that adheres to surfaces and resists chemical attack. Mature biofilm in a lumen can be effectively impossible to remove — which is why the strategy is prevention: prompt point-of-use cleaning, never letting soil dry inside the channel.",
    difficulty: "medium",
  },
  {
    id: "cer-ch1-gen-6",
    type: "true_false",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Time pressure to turn over scopes quickly does not compromise reprocessing because every step's duration is fixed by the IFU.",
    options: { a: "True", b: "False" },
    correct: "b",
    explanation: "False. Time pressure is a documented patient-safety hazard. Shortening or omitting point-of-use cleaning, brushing, or drying — all common shortcuts under turnover pressure — is a recognized contributor to scope-associated infection outbreaks. The reprocessing standard does not change because the schedule is tight.",
    difficulty: "medium",
  },
  {
    id: "cer-ch1-gen-7",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "A technician is asked to reprocess a flexible endoscope model they have never handled before. What is the most appropriate first action?",
    options: {
      a: "Treat it like the most similar scope they know",
      b: "Use the longest available cycle on the AER",
      c: "Refuse to process the scope under any circumstances",
      d: "Locate the manufacturer's IFU specific to that exact scope model and follow it, including channel-flushing requirements, brush sizes, leak-test setup, and AER connector kit",
    },
    correct: "d",
    explanation: "Each scope model has a unique IFU specifying which channels exist, brush sizes, leak-test connectors, and AER connector kit. Treating a duodenoscope (with its elevator mechanism) like a gastroscope, for example, would miss a critical reprocessing step. The model-specific IFU is the authoritative source — never improvise by analogy.",
    difficulty: "medium",
  },
  {
    id: "cer-ch1-gen-8",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "Which of the following is NOT part of an endoscope reprocessing technician's professional role?",
    options: {
      a: "Documenting reprocessing parameters, lot numbers, and the technician performing each step",
      b: "Inspecting scope channels and external surfaces between cases",
      c: "Reviewing histology and pathology results from biopsies taken during the procedure",
      d: "Verifying that point-of-use precleaning was performed before the scope arrives in the reprocessing area",
    },
    correct: "c",
    explanation: "Histology and pathology review is performed by physicians and pathologists, not reprocessing technicians. The technician's role covers the entire reprocessing workflow — point-of-use verification, leak testing, manual cleaning, HLD or sterilization, inspection, drying, storage, and traceability documentation.",
    difficulty: "medium",
  },
  {
    id: "cer-ch1-gen-9",
    type: "true_false",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "When the manufacturer's IFU and a current AAMI / professional standard conflict, the technician should always default to the IFU because it is more device-specific.",
    options: { a: "True", b: "False" },
    correct: "b",
    explanation: "False. When the IFU and a current standard conflict, the technician must follow the more stringent (safer) requirement, document the conflict, and escalate to the SPD/Endo manager and Infection Prevention. The manufacturer should be engaged to resolve the discrepancy. An IFU cannot override regulatory or patient-safety requirements.",
    difficulty: "hard",
  },
  {
    id: "cer-ch1-gen-10",
    type: "mcq",
    domain: "Endoscope Overview & Anatomy",
    chapter: 1,
    question: "A facility is launching a new endoscope reprocessing program. Which foundational element should be established FIRST?",
    options: {
      a: "Standardize on a single brand of enzymatic detergent",
      b: "Purchase the newest model AER on the market",
      c: "Buy additional spare scopes to reduce turnover pressure",
      d: "Establish competency-based training and validation for every technician on every scope model in use, plus complete traceability of each reprocessing event to scope, technician, and patient",
    },
    correct: "d",
    explanation: "Equipment investment without trained, competency-validated staff and traceability will not produce safe outcomes. AAMI ST91 requires per-model competency validation for personnel reprocessing endoscopes, and traceability is essential for recall and outbreak investigation. People and process must be in place before tooling is optimized.",
    difficulty: "hard",
  },

];
