import Link from "next/link";
import NursingNav from "@/components/nursing/NursingNav";
import type { Metadata } from "next";
import { Lock, Clock, ChevronRight, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "NGN Case Studies | Nursing Prep",
  description:
    "Practice Next Generation NCLEX case studies using the 6-step Clinical Judgment Measurement Model. First case free — no credit card required.",
  alternates: { canonical: "https://spdcertprep.com/nursing/cases" },
};

const ROSE = "#E02B4B";
const ROSE_2 = "#f06074";
const ROSE_GLOW = "rgba(224,43,75,0.25)";

const DIFF_COLOR: Record<string, string> = {
  Beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  Intermediate: "text-amber bg-amber/10 border-amber/25",
  Advanced: "text-rose-2 bg-rose/10 border-rose/25",
};

const CASES = [
  {
    id: "unrecognized-deterioration",
    title: "Unrecognized Deterioration",
    subtitle: "Sepsis · Shock · Clinical Deterioration",
    specialty: "Med-Surg",
    difficulty: "Beginner",
    minutes: 15,
    tags: ["Sepsis", "qSOFA", "Priority", "Shock"],
    free: true,
    soon: false,
  },
  {
    id: "chest-pain-triage",
    title: "Chest Pain Triage",
    subtitle: "ACS vs. PE · Troponin Interpretation",
    specialty: "Emergency",
    difficulty: "Intermediate",
    minutes: 20,
    tags: ["ACS", "PE", "EKG", "Triage"],
    free: false,
    soon: true,
  },
  {
    id: "icu-post-cardiac",
    title: "Post-Cardiac Surgery Monitoring",
    subtitle: "Hemodynamics · Vasopressors · Arrhythmia",
    specialty: "ICU",
    difficulty: "Advanced",
    minutes: 25,
    tags: ["Hemodynamics", "CABG", "Arrhythmia"],
    free: false,
    soon: true,
  },
  {
    id: "ob-late-decels",
    title: "Late Decelerations in Labor",
    subtitle: "Fetal Monitoring · Uteroplacental Insufficiency",
    specialty: "OB/Maternity",
    difficulty: "Intermediate",
    minutes: 18,
    tags: ["Fetal Monitoring", "OB Emergency", "FHR"],
    free: false,
    soon: true,
  },
  {
    id: "peds-respiratory",
    title: "Pediatric Respiratory Distress",
    subtitle: "Croup vs. Epiglottitis · Stridor",
    specialty: "Pediatrics",
    difficulty: "Intermediate",
    minutes: 15,
    tags: ["Peds", "Airway", "Croup"],
    free: false,
    soon: true,
  },
  {
    id: "delegation-conflict",
    title: "Delegation Under Pressure",
    subtitle: "RN Accountability · Safe Assignment",
    specialty: "Leadership",
    difficulty: "Beginner",
    minutes: 10,
    tags: ["Delegation", "NCLEX", "Leadership"],
    free: false,
    soon: true,
  },
];

export default function CasesPage() {
  return (
    <div className="bg-navy min-h-screen text-white">
      <NursingNav />

      <div className="pt-24 pb-24 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{ background: "rgba(224,43,75,0.10)", border: "1px solid rgba(224,43,75,0.30)" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: ROSE, boxShadow: `0 0 6px ${ROSE}` }}
              />
              <span className="font-mono text-[0.72rem] font-semibold tracking-widest" style={{ color: ROSE_2 }}>
                NGN CASE STUDIES
              </span>
            </div>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black font-display leading-tight mb-4">
              Clinical Judgment Cases
            </h1>
            <p className="text-white/55 text-base font-light max-w-xl mx-auto">
              Each case follows the 6-step NCSBN Clinical Judgment Measurement Model —
              exactly the format used on the actual NGN exam.
            </p>
          </div>

          {/* Cases grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {CASES.map((c) => (
              <div
                key={c.id}
                className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
                  c.free ? "hover:-translate-y-1" : "opacity-55"
                }`}
                style={
                  c.free
                    ? { borderColor: "rgba(224,43,75,0.35)", background: "rgba(224,43,75,0.06)" }
                    : { borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }
                }
              >
                {c.free && (
                  <div className="absolute top-4 right-4">
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[0.62rem] font-bold tracking-wider text-white"
                      style={{ background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})` }}
                    >
                      FREE
                    </span>
                  </div>
                )}
                {c.soon && (
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full px-2.5 py-0.5 font-mono text-[0.62rem] font-bold tracking-wider text-white/30 border border-white/10">
                      COMING SOON
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[0.65rem] tracking-wider text-white/40 uppercase">
                      {c.specialty}
                    </span>
                    <span className="text-white/20">·</span>
                    <span className={`font-mono text-[0.62rem] rounded-full px-2 py-0.5 border ${DIFF_COLOR[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                  </div>

                  <h2 className="font-bold text-white text-[1rem] mb-1 pr-16">{c.title}</h2>
                  <p className="text-white/45 text-xs font-light mb-4">{c.subtitle}</p>

                  <div className="flex items-center gap-1 text-white/30 text-xs font-mono mb-4">
                    <Clock className="w-3 h-3" />
                    <span>{c.minutes} min · 6 steps</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.6rem] font-mono px-2 py-0.5 rounded-full border border-white/8 text-white/35"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {c.free ? (
                    <Link
                      href={`/nursing/cases/${c.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                        boxShadow: `0 4px 16px ${ROSE_GLOW}`,
                      }}
                    >
                      Start Free Case <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm text-white/25 border border-white/8">
                      <Lock className="w-3.5 h-3.5" />
                      Unlock with subscription
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Simulator CTA */}
          <div
            className="rounded-2xl p-8 border border-amber/20"
            style={{ background: "rgba(218,165,32,0.06)" }}
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber" />
                  <span className="font-mono text-amber text-[0.72rem] tracking-widest uppercase">
                    AI Patient Simulator
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  Want a different kind of practice?
                </h3>
                <p className="text-white/50 text-sm font-light">
                  Open-ended AI simulation — type any nursing action and see how the patient responds in real time.
                </p>
              </div>
              <Link
                href="/nursing/simulator"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-navy hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #daa520, #f4a261)" }}
              >
                Try the Simulator →
              </Link>
            </div>
          </div>

          <p className="text-center text-white/25 text-xs font-mono mt-8">
            Educational use only · Not a substitute for clinical training or faculty instruction
          </p>
        </div>
      </div>
    </div>
  );
}
