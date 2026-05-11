# Decisions

Record important product, technical, and execution decisions here.

---

## 2026-05-10 — XP is universal, not Progression-only

**Decision:** XP is awarded on every quiz mode (practice, test, homework, flashcard, custom) across all certs (CRCST, CHL, CER) — not just Progression Mode.

**Rationale:** Free users had zero engagement loop. Universal XP gives every user a reason to return daily. Module unlocks (study modules, CEU modules) remain Pro-gated — XP is the carrot, the module is the gate.

**XP rates:**
- Practice/Custom: 5 XP + 10 bonus if 90%+
- Homework: 10 XP + 10 bonus if 90%+
- Full Exam: 25 XP + 10 bonus if 90%+
- Flashcard: 3 XP
- Progression attempt: 10 XP
- Progression pass: +100 XP (+25 first pass, +50 precision)

---

## 2026-05-10 — 24 Progression Levels mapped to ATS CRCST chapters

**Decision:** Expand progression from 5 → 24 levels, one per ATS CRCST course chapter (HSPA 9th edition).

**Rationale:** ATS owns the full course content (class-files-ats repo). The app is a companion — study guides are exam-focused reinforcement fragments, not lesson reproductions. This respects the IP boundary while creating a content roadmap tied to the real curriculum.

**Level tier structure:**
- Tier 1 Foundations (1–5): existing levels, unchanged
- Tier 2 Chapter Deep Dives (6–15): SPD Terminology → Packaging
- Tier 3 Processing Excellence (16–20): High/Low-Temp Sterilization → Quality
- Tier 4 Systems & Leadership (21–24): Supply Chain → Professional Development

---

## 2026-05-10 — CEU module container = same shape as internal study module

**Decision:** Build the study module UI as a CEU-shaped container from day one. Internal content now. Partner content later. No structural rework at swap time.

**Rationale:** CEU provider partnerships are not confirmed yet. Building the rails now with internal content (study guide + domain quiz) means the moment a partner signs, we update `content_source` from 'internal' to 'partner', add `provider_name` and `assessment_id`, and the flow is already there.

---

## 2026-05-10 — CEU provider strategy: Path B first (partner, not self-apply)

**Decision:** Launch with a partner CEU provider. Do not apply directly to HSPA as an approved provider yet.

**Rationale:** Faster to market, de-risks the build. Lock 1–2 HSPA-approved providers, let them supply the post-assessment. Once real usage data exists, apply for own provider status. See SPD_CertPrep_Feature_Roadmap.md for full detail.

---

## 2026-05-10 — Battle pass prize layer deferred pending legal review

**Decision:** Do not build the prize/sweepstakes layer until legal review is complete.

**Rationale:** Sweepstakes mechanics require: no-purchase-necessary entry method, disclosed odds, and attorney-reviewed T&C. Build the CEU loop and engagement data first. Prize layer launches after legal sign-off.
