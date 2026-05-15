import Link from "next/link";
import NursingNav from "@/components/nursing/NursingNav";
import type { Metadata } from "next";
import {
  Brain, Zap, BarChart2, Users, BookOpen, Shield,
  Clock, TrendingUp, GraduationCap, Building2,
  Activity, Heart, AlertTriangle, CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "https://spdcertprep.com/nursing" },
};

// ── Constants ────────────────────────────────────────────────────────────────

const ROSE      = "#E02B4B";
const ROSE_2    = "#f06074";
const ROSE_GLOW = "rgba(224,43,75,0.25)";

const FEATURES = [
  {
    Icon: Activity,
    title: "AI Patient Simulator",
    desc: "A living, breathing patient that responds to every decision you make. Vitals shift. Conditions worsen. You learn by consequence, not by reading the answer.",
  },
  {
    Icon: Brain,
    title: "NGN Case Studies",
    desc: "Unfolding cases built around the 6-step Clinical Judgment Measure — recognize cues, analyze, prioritize, generate solutions, act, and evaluate. Exactly what NCSBN tests.",
  },
  {
    Icon: Clock,
    title: "Shift Mode",
    desc: "Manage 4 patients, competing priorities, a deteriorating patient, and a call light that won't stop. 30 minutes. Real decisions. Coming soon.",
    soon: true,
  },
  {
    Icon: Zap,
    title: "Priority Framework Engine",
    desc: "ABCs. Maslow. Stable vs. unstable. Acute vs. chronic. Expected vs. unexpected. Every framework tested on NCLEX — trained until it's instinct.",
  },
  {
    Icon: BarChart2,
    title: "Clinical Judgment Tracking",
    desc: "Not just a score. A breakdown of which reasoning step keeps tripping you — recognize, analyze, prioritize, or act. You fix what the data shows.",
  },
  {
    Icon: Shield,
    title: "AI Clinical Tutor",
    desc: "Asks follow-up questions instead of giving answers. Challenges your assumptions. Forces active recall. Teaches the way a great preceptor would.",
  },
];

const SPECIALTIES = [
  { name: "Med-Surg",      icon: "🏥", state: "open",   xp: "+150 XP" },
  { name: "Emergency",     icon: "🚨", state: "open",   xp: "+200 XP" },
  { name: "ICU",           icon: "💉", state: "locked", xp: "+250 XP" },
  { name: "OB/Maternity",  icon: "👶", state: "locked", xp: "+200 XP" },
  { name: "Pediatrics",    icon: "🧒", state: "locked", xp: "+200 XP" },
  { name: "Psychiatry",    icon: "🧠", state: "locked", xp: "+175 XP" },
  { name: "Pharmacology",  icon: "💊", state: "locked", xp: "+225 XP" },
  { name: "Delegation",    icon: "📋", state: "locked", xp: "+150 XP" },
];

const TESTIMONIALS = [
  {
    name: "Keisha M.",
    tag: "Passed NCLEX-RN — 3rd attempt",
    text: "I passed Uworld twice and still failed. This is the first thing that actually made me understand why I kept choosing the wrong answer. The AI simulator made the difference.",
  },
  {
    name: "Jordan T.",
    tag: "Passed NCLEX-RN — 2nd attempt",
    text: "The case studies broke the pattern for me. I stopped memorizing facts and started reasoning through the scenario. My score went from 'near passing' to passing in 6 weeks.",
  },
  {
    name: "Amanda L.",
    tag: "BSN Student — First Attempt",
    text: "NGN is different from old NCLEX and most prep tools haven't caught up. The 6-step format here is exactly what the real exam uses. I walked in prepared.",
  },
];

const PLANS = [
  {
    name: "Student",
    price: "$29",
    period: "month",
    features: [
      "5 NGN case studies",
      "AI patient simulator (2 scenarios)",
      "Clinical judgment tracking",
      "Priority framework training",
      "AI clinical tutor",
    ],
    cta: "Start Studying",
    note: "Cancel anytime",
    highlight: false,
    badge: null as string | null,
  },
  {
    name: "NCLEX Repeat",
    price: "$49",
    period: "month",
    features: [
      "Everything in Student",
      "Unlimited case studies",
      "Full AI simulator library",
      "Weak reasoning pattern analysis",
      "Priority coaching sessions",
      "Shift Mode (when launched)",
    ],
    cta: "Break the Pattern",
    note: "Most effective for repeat takers",
    highlight: true,
    badge: "BEST FOR REPEATERS",
  },
  {
    name: "School",
    price: "$499",
    period: "semester",
    features: [
      "25 student seats",
      "Instructor dashboard",
      "Cohort progress analytics",
      "Clinical judgment scoring",
      "Remediation recommendations",
    ],
    cta: "Get School Access",
    note: "Per cohort · custom pricing available",
    highlight: false,
    badge: "INSTITUTIONS",
  },
];

const FAQS = [
  {
    q: "How is this different from Uworld, ATI, or Hurst?",
    a: "Those tools test content recall — how many facts you can retrieve under pressure. This trains clinical reasoning — the process of thinking through a patient situation correctly. Most repeat NCLEX takers don't fail because they don't know the facts. They fail because they can't apply them under pressure. This is built for that gap.",
  },
  {
    q: "What is the Next Generation NCLEX (NGN) format?",
    a: "NGN replaced the old multiple-choice-only format. It uses unfolding case studies with 6 clinical judgment steps: recognize cues, analyze cues, prioritize hypotheses, generate solutions, take action, and evaluate outcomes. Most prep tools haven't updated their content for NGN. Every case here is built around this format.",
  },
  {
    q: "Do I need to be a nursing student to use this?",
    a: "No. The platform is built for anyone preparing for NCLEX-RN — first-time takers, repeat takers, and new grad nurses in residency programs. If you're studying for NCLEX or training your clinical reasoning, this is for you.",
  },
  {
    q: "Is the clinical content accurate?",
    a: "Every case is reviewed by a licensed RN before publication. We publish zero cases that haven't passed clinical review. We also display a disclaimer on every page: this platform is for educational use and does not substitute for clinical training or faculty instruction.",
  },
  {
    q: "What is the AI patient simulator?",
    a: "It's an open-ended clinical scenario where you type nursing actions and the simulation responds realistically. If you apply supplemental oxygen to a hypoxic patient, their SpO2 improves. If you give nitroglycerin to a patient with RV infarction, they deteriorate. You learn by consequence, not by being told the answer.",
  },
  {
    q: "I have an access code from my school — how do I use it?",
    a: "Use the access code box on the sign-up page. Your school's code grants you full access for the duration of your program without needing a personal subscription.",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function NursingLandingPage() {
  return (
    <div className="bg-navy text-white overflow-x-hidden font-sans">
      <NursingNav />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="lp-grid-dots relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">

        {/* Background orbs — rose instead of teal */}
        <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] rounded-full lp-pulse-a pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(224,43,75,0.14) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full lp-pulse-b pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(224,43,75,0.07) 0%, transparent 70%)" }} />

        {/* Floating specialty badges */}
        <div className="hidden md:block absolute left-[8%] top-[30%] lp-float-a">
          <div className="rounded-xl px-4 py-2 backdrop-blur-sm"
            style={{ background: "rgba(224,43,75,0.12)", border: "1px solid rgba(224,43,75,0.35)" }}>
            <span className="font-mono text-xs font-semibold tracking-wider" style={{ color: ROSE_2 }}>ICU ✓</span>
          </div>
        </div>
        <div className="hidden md:block absolute right-[8%] top-[25%] lp-float-b">
          <div className="rounded-xl px-4 py-2 backdrop-blur-sm"
            style={{ background: "rgba(224,43,75,0.10)", border: "1px solid rgba(224,43,75,0.30)" }}>
            <span className="font-mono text-xs font-semibold tracking-wider" style={{ color: ROSE_2 }}>Med-Surg ✓</span>
          </div>
        </div>
        <div className="hidden md:block absolute right-[12%] bottom-[28%] lp-float-c">
          <div className="bg-amber/10 border border-amber/30 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span className="font-mono text-amber text-xs font-semibold tracking-wider">NCLEX-RN ✓</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Pill */}
          <div className="lp-fade-in inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ background: "rgba(224,43,75,0.10)", border: "1px solid rgba(224,43,75,0.30)" }}>
            <span className="w-2 h-2 rounded-full inline-block"
              style={{ background: ROSE, boxShadow: `0 0 8px ${ROSE}` }} />
            <span className="font-mono text-[0.72rem] font-semibold tracking-widest" style={{ color: ROSE_2 }}>
              CLINICAL JUDGMENT TRAINING · NCLEX-RN · NGN FORMAT
            </span>
          </div>

          <h1 className="lp-fade-up-1 text-[clamp(2.4rem,5.5vw,3.8rem)] font-black leading-[1.08] mb-5 font-display">
            Train Clinical Judgment<br />
            <span style={{
              background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Before You Touch a Real Patient.
            </span>
          </h1>

          <p className="lp-fade-up-2 text-[1.1rem] text-white/60 leading-relaxed max-w-2xl mx-auto mb-4 font-light">
            Not another question bank. A clinical reasoning engine — built for nursing students and repeat NCLEX takers who already know the facts but keep choosing the wrong answer.
          </p>

          <p className="lp-fade-up-2 text-[0.95rem] text-white/40 leading-relaxed max-w-xl mx-auto mb-10 font-light">
            AI patient simulation. NGN-format case studies. The 6-step Clinical Judgment Measure.
            Specialty unlocks from Med-Surg to ICU.
          </p>

          <div className="lp-fade-up-3 flex flex-wrap gap-4 justify-center">
            <Link
              href="/nursing/cases"
              className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-[1.05rem] text-white hover:-translate-y-0.5 transition-all"
              style={{
                background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                boxShadow: `0 6px 24px ${ROSE_GLOW}`,
              }}
            >
              Try a Free Case Study →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-[1.05rem] font-medium border border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:text-white transition-all"
            >
              <span>See How It Works</span>
            </a>
          </div>

          <p className="font-mono text-white/25 text-xs mt-6 tracking-wider">
            First case study free · No credit card required · Same login as SPD Cert Prep
          </p>
        </div>
      </section>

      {/* ── DIFFERENTIATOR STRIP ─────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-white/5 border-b border-white/5"
        style={{ background: "rgba(224,43,75,0.04)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              {
                label: "Traditional NCLEX Prep",
                desc: "More questions. Same wrong answers. Same failure pattern.",
                bad: true,
              },
              {
                label: "→",
                desc: "",
                separator: true,
              },
              {
                label: "Clinical Judgment Training",
                desc: "Understand why you choose wrong. Break the pattern. Pass.",
                bad: false,
              },
            ].map((item, i) =>
              item.separator ? (
                <div key={i} className="hidden md:flex items-center justify-center">
                  <span className="text-white/20 text-4xl font-thin">→</span>
                </div>
              ) : (
                <div key={i} className={`rounded-2xl p-6 border ${
                  item.bad
                    ? "border-white/8 bg-white/[0.02]"
                    : "border-white/10 bg-white/[0.04]"
                }`}
                  style={!item.bad ? { borderColor: "rgba(224,43,75,0.25)", background: "rgba(224,43,75,0.06)" } : {}}>
                  <p className={`font-mono text-[0.72rem] tracking-widest uppercase mb-2 ${item.bad ? "text-white/30" : ""}`}
                    style={!item.bad ? { color: ROSE_2 } : {}}>
                    {item.label}
                  </p>
                  <p className={`text-sm leading-relaxed ${item.bad ? "text-white/35 line-through decoration-white/20" : "text-white/70"}`}>
                    {item.desc}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
            What You Get
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight font-display">
            Everything that builds reasoning.<br />
            <span style={{ color: ROSE }}>Nothing that just tests recall.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="relative rounded-2xl p-7 border border-white/6 bg-white/[0.025] hover:-translate-y-1 hover:border-rose/25 hover:bg-rose/[0.04] transition-all duration-300"
            >
              {f.soon && (
                <span className="absolute top-4 right-4 font-mono text-[0.6rem] bg-amber/15 border border-amber/30 text-amber rounded-full px-2 py-0.5 tracking-widest">
                  COMING SOON
                </span>
              )}
              <div className="mb-4 w-8 h-8" style={{ color: ROSE }}>
                <f.Icon className="w-8 h-8" />
              </div>
              <h3 className="text-[1.05rem] font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIMULATOR SPOTLIGHT ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-amber text-[0.72rem] tracking-[0.12em] mb-3 uppercase">The Core Product</p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight font-display">
              A patient that reacts to<br />
              <em className="text-amber not-italic">every decision you make.</em>
            </h2>
            <p className="text-white/50 mt-3 text-base font-light max-w-xl mx-auto">
              Not a video. Not a script. A live AI simulation where the patient responds to your nursing actions in real time — and deteriorates if you delay or choose wrong.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border"
            style={{
              borderColor: "rgba(224,43,75,0.20)",
              background: "linear-gradient(135deg, #0B1F38 0%, #1a0810 100%)",
            }}>
            <div className="grid md:grid-cols-2">

              {/* Left: simulator preview */}
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/8">
                <p className="font-mono text-[0.68rem] tracking-[0.12em] uppercase mb-5" style={{ color: ROSE_2 }}>
                  Active Scenario · Med-Surg
                </p>

                {/* Patient card */}
                <div className="rounded-xl p-4 border border-white/8 bg-white/[0.04] mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">Maria Gonzalez</p>
                      <p className="text-white/40 text-xs font-mono">68F · Room 412B · Day 2</p>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-mono font-bold"
                      style={{ background: "rgba(224,43,75,0.15)", color: ROSE, border: "1px solid rgba(224,43,75,0.3)" }}>
                      PRIORITY
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "HR", value: "114", unit: "bpm", warn: true },
                      { label: "BP", value: "88/52", unit: "mmHg", warn: true },
                      { label: "SpO₂", value: "92%", unit: "RA", warn: true },
                    ].map((v) => (
                      <div key={v.label} className="rounded-lg p-2"
                        style={{ background: v.warn ? "rgba(224,43,75,0.08)" : "rgba(255,255,255,0.04)" }}>
                        <p className="text-[0.6rem] text-white/40 font-mono uppercase">{v.label}</p>
                        <p className="font-mono font-bold text-sm mt-0.5" style={{ color: v.warn ? ROSE_2 : "white" }}>
                          {v.value}
                        </p>
                        <p className="text-[0.55rem] text-white/30 font-mono">{v.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated chat */}
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <span className="text-[0.6rem] font-mono text-white/30 mt-1 flex-shrink-0">SIM</span>
                    <p className="text-xs text-white/60 leading-relaxed bg-white/[0.04] rounded-lg px-3 py-2">
                      Mrs. Gonzalez&apos;s family is at the door. &quot;She seems confused — not like herself.&quot; You enter the room. Her skin is warm, flushed. She opens her eyes but can only tell you her name.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <p className="text-xs text-white leading-relaxed rounded-lg px-3 py-2"
                      style={{ background: "rgba(224,43,75,0.20)" }}>
                      I assess her vital signs and apply supplemental oxygen.
                    </p>
                    <span className="text-[0.6rem] font-mono text-white/30 mt-1 flex-shrink-0">RN</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[0.6rem] font-mono text-white/30 mt-1 flex-shrink-0">SIM</span>
                    <p className="text-xs text-white/60 leading-relaxed bg-white/[0.04] rounded-lg px-3 py-2">
                      SpO₂ improves to 95% on 2L NC. BP remains 88/52. This patient needs more than oxygen. Your qSOFA score is 3/3. What&apos;s your next action?
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 flex items-center gap-2">
                  <span className="text-white/25 text-xs font-mono">Type your nursing action...</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ROSE }} />
                </div>
              </div>

              {/* Right: hook copy */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6 w-fit"
                  style={{ background: "rgba(224,43,75,0.10)", border: "1px solid rgba(224,43,75,0.30)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ROSE }} />
                  <span className="font-mono text-[0.68rem] tracking-widest" style={{ color: ROSE_2 }}>
                    STUDENT &amp; NCLEX REPEAT PLANS
                  </span>
                </div>
                <h3 className="text-[clamp(1.3rem,3vw,1.9rem)] font-black leading-snug mb-4 font-display">
                  Learn by consequence.<br />
                  <span style={{ color: ROSE }}>Not by reading rationale.</span>
                </h3>
                <p className="text-white/55 text-[0.9rem] leading-relaxed mb-5">
                  Question banks tell you the answer after you get it wrong. The simulator shows you what happens when you get it wrong — and makes you figure out why.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Patient vitals respond to your decisions in real time",
                    "Delay the right intervention → patient deteriorates",
                    "Give the wrong medication → simulation escalates",
                    "Session debrief shows your clinical reasoning gaps",
                    "AI tutor follows up with Socratic questions, not answers",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/65 font-light">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ROSE }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/nursing/simulator"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[0.95rem] text-white hover:opacity-90 transition-all w-fit"
                  style={{
                    background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                    boxShadow: `0 4px 20px ${ROSE_GLOW}`,
                  }}
                >
                  Try the Simulator →
                </Link>
                <p className="font-mono text-white/25 text-[0.7rem] mt-3 tracking-wider">
                  Included with Student &amp; NCLEX Repeat plans
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
              How It Works
            </p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
              Go from failing the same question<br />
              <span style={{ color: ROSE }}>to understanding why you failed.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Pick your starting case", desc: "Start with Med-Surg sepsis. A real patient. Real vital signs. A real clinical decision to make." },
              { step: "02", title: "Work the 6 clinical judgment steps", desc: "Recognize cues. Analyze what they mean. Prioritize the diagnosis. Generate interventions. Act. Evaluate." },
              { step: "03", title: "See what you missed — and why", desc: "The case shows exactly which reasoning step tripped you. Not just 'wrong' — the mechanism that drove the wrong choice." },
              { step: "04", title: "Unlock the next level", desc: "Pass Med-Surg to unlock ER. Pass ER to unlock ICU. Earn XP. Build a complete clinical reasoning foundation." },
            ].map((s, i) => (
              <div key={i} className="text-center px-2 py-6">
                <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mx-auto mb-5 font-mono font-semibold"
                  style={{ borderColor: "rgba(224,43,75,0.40)", color: ROSE }}>
                  {s.step}
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES ──────────────────────────────────────────────────────── */}
      <section id="specialties" className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-amber text-[0.72rem] tracking-[0.12em] mb-3 uppercase">
            Specialty Progression
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
            Clinical judgment is <em className="text-amber not-italic">earned</em>, not accessed.
          </h2>
          <p className="text-white/50 mt-3 text-base font-light max-w-xl mx-auto">
            Unlock each specialty by demonstrating mastery of the previous one. Build from the ground up — the way clinical competence actually works.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPECIALTIES.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 border text-center transition-all duration-200"
              style={
                s.state === "open"
                  ? {
                      borderColor: "rgba(224,43,75,0.30)",
                      background: "rgba(224,43,75,0.06)",
                    }
                  : {
                      borderColor: "rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                    }
              }
            >
              <div className="text-2xl mb-2 opacity-80">{s.icon}</div>
              <div className="font-semibold text-sm text-white mb-1">{s.name}</div>
              <div className={`font-mono text-[0.65rem] ${s.state === "locked" ? "text-white/20" : "text-amber/70"}`}>
                {s.state === "locked" ? "🔒 Locked" : s.xp}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
              Who It&apos;s Built For
            </p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
              Three problems. One platform.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                Icon: AlertTriangle,
                who: "Repeat NCLEX Takers",
                pain: "You've done Uworld twice. You've spent $1,200 on prep courses. You know the content — and you still fail.",
                solution: "This breaks the reasoning pattern that question banks can't fix. You stop guessing. You start thinking.",
                price: "Most popular at $49/month",
              },
              {
                Icon: BookOpen,
                who: "Nursing Students",
                pain: "NCLEX changed. NGN is a different test — unfolding cases, clinical reasoning steps, not just multiple choice. Most prep tools haven't caught up.",
                solution: "Every case here is built in NGN format. You practice exactly what's on the actual exam.",
                price: "Start free — first case included",
              },
              {
                Icon: GraduationCap,
                who: "Nursing Schools",
                pain: "Students fail NCLEX at higher rates when clinical reasoning isn't explicitly taught. Simulation labs are expensive. Not every student gets enough reps.",
                solution: "Assign case studies as coursework. Track cohort clinical judgment performance in real time.",
                price: "From $499/semester/25 seats",
              },
            ].map((item, i) => (
              <div key={i}
                className="rounded-2xl p-7 border border-white/7 bg-white/[0.025] hover:-translate-y-1 transition-all duration-300">
                <item.Icon className="w-8 h-8 mb-4" style={{ color: ROSE }} />
                <h3 className="text-lg font-bold text-white mb-3">{item.who}</h3>
                <p className="text-white/45 text-sm leading-relaxed font-light italic mb-4">&ldquo;{item.pain}&rdquo;</p>
                <p className="text-white/70 text-sm leading-relaxed mb-5">{item.solution}</p>
                <p className="font-mono text-[0.7rem] tracking-wider" style={{ color: ROSE_2 }}>{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NGN CASE PREVIEW ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
            The Format
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
            What a case study looks like.
          </h2>
          <p className="text-white/50 mt-3 max-w-xl mx-auto font-light text-sm">
            Built around the NCSBN Clinical Judgment Measurement Model — the framework used on the actual NGN exam.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          {/* Case header */}
          <div className="px-8 py-5 border-b border-white/8 flex flex-wrap gap-4 items-center justify-between"
            style={{ background: "rgba(224,43,75,0.06)" }}>
            <div>
              <p className="font-semibold text-white">Unrecognized Deterioration</p>
              <p className="text-white/45 text-xs font-mono mt-0.5">Medical-Surgical · Beginner · 15 min</p>
            </div>
            <div className="flex gap-2">
              {["Sepsis", "Priority", "qSOFA", "SBAR"].map((tag) => (
                <span key={tag} className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: ROSE_2, borderColor: "rgba(224,43,75,0.25)", background: "rgba(224,43,75,0.08)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Steps bar */}
          <div className="px-8 py-4 border-b border-white/5 flex gap-2 overflow-x-auto">
            {[
              "Recognize Cues",
              "Analyze Cues",
              "Prioritize",
              "Generate Solutions",
              "Take Action",
              "Evaluate",
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[0.65rem] whitespace-nowrap flex-shrink-0 transition-all"
                style={
                  i === 0
                    ? { background: "rgba(224,43,75,0.20)", color: ROSE_2, border: `1px solid rgba(224,43,75,0.35)` }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                <span>{i === 0 ? "●" : i < 1 ? "✓" : "○"}</span>
                {step}
              </div>
            ))}
          </div>

          {/* Question preview */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Patient data */}
              <div>
                <p className="font-mono text-white/40 text-[0.7rem] uppercase tracking-widest mb-3">Patient Data</p>
                <div className="space-y-2">
                  {[
                    { label: "T", value: "38.9°C (102.0°F)", warn: true },
                    { label: "HR", value: "114 bpm", warn: true },
                    { label: "BP", value: "88/52 mmHg", warn: true },
                    { label: "RR", value: "24 breaths/min", warn: true },
                    { label: "SpO₂", value: "92% on room air", warn: true },
                    { label: "LOC", value: "Confused — oriented to name only (baseline: A&Ox4)", warn: true },
                    { label: "UO", value: "120 mL / 8 hrs", warn: true },
                  ].map((v) => (
                    <div key={v.label} className="flex items-start gap-3 text-sm py-1.5 border-b border-white/4 last:border-0">
                      <span className="font-mono text-white/30 text-xs w-8 flex-shrink-0 mt-0.5">{v.label}</span>
                      <span className={v.warn ? "font-medium" : "text-white/60"} style={v.warn ? { color: ROSE_2 } : {}}>
                        {v.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div>
                <p className="font-mono text-white/40 text-[0.7rem] uppercase tracking-widest mb-3">
                  Step 1 — Recognize Cues
                </p>
                <p className="text-white text-sm leading-relaxed mb-5">
                  Review the patient data. Which findings are clinically significant and require immediate attention?
                  <span className="text-white/40 font-mono text-xs ml-2">(Select all that apply)</span>
                </p>
                <div className="space-y-2">
                  {[
                    { text: "New onset confusion (change from baseline)", selected: true },
                    { text: "Heart rate 114 bpm", selected: true },
                    { text: "Blood pressure 88/52 mmHg", selected: true },
                    { text: "Temperature 38.9°C", selected: false },
                    { text: "Urine output 120 mL/8 hours", selected: true },
                    { text: "She is on day 2 of admission", selected: false },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm border cursor-pointer transition-all"
                      style={
                        opt.selected
                          ? { borderColor: "rgba(224,43,75,0.40)", background: "rgba(224,43,75,0.10)", color: "white" }
                          : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.55)" }
                      }
                    >
                      <div className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                        style={
                          opt.selected
                            ? { borderColor: ROSE, background: ROSE }
                            : { borderColor: "rgba(255,255,255,0.20)" }
                        }
                      >
                        {opt.selected && <span className="text-white text-[0.6rem] font-bold">✓</span>}
                      </div>
                      {opt.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link
                href="/nursing/cases"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                  boxShadow: `0 4px 16px ${ROSE_GLOW}`,
                }}
              >
                Start This Case Free →
              </Link>
              <p className="font-mono text-white/25 text-xs mt-3">No account required for the first step</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
              From Nurses Who Passed
            </p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black font-display">
              Different approach. Different result.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl p-7 border border-white/7 bg-white/[0.025]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-light italic mb-5">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-semibold">{t.name}</span>
                  <span className="rounded-full px-3 py-0.5 font-mono text-[0.65rem]"
                    style={{ background: "rgba(224,43,75,0.12)", border: "1px solid rgba(224,43,75,0.30)", color: ROSE_2 }}>
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
            Plans
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
            Start free.<br />
            <span style={{ color: ROSE }}>Upgrade when you&apos;re ready to commit.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p, i) => (
            <div key={i}
              className="relative rounded-2xl p-8 border transition-all hover:-translate-y-1"
              style={
                p.highlight
                  ? { borderColor: "rgba(224,43,75,0.40)", background: "rgba(224,43,75,0.08)" }
                  : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }
              }
            >
              {p.highlight && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${ROSE}, ${ROSE_2})` }} />
              )}
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 font-mono text-[0.7rem] font-bold text-white whitespace-nowrap"
                  style={{
                    background: p.highlight
                      ? `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`
                      : "linear-gradient(135deg, #daa520, #f4a261)",
                  }}>
                  {p.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-mono text-[0.8rem] tracking-wider mb-3"
                  style={{ color: p.highlight ? ROSE_2 : "rgba(255,255,255,0.50)" }}>
                  {p.name.toUpperCase()}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-black text-white">{p.price}</span>
                  <span className="text-white/40 text-sm">/ {p.period}</span>
                </div>
              </div>

              <div className="mb-7 space-y-2">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: p.highlight ? ROSE : "rgba(255,255,255,0.40)" }}>✓</span>
                    <span className="text-white/70 text-sm font-light">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/nursing/cases"
                className="block w-full text-center py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{
                  background: p.highlight
                    ? `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`
                    : p.badge === "INSTITUTIONS"
                    ? "linear-gradient(135deg, #daa520, #f4a261)"
                    : "rgba(255,255,255,0.08)",
                  boxShadow: p.highlight ? `0 4px 20px ${ROSE_GLOW}` : undefined,
                }}
              >
                {p.cta}
              </Link>
              <p className="font-mono text-white/30 text-[0.72rem] text-center mt-3">{p.note}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs font-mono mt-8">
          Have an access code from your school?{" "}
          <Link href="/nursing/cases" className="underline hover:text-white/60 transition-colors">
            Enter it at sign-up →
          </Link>
        </p>
      </section>

      {/* ── INSTITUTION CALLOUT ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5"
        style={{ background: "rgba(224,43,75,0.04)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-4 uppercase" style={{ color: ROSE_2 }}>
            For Nursing Schools &amp; Hospitals
          </p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-black mb-4">
            Give your students clinical reasoning practice<br />before clinical rotation.
          </h2>
          <p className="text-white/55 text-base leading-relaxed mb-8 font-light">
            Assign NGN case studies as coursework. Track cohort clinical judgment performance by step — not just pass rate. Identify students who need remediation before they sit for boards.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            {[
              { Icon: Users, text: "Cohort progress dashboards" },
              { Icon: BarChart2, text: "Clinical judgment analytics by step" },
              { Icon: TrendingUp, text: "Remediation recommendations" },
              { Icon: Building2, text: "Hospital residency onboarding" },
            ].map(({ Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2 border border-white/8 bg-white/[0.03] text-white/60 text-sm">
                <Icon className="w-3.5 h-3.5" style={{ color: ROSE }} />
                {text}
              </div>
            ))}
          </div>
          <a
            href="mailto:terry@scottadvisory.net"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
              boxShadow: `0 4px 20px ${ROSE_GLOW}`,
            }}
          >
            <Heart className="w-4 h-4" />
            Contact Us About School Pricing
          </a>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] mb-3 uppercase" style={{ color: ROSE_2 }}>
            FAQ
          </p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-black font-display">Common questions</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-white/7 bg-white/[0.025] overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                <span className="text-white text-sm font-medium pr-6">{faq.q}</span>
                <span className="text-white/40 group-open:rotate-45 transition-transform duration-200 flex-shrink-0">+</span>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-white/60 text-sm leading-relaxed font-light">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(224,43,75,0.12) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-black leading-[1.1] mb-5 font-display">
            Stop answering questions.<br />
            <span style={{ color: ROSE }}>Start thinking like a nurse.</span>
          </h2>
          <p className="text-white/50 text-[1.05rem] leading-relaxed mb-10 font-light">
            First case study is free. No credit card. No commitment. Just one clinical scenario to show you what reasoning-based practice feels like.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/nursing/cases"
              className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-[1.05rem] text-white hover:-translate-y-0.5 transition-all"
              style={{
                background: `linear-gradient(135deg, ${ROSE}, ${ROSE_2})`,
                boxShadow: `0 6px 24px ${ROSE_GLOW}`,
              }}
            >
              Try a Free Case Study →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-[1.05rem] font-medium border border-white/15 bg-white/[0.03] text-white/60 hover:text-white/80 hover:border-white/25 transition-all"
            >
              ← Back to SPD Cert Prep
            </Link>
          </div>
          <p className="font-mono text-white/25 text-xs mt-6 tracking-wider">
            Already have an SPD Cert Prep account? Same login works here.
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg" aria-hidden>🩺</span>
            <span className="font-serif text-white font-bold">
              Nursing <em className="not-italic" style={{ color: ROSE }}>Prep</em>
            </span>
            <span className="text-white/20 text-xs font-mono">part of SPD Cert Prep</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/35">
            <Link href="/" className="hover:text-white/60 transition-colors font-mono text-xs">SPD Cert Prep</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors font-mono text-xs">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors font-mono text-xs">Terms</Link>
            <a href="mailto:terry@scottadvisory.net" className="hover:text-white/60 transition-colors font-mono text-xs">Contact</a>
          </div>
          <p className="text-white/20 text-xs font-mono text-center sm:text-right">
            Educational use only. Not a substitute<br className="sm:hidden" /> for clinical training or faculty instruction.
          </p>
        </div>
      </footer>
    </div>
  );
}
