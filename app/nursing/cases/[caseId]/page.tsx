"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NursingNav from "@/components/nursing/NursingNav";
import { NURSING_CASES } from "@/lib/nursing-cases";
import { CheckCircle, XCircle, ChevronRight, ArrowLeft } from "lucide-react";

const ROSE = "#E02B4B";
const ROSE_2 = "#f06074";
const ROSE_GLOW = "rgba(224,43,75,0.25)";

const CJM_LABELS = [
  "Recognize Cues",
  "Analyze Cues",
  "Prioritize Hypotheses",
  "Generate Solutions",
  "Take Action",
  "Evaluate Outcomes",
];

function setsEqual(a: string[], b: string[]) {
  const setA = new Set(a);
  const setB = new Set(b);
  return setA.size === setB.size && [...setA].every((id) => setB.has(id));
}

export default function CasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const caseData = NURSING_CASES.find((c) => c.id === caseId);

  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [stepResults, setStepResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"quiz" | "complete">("quiz");

  if (!caseData) {
    return (
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 mb-4">Case not found.</p>
          <Link href="/nursing/cases" className="underline" style={{ color: ROSE_2 }}>
            ← Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  const step = caseData.steps[currentStep];
  const isMultiSelect = step.type === "multi-select";
  const isCorrect = submitted && setsEqual(selected, step.correctIds);
  const score = stepResults.filter(Boolean).length;

  const toggleOption = (id: string) => {
    if (submitted) return;
    if (isMultiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleCheckAnswer = () => {
    if (selected.length === 0) return;
    setStepResults((prev) => [...prev, setsEqual(selected, step.correctIds)]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentStep >= caseData.steps.length - 1) {
      setPhase("complete");
    } else {
      setCurrentStep((prev) => prev + 1);
      setSelected([]);
      setSubmitted(false);
    }
  };

  const getOptionStyle = (optionId: string) => {
    if (!submitted) {
      return selected.includes(optionId)
        ? { borderColor: ROSE, background: "rgba(224,43,75,0.12)", color: "white" }
        : { borderColor: "rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.65)" };
    }
    const correct = step.correctIds.includes(optionId);
    const sel = selected.includes(optionId);
    if (correct) return { borderColor: "rgba(52,211,153,0.5)", background: "rgba(52,211,153,0.08)", color: "rgb(110,231,183)" };
    if (sel) return { borderColor: "rgba(248,113,113,0.5)", background: "rgba(248,113,113,0.08)", color: "rgb(252,165,165)" };
    return { borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", color: "rgba(255,255,255,0.28)" };
  };

  // ── Completion screen ────────────────────────────────────────────────────────
  if (phase === "complete") {
    return (
      <div className="bg-navy min-h-screen text-white">
        <NursingNav />
        <div className="pt-24 pb-20 px-4 max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">
              {score === 6 ? "🏆" : score >= 4 ? "📚" : "💪"}
            </div>
            <h1 className="text-[2rem] font-black font-display mb-2">Case Complete</h1>
            <p className="text-white/50 font-light text-sm">Unrecognized Deterioration · Med-Surg</p>
          </div>

          {/* Score */}
          <div
            className="rounded-2xl p-8 border mb-6 text-center"
            style={{ borderColor: "rgba(224,43,75,0.30)", background: "rgba(224,43,75,0.06)" }}
          >
            <p className="font-mono text-[0.72rem] tracking-widest text-white/40 uppercase mb-2">Your Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-black" style={{ color: ROSE_2 }}>{score}</span>
              <span className="text-3xl text-white/30 font-light">/ 6</span>
            </div>
            <p className="text-white/50 text-sm mt-2">
              {score === 6
                ? "Perfect score — excellent clinical reasoning."
                : score >= 4
                ? "Strong performance. Review the steps you missed."
                : "Keep practicing. Clinical reasoning improves with repetition."}
            </p>
          </div>

          {/* Step results */}
          <div className="space-y-3 mb-8">
            {caseData.steps.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl px-5 py-4 border"
                style={
                  stepResults[i]
                    ? { borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.05)" }
                    : { borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.05)" }
                }
              >
                {stepResults[i] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <p className="font-mono text-[0.62rem] tracking-wider text-white/35 uppercase">Step {s.number}</p>
                  <p className="text-white text-sm font-medium">{s.cjmLabel}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl p-8 border border-white/8 bg-white/[0.02] text-center">
            <h3 className="font-bold text-white text-lg mb-2">Ready to go deeper?</h3>
            <p className="text-white/50 text-sm mb-6 font-light">
              Create a free account to try the AI patient simulator, save your progress, and track your
              clinical judgment development across specialties.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                  boxShadow: `0 4px 16px ${ROSE_GLOW}`,
                }}
              >
                Create Free Account →
              </Link>
              <Link
                href="/nursing/simulator"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/15 bg-white/[0.04]"
              >
                Try the AI Simulator →
              </Link>
            </div>
            <p className="font-mono text-white/25 text-xs mt-4">
              Already have an account?{" "}
              <Link href="/account" className="underline hover:text-white/50 transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz phase ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-navy min-h-screen text-white">
      <NursingNav />

      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Top bar */}
          <div className="flex items-center justify-between py-4 mb-6">
            <Link
              href="/nursing/cases"
              className="flex items-center gap-1.5 text-white/40 text-sm font-mono hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cases
            </Link>

            <div className="flex items-center gap-1.5">
              {CJM_LABELS.map((label, i) => (
                <div
                  key={i}
                  title={label}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentStep ? "2.5rem" : "0.75rem",
                    background:
                      i < currentStep
                        ? "rgba(52,211,153,0.7)"
                        : i === currentStep
                        ? ROSE
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            <span className="font-mono text-white/40 text-xs">
              {currentStep + 1} / {caseData.steps.length}
            </span>
          </div>

          <div className="grid lg:grid-cols-[296px_1fr] gap-6">

            {/* Patient card — sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "rgba(224,43,75,0.20)", background: "rgba(224,43,75,0.04)" }}
              >
                {/* Patient header */}
                <div
                  className="px-5 py-4 border-b"
                  style={{ borderColor: "rgba(224,43,75,0.15)", background: "rgba(224,43,75,0.08)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{caseData.patient.name}</p>
                      <p className="text-white/40 text-xs font-mono mt-0.5">{caseData.patient.demographics}</p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[0.62rem] font-mono font-bold flex-shrink-0"
                      style={{
                        background: "rgba(224,43,75,0.15)",
                        color: ROSE_2,
                        border: "1px solid rgba(224,43,75,0.3)",
                      }}
                    >
                      PRIORITY
                    </span>
                  </div>
                  <p className="text-white/35 text-xs font-light leading-relaxed">{caseData.patient.context}</p>
                </div>

                {/* Vitals */}
                <div className="p-4">
                  <p className="font-mono text-[0.62rem] tracking-widest text-white/30 uppercase mb-2">
                    Current Vitals
                  </p>
                  <div className="space-y-1">
                    {caseData.patient.vitals.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 border-b border-white/4 last:border-0"
                      >
                        <span className="font-mono text-white/35 text-xs w-12">{v.label}</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: v.abnormal ? ROSE_2 : "rgba(255,255,255,0.65)" }}
                        >
                          {v.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scenario */}
                <div className="px-4 pb-5">
                  <p className="font-mono text-[0.62rem] tracking-widest text-white/30 uppercase mb-2">Scenario</p>
                  <p className="text-white/55 text-xs leading-relaxed font-light">
                    {caseData.patient.scenario}
                  </p>
                </div>
              </div>
            </div>

            {/* Step content */}
            <div>
              {/* Step header */}
              <div className="mb-6">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3"
                  style={{ background: "rgba(224,43,75,0.10)", border: "1px solid rgba(224,43,75,0.25)" }}
                >
                  <span
                    className="font-mono text-[0.68rem] font-semibold tracking-widest"
                    style={{ color: ROSE_2 }}
                  >
                    STEP {step.number} — {step.cjmLabel.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-[1.15rem] font-semibold text-white leading-snug mb-1">
                  {step.question}
                </h2>
                {isMultiSelect && (
                  <p className="text-white/35 text-xs font-mono">Select all that apply</p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-6">
                {step.options.map((opt) => {
                  const optStyle = getOptionStyle(opt.id);
                  const correct = step.correctIds.includes(opt.id);
                  const sel = selected.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      disabled={submitted}
                      className="w-full flex items-start gap-3 px-5 py-4 rounded-xl border text-left transition-all duration-150 disabled:cursor-default"
                      style={optStyle}
                    >
                      <div
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border"
                        style={
                          submitted
                            ? correct
                              ? { background: "rgba(52,211,153,0.25)", borderColor: "rgba(52,211,153,0.6)" }
                              : sel
                              ? { background: "rgba(248,113,113,0.25)", borderColor: "rgba(248,113,113,0.6)" }
                              : { borderColor: "rgba(255,255,255,0.12)" }
                            : sel
                            ? { background: ROSE, borderColor: ROSE }
                            : { borderColor: "rgba(255,255,255,0.20)" }
                        }
                      >
                        {submitted && correct && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {submitted && sel && !correct && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                        {!submitted && sel && (
                          <span className="text-white text-[0.6rem] font-bold">✓</span>
                        )}
                      </div>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Check answer */}
              {!submitted && (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selected.length === 0}
                  className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      selected.length > 0
                        ? `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`
                        : "rgba(255,255,255,0.08)",
                    boxShadow: selected.length > 0 ? `0 4px 16px ${ROSE_GLOW}` : undefined,
                  }}
                >
                  Check Answer
                </button>
              )}

              {/* Explanation */}
              {submitted && (
                <div className="space-y-4">
                  {/* Result badge */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
                      isCorrect ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-red-500/30 bg-red-500/[0.06]"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isCorrect ? "rgb(110,231,183)" : "rgb(252,165,165)" }}
                    >
                      {isCorrect ? "Correct" : "Incorrect — review the explanation below"}
                    </span>
                  </div>

                  {/* Explanation box */}
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
                    <p className="font-mono text-[0.65rem] tracking-widest text-white/35 uppercase mb-2">
                      Explanation
                    </p>
                    <p className="text-white/75 text-sm leading-relaxed">{step.explanation}</p>
                  </div>

                  {/* Clinical pearl */}
                  {step.clinicalPearl && (
                    <div
                      className="rounded-xl border px-5 py-4"
                      style={{ borderColor: "rgba(218,165,32,0.25)", background: "rgba(218,165,32,0.06)" }}
                    >
                      <p className="font-mono text-[0.65rem] tracking-widest text-amber/70 uppercase mb-2">
                        Clinical Pearl
                      </p>
                      <p className="text-white/70 text-sm leading-relaxed">{step.clinicalPearl}</p>
                    </div>
                  )}

                  {/* Next step */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                        boxShadow: `0 4px 16px ${ROSE_GLOW}`,
                      }}
                    >
                      {currentStep >= caseData.steps.length - 1 ? "See Results" : "Next Step"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
