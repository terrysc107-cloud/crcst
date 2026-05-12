import Link from "next/link";
import NavBar from "@/components/landing/NavBar";
import FaqAccordion from "@/components/landing/FaqAccordion";
import StatsBar from "@/components/landing/StatsBar";
import CodeEntryWidget from "@/components/landing/CodeEntryWidget";
import type { Metadata } from "next";
import {
  Settings, Award, Microscope,
  Brain, BarChart2, Zap, Flame, ClipboardList, Medal, LockOpen,
  Building2, GraduationCap, TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "https://spdcertprep.com" },
};

// ── Data ────────────────────────────────────────────────────────────────────

interface Cert {
  code: string; name: string; Icon: LucideIcon; questions: number; desc: string;
  borderColor: string; labelColor: string; badgeBg: string; badgeBorder: string;
}

const CERTS: Cert[] = [
  {
    code: "CRCST",
    name: "Central Service Technician",
    Icon: Settings,
    questions: 400,
    desc: "The foundational certification. Master sterilization, decontamination, and instrument processing.",
    borderColor: "border-teal/20",
    labelColor: "text-teal-2",
    badgeBg: "bg-teal/15",
    badgeBorder: "border-teal/40",
  },
  {
    code: "CHL",
    name: "Healthcare Leader",
    Icon: Award,
    questions: 240,
    desc: "Lead with authority. Demonstrate management, quality, and regulatory expertise.",
    borderColor: "border-navy-3/40",
    labelColor: "text-teal-3",
    badgeBg: "bg-navy-3/20",
    badgeBorder: "border-navy-3/60",
  },
  {
    code: "CER",
    name: "Endoscope Reprocessor",
    Icon: Microscope,
    questions: 147,
    desc: "The specialist cert. Master flexible and rigid endoscope reprocessing protocols.",
    borderColor: "border-amber/20",
    labelColor: "text-amber",
    badgeBg: "bg-amber/10",
    badgeBorder: "border-amber/30",
  },
];

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Brain, title: "AI Study Chat", desc: "Ask anything. Get expert answers about sterile processing, instruments, and exam concepts — powered by Claude." },
  { Icon: BarChart2, title: "Domain Mastery Tracking", desc: "See exactly which chapters need work. Color-coded progress bars show your weak spots before they cost you on exam day." },
  { Icon: Zap, title: "Custom Quiz Mode", desc: "Filter by domain, difficulty, or chapter. Build targeted practice sessions around your specific gaps." },
  { Icon: Flame, title: "Streak Tracking", desc: "Daily study streaks keep you accountable. Build momentum in the weeks before your exam." },
  { Icon: ClipboardList, title: "Exam Readiness Score", desc: "A live score that updates as you practice. Know whether you're ready before you sit down at the testing center." },
  { Icon: Medal, title: "Certification Badges", desc: "When you pass, claim your digital badge. Share on LinkedIn and start your next certification journey." },
  { Icon: LockOpen, title: "Progression Mode", desc: "Five sequential levels, XP rewards, and locked doors. Earn your way through the full CRCST domain — knowledge is earned, not accessed. Pro & Triple Crown." },
];

const TESTIMONIALS = [
  { name: "Darnell W.", cert: "CRCST", text: "I failed the CRCST twice before finding this. The AI chat feature alone is worth it — I could ask follow-up questions at 11pm when I was studying. Passed on my third attempt with a 92." },
  { name: "Maria G.", cert: "CER", text: "The endoscope reprocessing content is incredibly detailed. Every chapter quiz matches exactly what showed up on the actual CER exam. I felt genuinely prepared." },
  { name: "James T.", cert: "CHL", text: "Used it for my CHL after already having my CRCST. The leadership and regulatory questions are thorough. Passed first try. Already recommended it to my whole department." },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    features: ["20 practice questions/hour", "5 AI chat questions/day", "Basic progress tracking", "CRCST certification only"],
    cta: "Start Free",
    note: "No credit card required",
    href: "/crcst",
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$19",
    period: "90 days",
    features: ["Unlimited practice questions", "Unlimited AI Study Chat", "Full domain mastery tracking", "Custom quiz builder", "CRCST certification"],
    cta: "Get Pro Access",
    note: "One-time payment",
    href: "/pricing",
    highlight: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Triple Crown",
    price: "$39",
    period: "90 days",
    features: ["Everything in Pro", "CRCST + CHL + CER access", "Best value for career growth"],
    cta: "Get Triple Crown",
    note: "One-time payment",
    href: "/pricing",
    highlight: false,
    badge: "ALL 3 CERTS",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-navy text-white overflow-x-hidden font-sans">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <NavBar />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="lp-grid-dots relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">

        {/* Background orbs */}
        <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] rounded-full lp-pulse-a pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(42,157,143,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full lp-pulse-b pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(233,196,106,0.10) 0%, transparent 70%)" }} />

        {/* Floating cert badges */}
        <div className="hidden md:block absolute left-[8%] top-[30%] lp-float-a">
          <div className="bg-teal/20 border border-teal/40 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span className="font-mono text-teal text-xs font-semibold tracking-wider">CRCST ✓</span>
          </div>
        </div>
        <div className="hidden md:block absolute right-[8%] top-[25%] lp-float-b">
          <div className="bg-navy-3/25 border border-navy-3/50 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span className="font-mono text-teal-3 text-xs font-semibold tracking-wider">CHL ✓</span>
          </div>
        </div>
        <div className="hidden md:block absolute right-[12%] bottom-[28%] lp-float-c">
          <div className="bg-amber/10 border border-amber/30 rounded-xl px-4 py-2 backdrop-blur-sm">
            <span className="font-mono text-amber text-xs font-semibold tracking-wider">CER ✓</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Pill */}
          <div className="lp-fade-in inline-flex items-center gap-2 bg-teal/10 border border-teal/30 rounded-full px-4 py-1.5 mb-7">
            <span className="w-2 h-2 rounded-full bg-teal shadow-[0_0_8px_theme(colors.teal.DEFAULT)] inline-block" />
            <span className="font-mono text-teal text-[0.72rem] font-semibold tracking-widest">
              NOW COVERING CRCST · CHL · CER
            </span>
          </div>

          <h1 className="lp-fade-up-1 text-[clamp(2.6rem,6vw,4.2rem)] font-black leading-[1.08] mb-5 font-display">
            Pass Your{" "}
            <span className="lp-shimmer">CRCST / CBSPD Certification</span>
            <br />The First Time.
          </h1>

          <p className="lp-fade-up-2 text-[1.15rem] text-white/60 leading-relaxed max-w-xl mx-auto mb-10 font-light">
            700+ exam-aligned questions, AI-powered study chat, and domain mastery tracking — built specifically for sterile processing professionals.
          </p>

          <div className="lp-fade-up-3 flex flex-wrap gap-4 justify-center">
            <Link href="/crcst"
              className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-[1.05rem] text-white shadow-lg shadow-teal/30 hover:-translate-y-0.5 hover:shadow-teal/50 transition-all"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
              Start Studying Free
            </Link>
            <Link href="/crcst"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-[1.05rem] font-medium border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal hover:bg-teal/5 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign In
            </Link>
          </div>

          {/* Access code entry — moved above free-tier note */}
          <div className="mt-7 pt-6 border-t border-white/8">
            <p className="font-mono text-white/40 text-[0.7rem] tracking-widest uppercase mb-3">
              Have an access code from your instructor or program?
            </p>
            <CodeEntryWidget />
          </div>

          <p className="font-mono text-white/30 text-xs mt-5 tracking-wider">
            Free tier includes 20 questions/hour · No credit card required
          </p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <StatsBar />

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">What You Get</p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight font-display">
            Everything you need to pass.<br />
            <span className="text-teal">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="rounded-2xl p-7 border border-white/6 bg-white/[0.025] hover:-translate-y-1 hover:border-teal/25 hover:bg-teal/[0.04] transition-all duration-300">
              <div className="mb-4 w-8 h-8 text-teal"><f.Icon className="w-8 h-8" /></div>
              <h3 className="text-[1.05rem] font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRESSION SPOTLIGHT ────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-mono text-amber text-[0.72rem] tracking-[0.12em] mb-3 uppercase">Featured · New Mode</p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight font-display">
              Knowledge is <em className="text-amber not-italic">earned</em>, not accessed.
            </h2>
            <p className="text-white/50 mt-3 text-base font-light max-w-xl mx-auto">
              The Unlock Challenge puts five sequential levels between you and mastery. Pass each to advance. Earn XP, collect badges, and prove you know this material.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-teal/20" style={{ background: 'linear-gradient(135deg, #0B1F38 0%, #0D2A22 100%)' }}>
            <div className="grid md:grid-cols-2">

              {/* Left: levels visual */}
              <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/8">
                <p className="font-mono text-teal text-[0.68rem] tracking-[0.12em] uppercase mb-6">5 Sequential Levels</p>
                <div className="flex flex-col gap-3">
                  {[
                    { n: 1, label: 'Foundations & Basic Science', xp: '+125 XP', state: 'done' },
                    { n: 2, label: 'Decontamination', xp: '+125 XP', state: 'active' },
                    { n: 3, label: 'Sterilization Methods', xp: '+125 XP', state: 'locked' },
                    { n: 4, label: 'Sterile Storage & Distribution', xp: '+125 XP', state: 'locked' },
                    { n: 5, label: 'Advanced Mastery', xp: '+135 XP', state: 'locked' },
                  ].map((level) => (
                    <div key={level.n} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 transition-all ${
                        level.state === 'done' ? 'bg-teal text-navy' :
                        level.state === 'active' ? 'border-2 border-teal text-teal' :
                        'border border-white/15 text-white/20'
                      }`}>
                        {level.state === 'done' ? '✓' : level.n}
                      </div>
                      <div className={`flex-1 text-sm font-medium ${
                        level.state === 'done' ? 'text-teal' :
                        level.state === 'active' ? 'text-white' :
                        'text-white/28'
                      }`}>
                        {level.label}
                      </div>
                      <span className={`text-[0.65rem] font-mono ${level.state === 'locked' ? 'text-white/15' : 'text-amber/70'}`}>
                        {level.xp}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-white/8 flex items-center gap-4">
                  <div>
                    <div className="font-mono text-2xl font-black text-amber">125 XP</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">Apprentice Tier</div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['🥇', '⚡', '🎯'].map((b, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center text-sm">
                        {b}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-white/25 text-xs font-mono">+2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: hook copy + CTA */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/30 rounded-full px-3 py-1 mb-6 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber inline-block" />
                  <span className="font-mono text-amber text-[0.68rem] tracking-widest">PRO &amp; TRIPLE CROWN</span>
                </div>
                <h3 className="text-[clamp(1.3rem,3vw,1.9rem)] font-black leading-snug mb-4 font-display">
                  Structured challenge.<br />
                  <span className="text-teal">Real accountability.</span>
                </h3>
                <p className="text-white/55 text-[0.9rem] leading-relaxed mb-4">
                  Practice quizzes are a warmup. Progression Mode is the real test — timed challenges, 80% pass threshold, and a locked door until you prove you're ready.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    'Five levels covering the full CRCST domain',
                    'Earn XP and tier badges as you advance',
                    'Bonus content unlocks for high performers',
                    'Weak-spot analysis after every attempt',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/65 font-light">
                      <span className="text-teal mt-0.5 flex-shrink-0 text-xs">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/crcst"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[0.95rem] text-navy hover:opacity-90 transition-all w-fit"
                  style={{ background: 'linear-gradient(135deg, #14BDAC, #0D7377)', boxShadow: '0 4px 20px rgba(20,189,172,0.3)' }}>
                  Start the Unlock Challenge →
                </Link>
                <p className="font-mono text-white/25 text-[0.7rem] mt-3 tracking-wider">
                  Included with Pro &amp; Triple Crown plans
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────────────────────────── */}
      <section id="certifications" className="py-20 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">Exam Coverage</p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
              All Certifications Covered
            </h2>
            <p className="text-white/50 mt-3 text-base font-light">
              One platform. Every certification you'll ever need in sterile processing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {CERTS.map((c, i) => (
              <div key={i}
                className={`rounded-2xl p-7 border ${c.borderColor} bg-white/[0.03] hover:-translate-y-1 hover:bg-white/5 transition-all duration-300`}>
                <div className="flex justify-between items-start mb-4">
                  <c.Icon className={`w-9 h-9 ${c.labelColor}`} />
                  <span className={`${c.badgeBg} border ${c.badgeBorder} rounded-full px-3 py-0.5 font-mono text-[0.68rem] font-semibold ${c.labelColor}`}>
                    {c.questions}+ Qs
                  </span>
                </div>
                <div className={`font-mono text-2xl font-black tracking-wider mb-1 ${c.labelColor}`}>{c.code}</div>
                <div className="text-white/70 text-sm font-medium mb-3">{c.name}</div>
                <p className="text-white/45 text-[0.82rem] leading-relaxed font-light">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">The Process</p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
            From signup to certified<br />
            <span className="text-teal">in four steps.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Create your account", desc: "Free sign up. Tell us which cert you're targeting and your exam date." },
            { step: "02", title: "Practice by domain", desc: "Work through each chapter. Weak spots are flagged so you know where to focus." },
            { step: "03", title: "Ask the AI anything", desc: "Stuck on a concept? The AI Study Chat explains it in plain language, instantly." },
            { step: "04", title: "Pass and claim your badge", desc: "Download your digital badge and start the next cert." },
          ].map((s, i) => (
            <div key={i} className="text-center px-2 py-6">
              <div className="w-14 h-14 rounded-full border-2 border-teal/40 flex items-center justify-center mx-auto mb-5 font-mono text-teal font-semibold">
                {s.step}
              </div>
              <h3 className="text-base font-semibold mb-2 text-white">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">From the Community</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black font-display">
              Real techs. Real results.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                className="rounded-2xl p-7 border border-white/7 bg-white/[0.025]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-light italic mb-5">"{t.text}"</p>
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-semibold">{t.name}</span>
                  <span className="bg-teal/12 border border-teal/30 rounded-full px-3 py-0.5 font-mono text-teal text-[0.7rem]">
                    {t.cert} ✓
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
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">Plans</p>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black font-display">
            Start free. Upgrade when<br />
            <span className="text-teal">you're ready to commit.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p, i) => (
            <div key={i}
              className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${
                p.highlight
                  ? "border-teal/40 bg-teal/10"
                  : "border-white/8 bg-white/[0.03]"
              }`}>
              {p.highlight && (
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: "linear-gradient(90deg, var(--teal), var(--teal-2))" }} />
              )}
              {p.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 font-mono text-[0.7rem] font-bold text-white whitespace-nowrap ${
                  p.highlight
                    ? "bg-gradient-to-r from-navy-3 to-teal"
                    : "bg-gradient-to-r from-amber to-amber-2"
                }`}>
                  {p.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-mono text-[0.8rem] tracking-wider mb-3 ${p.highlight ? "text-teal" : "text-white/50"}`}>
                  {p.name.toUpperCase()}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-black text-white">{p.price}</span>
                  {p.period && <span className="text-white/40 text-sm">/ {p.period}</span>}
                </div>
              </div>

              <div className="mb-7 space-y-2">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                    <span className={`text-sm mt-0.5 flex-shrink-0 ${p.highlight ? "text-teal" : p.badge === "ALL 3 CERTS" ? "text-amber" : "text-white/40"}`}>✓</span>
                    <span className="text-white/70 text-sm font-light">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={p.href}
                className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 ${
                  p.badge === "ALL 3 CERTS"
                    ? "shadow-lg shadow-amber/25"
                    : "shadow-lg shadow-teal/25"
                }`}
                style={{
                  background: p.badge === "ALL 3 CERTS"
                    ? "linear-gradient(135deg, var(--amber), var(--amber-2))"
                    : "linear-gradient(135deg, var(--teal), var(--teal-2))",
                }}>
                {p.cta}
              </Link>
              <p className="font-mono text-white/30 text-[0.72rem] text-center mt-3">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ATS CALLOUT ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-teal/[0.06] border-t border-teal/15 border-b border-teal/15">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-4 uppercase">For Facilities &amp; Departments</p>
          <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-black mb-4">
            Do you need professional study assistance?
          </h2>
          <p className="text-white/55 text-base leading-relaxed mb-8 font-light">
            Aseptic Technical Solutions offers a proven certification training program with flexible options built for every learner — in-person classes, live virtual sessions, and self-study formats. Whether you are preparing solo or building a high-performing SPD team, our expert instructors are ready to help you get certified and stay compliant.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://aseptictechnicalsolutions.com"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-br from-teal to-teal-2 hover:opacity-90 transition-opacity">
              Explore Training Programs at Aseptic Technical Solutions
            </a>
            <a href="mailto:terry@scottadvisory.net"
              className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal transition-all">
              Contact Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* ── INSTITUTIONS ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-amber text-[0.72rem] tracking-[0.12em] mb-3 uppercase">For Programs, Schools &amp; Institutions</p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight font-display">
              Built for the people who<br />
              <span className="text-teal">train the next generation.</span>
            </h2>
            <p className="text-white/55 text-base leading-relaxed mt-4 max-w-2xl mx-auto font-light">
              Whether you run a hospital SPD department, a vocational school, a community college sterile processing program, or a private training center — we can deploy a version of this platform built around your curriculum, your students, and your certification goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {([
              {
                Icon: Building2,
                title: "Hospital & Department Access",
                desc: "Give every technician on your SPD team access to structured exam prep with department-wide progress tracking. Know who is ready and who needs more support — before they sit for certification.",
              },
              {
                Icon: GraduationCap,
                title: "Schools & Training Programs",
                desc: "Running a sterile processing certificate program at a vocational school, community college, or private training center? Integrate our question bank and AI study tools directly into your coursework. Custom branding, your domain, content paced to your syllabus.",
              },
              {
                Icon: TrendingUp,
                title: "Instructor Dashboards & Reporting",
                desc: "Program directors and instructors get a real-time view of every student's progress by domain, difficulty, and readiness score — so you can step in early and get your cohort across the finish line together.",
              },
            ] as { Icon: LucideIcon; title: string; desc: string }[]).map((item, i) => (
              <div key={i}
                className="rounded-2xl p-7 border border-amber/15 bg-amber/[0.03] hover:-translate-y-1 hover:border-amber/30 transition-all duration-300">
                <item.Icon className="w-9 h-9 text-amber mb-4" />
                <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-teal/20 bg-teal/[0.05] p-10 text-center">
            <p className="font-mono text-teal text-[0.7rem] tracking-widest mb-3 uppercase">Ready to get started?</p>
            <h3 className="text-[clamp(1.4rem,3vw,2rem)] font-black mb-3 font-display">
              Let&apos;s build something together.
            </h3>
            <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-lg mx-auto font-light">
              Reach out to discuss pricing, custom features, and what a personalized deployment looks like for your organization.
            </p>
            <a href="mailto:terry@scottadvisory.net"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-[0.95rem] hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact terry@scottadvisory.net
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">FAQ</p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-black font-display">
            Common questions
          </h2>
        </div>
        <FaqAccordion />
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(42,157,143,0.15) 0%, transparent 70%)" }} />
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-black leading-[1.1] mb-5 font-display">
            Your certification is<br />
            <span className="text-teal">closer than you think.</span>
          </h2>
          <p className="text-white/50 text-[1.05rem] leading-relaxed mb-10 font-light">
            Start free today. 20 questions per hour, no credit card required. Upgrade when your exam date gets close and you need full access.
          </p>
          <a href="/crcst"
            className="inline-flex items-center px-10 py-4 rounded-xl text-[1.1rem] font-semibold text-white shadow-xl shadow-teal/25 hover:-translate-y-0.5 hover:shadow-teal/40 transition-all"
            style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
            Create Your Free Account →
          </a>
          <p className="font-mono text-white/30 text-[0.75rem] mt-4 tracking-wider">
            Free · No credit card · Start in 60 seconds
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/7 px-4 py-12">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-serif text-lg font-bold mb-3">
              SPD Cert <em className="not-italic text-teal">Prep</em>
            </div>
            <p className="text-white/35 text-sm leading-relaxed font-light">
              The exam prep platform built for sterile processing professionals.
            </p>
          </div>

          <div>
            <p className="font-mono text-white/45 text-[0.7rem] tracking-widest mb-3 uppercase">Product</p>
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "CRCST Prep", href: "/crcst-prep" },
              { label: "CHL Prep", href: "/chl-prep" },
              { label: "CER Prep", href: "/cer-prep" },
            ].map((l) => (
              <Link key={l.label} href={l.href}
                className="block text-white/45 text-sm mb-1.5 hover:text-teal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="font-mono text-white/45 text-[0.7rem] tracking-widest mb-3 uppercase">Account</p>
            {[
              { label: "Sign Up Free", href: "/crcst" },
              { label: "Sign In", href: "/crcst" },
              { label: "Claim Your Badge", href: "/passed" },
              { label: "Upgrade to Pro", href: "/pricing" },
              { label: "Press Kit", href: "/press" },
            ].map((l) => (
              <Link key={l.label} href={l.href}
                className="block text-white/45 text-sm mb-1.5 hover:text-teal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="font-mono text-white/45 text-[0.7rem] tracking-widest mb-3 uppercase">Company</p>
            <a href="https://aseptictechnicalsolutions.com"
              className="block text-white/45 text-sm mb-1.5 hover:text-teal transition-colors">
              Aseptic Technical Solutions
            </a>
            <span className="block text-white/45 text-sm mb-1.5">Scott Advisory Group</span>
            <a href="mailto:terry@scottadvisory.net"
              className="block text-white/45 text-sm mb-1.5 hover:text-teal transition-colors">
              Contact Us
            </a>
            <span className="block text-white/45 text-sm">Baltimore 2026</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-white/6 flex flex-wrap justify-between items-center gap-4">
          <p className="font-mono text-white/25 text-[0.75rem]">
            © 2026 Scott Advisory Group · Aseptic Technical Solutions
          </p>
          <div className="flex flex-wrap gap-5 items-center">
            <Link href="/terms" className="font-mono text-white/35 text-[0.72rem] hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="font-mono text-white/35 text-[0.72rem] hover:text-white/60 transition-colors">Privacy Policy</Link>
            <span className="font-mono text-white/25 text-[0.72rem]">All trademarks belong to their respective owners</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
