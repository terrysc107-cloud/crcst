export interface CaseOption {
  id: string;
  text: string;
}

export interface CaseStep {
  number: number;
  cjmLabel: string;
  question: string;
  type: 'multi-select' | 'single-choice';
  options: CaseOption[];
  correctIds: string[];
  explanation: string;
  clinicalPearl: string;
}

export interface PatientVital {
  label: string;
  value: string;
  abnormal: boolean;
}

export interface NursingCase {
  id: string;
  title: string;
  subtitle: string;
  specialty: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  tags: string[];
  free: boolean;
  patient: {
    name: string;
    demographics: string;
    context: string;
    vitals: PatientVital[];
    scenario: string;
  };
  steps: CaseStep[];
}

export const NURSING_CASES: NursingCase[] = [
  {
    id: 'unrecognized-deterioration',
    title: 'Unrecognized Deterioration',
    subtitle: 'Medical-Surgical · Septic Shock',
    specialty: 'Med-Surg',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    tags: ['Sepsis', 'Priority', 'qSOFA', 'SBAR', 'Shock'],
    free: true,
    patient: {
      name: 'Maria Gonzalez',
      demographics: '68F · Room 412B · Post-op Day 2',
      context: 'History: Type 2 diabetes, hypertension. Admitted for elective right hip replacement.',
      vitals: [
        { label: 'T', value: '38.9°C (102°F)', abnormal: true },
        { label: 'HR', value: '114 bpm', abnormal: true },
        { label: 'BP', value: '88/52 mmHg', abnormal: true },
        { label: 'RR', value: '24 breaths/min', abnormal: true },
        { label: 'SpO₂', value: '92% RA', abnormal: true },
        { label: 'LOC', value: 'A&Ox1 (baseline: A&Ox4)', abnormal: true },
        { label: 'UO', value: '120 mL / 8 hrs', abnormal: true },
      ],
      scenario:
        "Mrs. Gonzalez is on post-op day 2 following an elective right hip replacement. Her family flags you at the nurses' station: \"She seems confused — not like herself.\" You enter the room and find her flushed and diaphoretic. She opens her eyes to your voice but can only tell you her name. Her skin is warm to touch.",
    },
    steps: [
      {
        number: 1,
        cjmLabel: 'Recognize Cues',
        question:
          "Review Mrs. Gonzalez's assessment data. Which findings are clinically significant and require immediate attention? Select all that apply.",
        type: 'multi-select',
        options: [
          { id: 'a', text: 'New onset confusion — oriented to name only (baseline: A&Ox4)' },
          { id: 'b', text: 'Heart rate 114 bpm' },
          { id: 'c', text: 'Blood pressure 88/52 mmHg' },
          { id: 'd', text: 'Temperature 38.9°C (102.0°F)' },
          { id: 'e', text: 'Respiratory rate 24 breaths/min' },
          { id: 'f', text: 'SpO₂ 92% on room air' },
          { id: 'g', text: 'Urine output 120 mL over 8 hours' },
          { id: 'h', text: 'Patient is on post-operative day 2' },
        ],
        correctIds: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        explanation:
          'Every vital sign is abnormal and represents a cluster consistent with septic shock. The confusion is especially critical — it represents a change from baseline (A&Ox4 → A&Ox1). New confusion + SBP ≤100 + RR ≥22 = qSOFA score of 3/3, which strongly predicts sepsis-related organ dysfunction. "Day 2 post-op" is contextual information, not an actionable cue on its own.',
        clinicalPearl:
          "The single most dangerous cue is the change in mental status. Never dismiss a family member who says 'she's not like herself' — family often detects deterioration before the monitor does.",
      },
      {
        number: 2,
        cjmLabel: 'Analyze Cues',
        question: 'Based on the cluster of findings, which clinical analysis is most accurate?',
        type: 'single-choice',
        options: [
          {
            id: 'a',
            text: 'The patient is experiencing expected post-operative pain, causing a stress response with elevated vitals.',
          },
          {
            id: 'b',
            text: 'The findings meet qSOFA criteria (≥2) and indicate possible septic shock — immediate escalation is required.',
          },
          {
            id: 'c',
            text: 'The fever and tachycardia indicate dehydration; IV fluids alone will resolve the presentation.',
          },
          {
            id: 'd',
            text: 'Post-operative confusion is expected in a 68-year-old and does not require immediate escalation.',
          },
        ],
        correctIds: ['b'],
        explanation:
          'qSOFA score: altered mentation (1) + RR ≥22 (1) + SBP ≤100 (1) = 3/3. Combined with fever, tachycardia, and oliguria, this meets SIRS criteria for septic shock. Analyzing cues means clustering all findings into a unified clinical picture — not treating each sign in isolation.',
        clinicalPearl:
          'Students who fail NCLEX often analyze cues in isolation. "Fever → fluids" or "tachycardia → pain" misses the pattern. A cluster of abnormal findings always signals more than the sum of its parts.',
      },
      {
        number: 3,
        cjmLabel: 'Prioritize Hypotheses',
        question: 'Which nursing diagnosis has the HIGHEST priority for Mrs. Gonzalez at this time?',
        type: 'single-choice',
        options: [
          { id: 'a', text: 'Hyperthermia related to infectious process' },
          { id: 'b', text: 'Ineffective tissue perfusion related to septic shock' },
          { id: 'c', text: 'Risk for falls related to altered mental status' },
          { id: 'd', text: 'Deficient fluid volume related to decreased oral intake' },
        ],
        correctIds: ['b'],
        explanation:
          'Using the ABCs priority framework: circulation is critically compromised. BP 88/52 = MAP ≈ 64 mmHg, borderline for adequate organ perfusion. Hypotension in the setting of infection means the brain, kidneys, and heart are not receiving adequate blood flow. Hyperthermia, falls risk, and fluid deficit are all real concerns — but none are as immediately life-threatening as circulatory failure.',
        clinicalPearl:
          'On NCLEX, "Risk for" diagnoses are always deprioritized over actual, current, life-threatening problems. Note also: fluid deficit alone does not explain this full picture — sepsis is driving the hemodynamics.',
      },
      {
        number: 4,
        cjmLabel: 'Generate Solutions',
        question: 'Which interventions should you initiate IMMEDIATELY? Select all that apply.',
        type: 'multi-select',
        options: [
          { id: 'a', text: 'Activate the rapid response team and notify the provider stat' },
          { id: 'b', text: 'Apply supplemental oxygen via nasal cannula' },
          { id: 'c', text: 'Obtain blood cultures × 2 from two separate peripheral sites' },
          { id: 'd', text: 'Confirm IV access; anticipate fluid resuscitation and vasopressor orders' },
          { id: 'e', text: 'Insert urinary catheter to monitor urine output hourly' },
          { id: 'f', text: 'Administer oral acetaminophen 650 mg for the fever' },
          { id: 'g', text: 'Dim the lights and reduce stimulation to decrease confusion' },
        ],
        correctIds: ['a', 'b', 'c', 'd', 'e'],
        explanation:
          'The Surviving Sepsis Campaign Hour-1 Bundle: measure lactate, blood cultures × 2 before antibiotics, broad-spectrum antibiotics, 30 mL/kg crystalloid bolus if hypotensive, vasopressors if MAP <65. Supplemental O₂ addresses SpO₂ of 92%. A urinary catheter enables hourly output monitoring — a key perfusion marker. Oral acetaminophen is inappropriate for a patient in shock. Sensory reduction is a comfort measure, not an emergency intervention.',
        clinicalPearl:
          'Sepsis is time-sensitive — every hour of antibiotic delay increases mortality. Many institutions have standing sepsis protocols that nurses initiate before provider contact. Know yours.',
      },
      {
        number: 5,
        cjmLabel: 'Take Action',
        question:
          'The provider arrives and writes the following orders simultaneously. Which do you complete FIRST?',
        type: 'single-choice',
        options: [
          { id: 'a', text: 'Administer IV piperacillin-tazobactam 3.375 g IVPB' },
          { id: 'b', text: 'Draw blood cultures × 2 from two separate peripheral sites' },
          { id: 'c', text: 'Infuse 0.9% NS 1,000 mL wide open over 30 minutes' },
          { id: 'd', text: 'Obtain 12-lead ECG' },
        ],
        correctIds: ['b'],
        explanation:
          'Blood cultures MUST be drawn before antibiotics are given. Administering antibiotics first kills bacteria before they can be identified in culture, leading to falsely negative results and potentially weeks of inappropriate empiric therapy. Drawing cultures takes 2 minutes and does not meaningfully delay antibiotic administration.',
        clinicalPearl:
          'This is one of the most tested clinical sequences on NGN-format NCLEX. The sequence is: Cultures → Antibiotics → Fluids. The nurse who draws cultures first is protecting the patient\'s entire antibiotic treatment course.',
      },
      {
        number: 6,
        cjmLabel: 'Evaluate Outcomes',
        question:
          'One hour after initiating the sepsis protocol, you reassess Mrs. Gonzalez. Which findings indicate her condition is IMPROVING? Select all that apply.',
        type: 'multi-select',
        options: [
          { id: 'a', text: 'Mean arterial pressure (MAP) increased from 59 to 68 mmHg' },
          { id: 'b', text: 'Patient is now alert and oriented × 4 (baseline restored)' },
          { id: 'c', text: 'Heart rate decreased from 114 to 88 bpm' },
          { id: 'd', text: 'SpO₂ improved to 98% on 2L nasal cannula' },
          { id: 'e', text: 'Urine output is 12 mL in the past hour' },
          { id: 'f', text: 'Temperature increased to 39.5°C' },
        ],
        correctIds: ['a', 'b', 'c', 'd'],
        explanation:
          'Target MAP ≥65 mmHg (68 ✓). Return to baseline mentation indicates improved cerebral perfusion (✓). Normalized HR suggests improved cardiac output (✓). SpO₂ 98% on 2L NC shows adequate oxygenation (✓). Urine output of 12 mL/hr is still below the target of 0.5 mL/kg/hr for most adults (~35 mL/hr for a 70 kg patient) — oliguria persists and is NOT a sign of improvement. Worsening fever indicates the infection is not yet controlled.',
        clinicalPearl:
          'NGN "Evaluate Outcomes" questions require target values, not just trends. Memorize: MAP ≥65, UO ≥0.5 mL/kg/hr, return to baseline mental status, lactate trending down. Missing the target is not improvement.',
      },
    ],
  },
];
