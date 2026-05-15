# Nursing Section — Product & Technical Plan

> Written before any feature code. This is the source of truth for the nursing expansion.
> Last updated: 2026-05-15

---

## The Wedge

**Positioning:** "Train clinical judgment before you touch a real patient."

**Not:** Another NCLEX question bank.

**For:** Repeat NCLEX takers first. Not students in year one. Not nursing schools yet.

The repeat NCLEX taker has already tried Uworld, ATI, Hurst, Kaplan. They know content. They keep failing because they cannot reason under pressure. They pick the wrong answer not because they don't know the facts — they pick it because they panic, they anchor on the wrong cue, or they don't know how to prioritize. A question bank gives them more reps of the same failure pattern. This product breaks the pattern by teaching the reasoning process explicitly, through simulation and structured clinical judgment practice.

---

## Anchor User: Repeat NCLEX Taker

| Attribute | Detail |
|---|---|
| Who | BSN/ADN graduate, failed NCLEX-RN 1-3 times |
| Age | 22–35 |
| Pain | Already paid $1,000+ for prep courses that didn't work. Feels ashamed. Fears losing their nursing license eligibility. |
| What they believe | "I know the content. I just fail under pressure." (Often true.) |
| What they actually need | To understand the reasoning process, not more content drilling |
| Willingness to pay | HIGH. $29–59/month. They will pay anything that promises a different approach. |
| Where they are | Reddit r/NCLEX, TikTok, Facebook nursing groups, Discord servers |
| What they tell friends | "I finally understand why I was choosing wrong answers." |
| Red flag | If the app feels like another question bank, they leave immediately |

### Secondary Users (build later)
- **Pre-NCLEX nursing student** — needs NGN format exposure for the new exam
- **Nursing school (B2B)** — wants instructor dashboard + cohort analytics
- **New grad residency programs** — hospitals onboarding new nurses
- **Instructors** — want to assign cases and track clinical reasoning growth

---

## Architecture: Same Platform, Same Auth

The nursing section lives inside SPD Cert Prep at `/nursing/*`.

**Rationale:**
- Reuse Supabase auth, session management, access code system
- Reuse subscription/tier infrastructure (add nursing tiers later)
- Reuse XP/badge system
- No new infrastructure cost
- One codebase to maintain
- SPD Cert Prep becomes a healthcare education platform over time

**Routing structure:**
```
/nursing                        Hub page (public, marketing)
/nursing/simulator              AI patient simulator (auth required)
/nursing/cases                  NGN case study browser (auth required)
/nursing/cases/[id]             Individual case study (auth required)
/nursing/shift                  Shift Mode (Phase 3 — not built yet)
/nursing/dashboard              Student progress (Phase 3 — not built yet)
```

**What nursing shares with SPD:**
- Supabase auth + session
- Access code redemption system (same wholesale model)
- XP system (extend with nursing_xp or separate table)
- Badge system (add nursing-specific badges)
- NavBar (extend with nursing section link)
- Design system (navy background, same Tailwind tokens)

**What nursing gets that's different:**
- Rose accent color (#E02B4B) instead of teal — visual distinction from SPD
- New API route: `/api/nursing/simulate`
- New DB tables: `nursing_case_attempts`, `nursing_simulator_sessions`
- New lib: `lib/nursing-cases.ts`, `lib/nursing-config.ts`

---

## Content: Clinical Accuracy Standards

### Non-negotiables
1. **All vitals must be physiologically coherent.** No case where a patient has HR 140 with BP 180/110 without explanation.
2. **All correct answers must align with current evidence-based practice:** NANDA-I diagnoses, SBAR communication, QSEN competencies, AHA/ANA guidelines.
3. **Priority rationale must match NCLEX frameworks explicitly:** ABCs, Maslow, stable vs. unstable, acute vs. chronic, expected vs. unexpected outcomes.
4. **Every rationale explains the WHY, not just the what.** "Blood pressure 88/52 is hypotension because..." not just "This is septic shock."
5. **All clinical content reviewed by a licensed RN before any public release.** This is not optional. Content accuracy is a legal and ethical requirement.

### Content disclaimer (required on every page)
> "This platform is for educational and exam preparation purposes only. It does not substitute for clinical training, faculty instruction, or direct patient care experience. Always follow your institution's policies and evidence-based guidelines."

### AI Simulator safety guardrails
The Claude prompt for the simulator must:
- Never provide specific drug dosages as "the right answer"
- Always frame responses as simulation outcomes, not real clinical directives
- Include a visible disclaimer that the simulator is for reasoning practice, not clinical protocol reference
- Redirect dangerous decision paths with educational feedback, not silent acceptance

---

## MVP Build Plan

### Phase 1 (this sprint): The Wedge
**Build:** Hub page + AI Patient Simulator + 5 NGN case studies

**Success metric:** A repeat NCLEX taker can arrive at `/nursing`, understand the product in 10 seconds, try one case study for free, and feel like this is different from what they've tried before.

**What NOT to build yet:**
- Instructor dashboard
- Shift mode
- Cohort analytics
- Pricing page for nursing (use access codes like SPD)
- Separate subscription tiers for nursing
- Progress tracking beyond case completion
- Mobile-optimized interface (desktop first)

---

## NGN Case Studies: 5 MVP Cases

### Selection rationale
Cases were chosen to be:
1. High-yield for NCLEX (appear frequently, high-stakes decisions)
2. Emotionally engaging (the patient feels real, the stakes feel real)
3. Good for teaching clinical judgment (clear cues, multiple competing hypotheses)
4. Useful for social media marketing ("What would you do first?" format)
5. Representative of common NCLEX failure patterns

---

### Case 1: "Unrecognized Deterioration" — Sepsis
**Specialty:** Medical-Surgical  
**Difficulty:** Beginner (first case, lower cognitive load)  
**Anchor NCLEX failure pattern:** Students recognize "infection" but miss the hemodynamic instability. They select "give the scheduled antibiotic" instead of calling the provider.

**Patient:** Maria Gonzalez, 68F, day 2 post-UTI admission  
**Chief complaint:** Family reports new confusion overnight

**Clinical picture (physiologically coherent):**
- T 38.9°C (elevated from admission 37.8°C) — trend matters
- HR 114 bpm, regular (up from 98 at midnight)
- BP 88/52 mmHg (down from 102/64) — MAP = 64, borderline
- RR 24 breaths/min (up from 18)
- SpO2 92% on room air (down from 96%)
- Urine output: 120 mL over 8 hours (0.25 mL/kg/hr — oliguria; patient 60 kg)
- Confusion: new, oriented to name only (baseline: A&Ox4)
- Skin: warm, flushed, dry

**Why this is coherent:** All values trend in the same direction over the same time period. This is classic sepsis progression — distributive shock (warm, flushed skin from vasodilation), not cardiogenic. qSOFA score = 3 (confusion, RR ≥22, SBP ≤100).

**Current orders:** IV fluids TKO, Cephalexin 500mg PO BID (last dose 2100), PRN acetaminophen

**NGN step design:**
1. **Recognize:** Pick all abnormal cues (confusion from baseline, HR, BP, RR, SpO2, UO) — NOT temperature alone, NOT "day 2 of admission"
2. **Analyze:** Single best interpretation → early septic shock from urinary source (not dehydration, not medication SE)
3. **Prioritize:** Rank: septic shock > hemodynamic instability > source control > comfort
4. **Generate:** Select all immediate interventions (notify provider, O2, blood cultures before abx, fluid bolus request, accurate UO monitoring via catheter)
5. **Take Action:** Best SBAR — must include specific numbers, change from baseline, clear recommendation
6. **Evaluate:** Post-fluid bolus: select findings that indicate improvement (BP 102/68, HR 96, SpO2 97%, UO 40 mL/30 min) vs. still-concerning (persistent confusion — expected to resolve slowly, not immediate)

**Common wrong answers (designed in):**
- "Administer scheduled cephalexin" — antibiotic is ordered but wrong priority; need cultures first
- "Reposition for comfort" — wrong priority level
- "Temperature 38.9°C is the most important cue" — anchor error; hemodynamics are more urgent

**Teaching points:**
- qSOFA criteria (≥2 = sepsis alert)
- New confusion in elderly = most significant early deterioration cue
- Blood cultures before antibiotics — never delay antibiotics more than 1 hour
- Hour-1 Sepsis Bundle
- Effective SBAR requires specific numbers and a clear ask

---

### Case 2: "Crushing Pressure" — Acute STEMI
**Specialty:** Emergency Department  
**Difficulty:** Beginner  
**Anchor NCLEX failure pattern:** Students recognize "chest pain" and immediately give nitroglycerin — which is CONTRAINDICATED in RV infarction. Missing right-sided lead finding = dangerous action.

**Patient:** Robert Kim, 52M, walked into ED 20 minutes ago  
**Chief complaint:** "Crushing pressure in my chest, came on while mowing the lawn"

**Clinical picture:**
- Onset: 45 minutes ago, sudden, at rest after exertion
- Pain: 9/10, substernal, radiates to left jaw and left arm
- Associated: diaphoresis, nausea, "feel like I'm going to die"
- HR 58 bpm, regular (vagal response / bradycardia from RV infarct)
- BP 92/68 mmHg (hypotension — RV dependent on preload)
- RR 20
- SpO2 97% on room air
- 12-lead ECG: ST elevation in II, III, aVF + right-sided lead V4R shows ST elevation

**Why this is coherent:** Inferior STEMI (II, III, aVF) with RV extension (V4R). RV infarction causes bradycardia (right coronary supplies SA/AV node) and hypotension (RV can't pump → preload-dependent). This is the classic NCLEX "don't give nitro" scenario.

**NGN step design:**
1. **Recognize:** Identify STEMI cues — ST elevation (II/III/aVF), pain character, diaphoresis, hypotension, bradycardia. Note that SpO2 97% = do NOT automatically give O2 (current AHA: O2 only if SpO2 <90%)
2. **Analyze:** Inferior STEMI with likely RV involvement — not stable angina, not GERD, not aortic dissection
3. **Prioritize:** Activate STEMI protocol > IV access > aspirin > right-sided ECG > avoid nitroglycerin
4. **Generate:** Correct actions = activate cath lab, aspirin 324mg, large-bore IV x2, continuous monitoring, NPO, right-sided 12-lead. WRONG = nitroglycerin (causes preload reduction → fatal in RV infarct), high-flow O2 (worsens myocardial damage when SpO2 normal)
5. **Take Action:** Why do you HOLD nitroglycerin? → ST elevation in right-sided leads = RV infarction = preload-dependent
6. **Evaluate:** Post-PCI: which findings = success? ST resolution, pain relief, HR normalized, BP improved, patient reports "pressure lifting"

**Common wrong answers:**
- Nitroglycerin (classic trap — CONTRAINDICATED)
- High-flow O2 when SpO2 is 97% (outdated practice — AHA 2015 guidelines)
- "Call for crash cart" as first action instead of activating STEMI protocol

---

### Case 3: "Short of Breath on Day 2" — Pulmonary Embolism
**Specialty:** Post-Surgical / Medical-Surgical  
**Difficulty:** Intermediate  
**Anchor NCLEX failure pattern:** Students assume dyspnea post-op = atelectasis or pain → delay recognition of PE.

**Patient:** Linda Walsh, 71F, post-op day 2 total right hip arthroplasty  
**Chief complaint:** "I can't catch my breath — it started about an hour ago"

**Clinical picture:**
- Onset: sudden, 1 hour ago at rest (not with exertion initially)
- Pain: sharp, right-sided chest pain worse with breathing (pleuritic)
- HR 122 bpm (new tachycardia — was 88 yesterday)
- BP 108/72 mmHg
- RR 28 breaths/min
- SpO2 88% on room air → 94% on 4L NC
- T 37.9°C (low-grade)
- Right calf: warm, swollen, tender to palpation (DVT source)
- Current orders: Enoxaparin 40mg SQ daily (prophylaxis dose, last given 0800)
- Last ambulatory: walked hallway at 0900, returned to room

**Why this is coherent:** Post-op DVT → PE trifecta: immobility (surgery), hypercoagulability (surgical/inflammatory response), vessel injury (surgical trauma) = Virchow's Triad. Pleuritic chest pain + sudden onset + tachycardia + hypoxia + unilateral leg swelling = Wells Score ≥5 = high clinical probability PE.

**Common distractors (designed in):**
- "She just had surgery, pain is expected" — anchor bias
- "Start oxygen and reassess" — correct action but insufficient alone; provider must be notified
- "She already received anticoagulation this morning" — prophylaxis dose ≠ treatment dose; provider must order therapeutic dosing and imaging

**NGN step design:**
1. **Recognize:** Sudden onset dyspnea (not gradual), pleuritic pain (not incisional), right calf changes, tachycardia, hypoxia — NOT "expected post-op findings"
2. **Analyze:** PE (not atelectasis: sudden not gradual; not pneumonia: no fever/productive cough; not pain: pleuritic quality; not anxiety: objective SpO2 drop)
3. **Prioritize:** O2 to maintain SpO2 >95% → HOB 30-45° → call provider STAT → obtain IV access → prepare for CT-PA or V/Q scan order
4. **Generate:** All correct: O2, position, notify provider, IV access, continuous monitoring, hold ambulation, DVT sock off affected leg. WRONG: ambulate to stimulate breathing, massage calf (mobilizes clot), administer PRN pain medication as primary action
5. **Take Action:** Provider orders heparin infusion. What do you verify FIRST? Last enoxaparin dose time — double anticoagulation risk. Verify 12 hours since last dose.
6. **Evaluate:** 2 hours post-treatment: improvement indicators = SpO2 94% → 97% on 2L NC, HR 122 → 104, RR 28 → 22, patient reports less chest pain. NOT improved: SpO2 still 88%, increasing confusion, HR increasing

---

### Case 4: "Breathing Hard" — Pediatric Asthma Exacerbation
**Specialty:** Emergency Department / Pediatrics  
**Difficulty:** Intermediate  
**Anchor NCLEX failure pattern:** Students focus on "getting an order" before addressing the airway. Or they try to lay the child down (wrong position for respiratory distress).

**Patient:** Tyler Adams, 7M, brought by mother to ED  
**Chief complaint (mother):** "He's been breathing funny for an hour, his rescue inhaler isn't helping"

**Clinical picture:**
- HR 148 bpm (tachycardia — appropriate response + respiratory distress)
- RR 38 breaths/min
- SpO2 89% on room air
- T 37.2°C (afebrile — not infectious trigger, or early)
- BP 102/68 mmHg (normal for age)
- Position: sitting upright in tripod position, will not let mother lay him down
- Work of breathing: intercostal and subcostal retractions, nasal flaring, pursed lip breathing
- Auscultation: diffuse expiratory wheezing, prolonged expiratory phase, decreased air entry at bases
- Speech: can only speak 3-4 words per breath
- Skin color: perioral pallor
- Albuterol MDI x4 puffs (home, 90 minutes ago) — minimal relief
- History: diagnosed asthma age 4, hospitalized once (age 5), no daily controller medication

**Severity assessment using NAEPP criteria:**
- Moderate-severe: SpO2 89%, 3-4 words/breath, tripod, retractions, minimal response to home albuterol
- NOT mild (that's SpO2 >95%, speaks full sentences, minimal retractions)

**Why this is coherent:** Classic moderate-severe asthma exacerbation. Tachycardia (HR 148) is appropriate stress response + beta-agonist effect. Tripod position = airway protection reflex — DO NOT change it. No fever = not necessarily infectious. Perioral pallor = early hypoxia.

**NGN step design:**
1. **Recognize:** SpO2 89%, tripod, retractions, nasal flaring, 3-4 words/breath, diffuse wheezing, ineffective home albuterol. NOT concerning: elevated HR (expected in respiratory distress)
2. **Analyze:** Moderate-severe asthma exacerbation — not croup (no stridor/seal bark), not foreign body (no sudden onset/unilateral wheeze), not pneumonia (afebrile, bilateral wheeze)
3. **Prioritize:** Continuous pulse oximetry → supplemental O2 → albuterol (nebulizer, not MDI) → notify provider STAT → prepare for systemic corticosteroids, IV access, magnesium sulfate if severe
4. **Generate:** Correct: O2 by face mask or nasal cannula, continuous albuterol nebulizer, keep child in position of comfort (NEVER force supine), obtain IV access, corticosteroids. WRONG: supine position, PRN albuterol (continuous for this severity), wait for provider before starting O2
5. **Take Action:** Which finding would cause you to activate a medical emergency immediately? SpO2 dropping to 84% despite O2, paradoxical breathing (belly moves in/chest moves out = exhaustion), loss of wheezing + absent breath sounds (silent chest = impending arrest — no air moving)
6. **Evaluate:** After continuous albuterol + 2L O2 x 20 minutes: SpO2 91% (improving but not resolved), HR 138 (still elevated — expected), retractions decreased, able to speak 5-6 words. Provider orders: IV methylprednisolone + continue albuterol. Is this patient improving or deteriorating? → Improving (SpO2 trending up, work of breathing decreasing) — continue treatment, reassess in 20 minutes

---

### Case 5: "Four Patients, One Nurse" — Delegation & Prioritization
**Specialty:** Medical-Surgical / Prioritization  
**Difficulty:** Advanced  
**Anchor NCLEX failure pattern:** Students see the task level ("pain," "bathroom," "question") rather than the clinical urgency. They also delegate nursing assessments to UAP.

**Setting:** 0730, beginning of day shift. You are the RN. You receive report on 4 patients.

**Patient roster:**
1. **Room 301 — James, 72M**, post-op day 1 total knee replacement. Pain 7/10, requesting Oxycodone 5mg PO (scheduled q4h PRN, last given 0330). VS stable. Alert. No complications.
2. **Room 302 — Patricia, 64F**, COPD exacerbation. Usually on 2L NC at home. This morning RN from night shift notes SpO2 dropped from 94% to 84% on her usual 2L NC. Currently awake and anxious. "I can't breathe right."
3. **Room 303 — Marcus, 58M**, type 2 diabetes, admitted for hyperglycemia. Stable. Asking nurse to explain what foods he should avoid. Blood glucose this morning: 182 mg/dL.
4. **Room 304 — Beverly, 79F**, post-op day 3 bowel resection. Needs assistance to bathroom. VS stable. Oriented. Has colostomy (functioning).

**UAP (nursing assistant) is available.**

**NGN step design:**
1. **Recognize:** What is clinically significant and requires RN assessment? → SpO2 84% on 2L NC in COPD patient (unstable). Pain (7/10 but stable). Others: teaching request, bathroom assist.
2. **Analyze:** Patricia (Rm 302) is unstable — SpO2 change of 10 points from baseline on usual O2 = respiratory deterioration. All others are stable with expected/routine needs.
3. **Prioritize:** Patricia (302) → James (301, pain assessment/med) → Beverly (304, bathroom assist) → Marcus (303, education). Patricia is FIRST because she is UNSTABLE. Not because pain is less important, but because life-threatening comes first.
4. **Generate:** What to delegate to UAP? CORRECT: bathroom assist for Beverly (304), obtaining VS for all stable patients, updating intake/output, non-clinical resident requests. INCORRECT to delegate: pain assessment for James (RN must assess), opioid medication administration (RN only), Patricia's respiratory assessment (unstable patient = RN only), discharge teaching, IV medication, colostomy care education.
5. **Take Action:** You arrive at Patricia's room. SpO2 84%, RR 26, anxious but oriented, tripod, using pursed-lip breathing. First action? → Increase O2 flow (within COPD safe parameters — cautious titration, not high-flow blast; target SpO2 88-92% for COPD), call provider, prepare for possible escalation. NOT: immediately call rapid response (premature — try O2 adjustment first), administer PRN bronchodilator without assessment order, send UAP to check on her instead
6. **Evaluate:** After O2 increased to 4L NC: SpO2 90%, RR 22, less anxious, able to speak in sentences. Provider notified. Now what? → Document, reassess in 15 minutes, delegate stable patient tasks to UAP while monitoring Patricia, update charge nurse. Wrong: leave to address James's pain medication — Patricia is still being actively managed, delegate down rather than move away from unstable patient

**NCLEX frameworks taught:**
- Unstable vs. stable (most important differentiator)
- ABCs (PatriciaIs B — breathing)
- Expected vs. unexpected outcome (SpO2 84% = unexpected for this patient)
- Delegation rights: right task, right circumstance, right person, right direction, right supervision
- COPD oxygen therapy: cautious titration, target SpO2 88-92% (not >95%)

---

## AI Patient Simulator: Design Spec

### What it is
An AI-powered interactive patient scenario where the student types nursing actions and receives clinical simulation feedback. Unlike the NGN cases (structured steps with defined correct answers), the simulator is open-ended — the student can try anything, and the simulation responds realistically.

### What it is NOT
- Not a real clinical reference
- Not a replacement for clinical hours or simulation lab
- Not a drug dosage calculator or medication guide

### Claude system prompt design
The simulator must:
1. Respond as the clinical simulation environment, not as a chatbot
2. Describe patient responses to correct actions (vitals improve, patient calms, condition stabilizes)
3. Describe patient responses to incorrect/delayed actions (vitals worsen, condition progresses, new complications emerge)
4. Never give the "answer" directly — use consequences to teach
5. Track clinical trajectory and escalate appropriately if no action or wrong actions
6. Introduce realistic interruptions: family questions, provider callbacks, medication error interceptions, new lab results
7. Include a disclaimer at the start of every session

### Safety guardrails in the prompt
- If student asks for specific drug dosages, respond: "The provider has ordered [drug]. Your role in this simulation is to administer and monitor — consult your drug reference for dosing verification."
- If student types something clinically dangerous, the simulation shows the consequence (patient deteriorates) rather than stopping and lecturing
- Never state that dangerous actions are "correct"

### MVP simulator scenarios (2 at launch)
1. **Sepsis Alert** — Maria Gonzalez (matches Case 1, different format)
2. **Post-Op Deterioration** — generic post-surgical patient with early PE signs

### Session structure
- Patient card: name, age, room, chief complaint, current vitals
- Conversation interface: student types action, simulation responds
- Vital sign tracker: updates dynamically based on actions
- Action log: running list of what student has done
- Time tracker: simulates real-time urgency (30-minute scenario)
- End-of-session debrief: what was done, what was missed, clinical judgment score

---

## Database: New Tables Required

```sql
-- Tracks NGN case attempts
CREATE TABLE nursing_case_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  step_scores JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0
);

-- Tracks simulator sessions
CREATE TABLE nursing_simulator_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  conversation JSONB NOT NULL DEFAULT '[]',
  outcome TEXT,
  clinical_judgment_score INTEGER
);

-- Index for user lookup
CREATE INDEX idx_nursing_case_attempts_user ON nursing_case_attempts(user_id);
CREATE INDEX idx_nursing_simulator_sessions_user ON nursing_simulator_sessions(user_id);
```

---

## Subscription & Access Model

### MVP (launch)
- Use the existing access code system — same wholesale model as SPD
- No separate nursing subscription page yet
- Nursing section requires auth (same Supabase auth)
- Gate: first 1 case study free (recognize cues step only), full case requires access code or paid tier
- AI simulator requires paid access (same as AI chat in SPD)

### Future pricing (document now, build later)
| Plan | Price | What's included |
|---|---|---|
| Nursing Student | $29/month or $79/3 months | 5 NGN cases, simulator, AI tutor |
| NCLEX Repeat | $49/month | All cases, simulator, priority coaching, weak spot analysis |
| School Cohort | $499/semester/25 seats | Everything + instructor dashboard |
| Hospital Residency | $1,200/year/50 seats | All features + onboarding support |

---

## Edge Cases & Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Clinical content inaccuracy | HIGH | HIGH | Licensed RN review required before any public release. Add visible disclaimer on every nursing page. |
| AI simulator gives wrong clinical guidance | MEDIUM | HIGH | System prompt guardrails. Simulator shows consequences of wrong actions rather than endorsing them. Disclaimer on every session. Never provide specific drug dosages. |
| Student treats simulation as clinical reference | MEDIUM | HIGH | Clear persistent disclaimer. "For educational use only" on every page and in every simulator session. |
| Auth session expires mid-case | MEDIUM | LOW | Save step progress to localStorage until synced. Resume from last completed step on re-auth. |
| Student submits case with partial answers | HIGH | MEDIUM | Require selection before proceeding. Show "select at least one option" validation message. |
| Simulator API timeout (Claude latency) | MEDIUM | MEDIUM | 30-second timeout with graceful error. "The simulation is processing — try again in a moment." |
| Mobile UX — case study is unusable on small screen | HIGH | MEDIUM | Desktop-first for MVP. Add mobile banner: "This experience works best on a larger screen." |
| COPD oxygen case gives wrong SpO2 target | LOW | HIGH | Hard-code correct targets in case data. Rationale explicitly states 88-92% for COPD (not >95%). |
| Nitroglycerin case — student misreads as "give nitro" | MEDIUM | HIGH | Bold "HOLD" language in case. Rationale explains preload reduction + RV infarction mechanism. |
| Concurrent edits to nursing-cases.ts break existing attempts | LOW | MEDIUM | Version cases by `id`. If case data changes, store snapshot of case at time of attempt in DB. |
| Nursing content violates NCSBN copyright | LOW | HIGH | Do not reproduce actual NCLEX questions. All cases are original, inspired by clinical scenarios. |
| AI tutor provides answers instead of Socratic questions | MEDIUM | MEDIUM | Separate nursing AI prompt from SPD chat prompt. Enforce "ask follow-up questions" instruction. |

---

## Build Order (Phase 1 Sprint)

### Week 1: Foundation
1. `lib/nursing-cases.ts` — 5 complete NGN cases with all step data
2. `lib/nursing-config.ts` — specialty config, CJM framework, progression structure
3. `scripts/nursing-tables.sql` — DB migration (don't apply until ready to test)

### Week 1: Hub & Cases
4. `app/nursing/layout.tsx` — shared layout for nursing section
5. `app/nursing/page.tsx` — hub page (public, marketing-style)
6. `app/nursing/cases/page.tsx` — case browser (auth required)
7. `app/nursing/cases/[id]/page.tsx` — interactive case study (auth required, client component)

### Week 2: Simulator
8. `app/api/nursing/simulate/route.ts` — Claude-powered simulator API
9. `app/nursing/simulator/page.tsx` — simulator UI (auth required, client component)

### Week 2: Polish
10. Add nursing link to NavBar
11. Apply DB migration
12. Manual QA of all 5 cases (answer all steps, verify rationale displays correctly)
13. RN content review (before any public announcement)

### NOT in this sprint (document for later)
- Shift mode (`/nursing/shift`)
- Student progress dashboard (`/nursing/dashboard`)
- Instructor dashboard
- Nursing-specific pricing page
- Weak spot tracking
- XP integration for nursing
- Social share for case completion

---

## Success Metrics (Week 1)

| Metric | Target |
|---|---|
| Can complete Case 1 end-to-end | Yes |
| Case 1 rationale is clinically accurate | Verified by human RN |
| Hub page communicates value in under 10 seconds | Yes (test with 3 real users) |
| Simulator API responds in < 8 seconds | Yes |
| No incorrect clinical guidance in any case answer | Zero errors |
| TypeScript build passes | Yes |

---

## What to Build First This Week

1. **`lib/nursing-cases.ts`** — Get the data right first. Cases are the product. If the cases are wrong, nothing else matters.
2. **`lib/nursing-config.ts`** — Framework and specialty config.
3. **`app/nursing/page.tsx`** — Hub page so there's something to look at.
4. **`app/nursing/cases/[id]/page.tsx`** — The interactive case study (the actual deliverable).
5. Simulator last — it's the wedge but the cases establish credibility first.

---

*This document is the source of truth. Update it before building anything that diverges from it.*
