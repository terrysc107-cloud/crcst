import Link from "next/link";
import NavBar from "@/components/landing/NavBar";
import FaqAccordion from "@/components/landing/FaqAccordion";
import StatsBar from "@/components/landing/StatsBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://spdcertprep.com" },
};

// ── Data ────────────────────────────────────────────────────────────────────

const CERTS = [
  {
    code: "CRCST",
    name: "Central Service Technician",
    icon: "⚙️",
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
    icon: "🎖️",
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
    icon: "🔬",
    questions: 147,
    desc: "The specialist cert. Master flexible and rigid endoscope reprocessing protocols.",
    borderColor: "border-amber/20",
    labelColor: "text-amber",
    badgeBg: "bg-amber/10",
    badgeBorder: "border-amber/30",
  },
];

const FEATURES = [
  { icon: "🧠", title: "AI Study Chat", desc: "Ask anything. Get expert answers about sterile processing, instruments, and exam concepts — powered by Claude." },
  { icon: "📊", title: "Domain Mastery Tracking", desc: "See exactly which chapters need work. Color-coded progress bars show your weak spots before they cost you on exam day." },
  { icon: "⚡", title: "Custom Quiz Mode", desc: "Filter by domain, difficulty, or chapter. Build targeted practice sessions around your specific gaps." },
  { icon: "🔥", title: "Streak Tracking", desc: "Daily study streaks keep you accountable. Build momentum in the weeks before your exam." },
  { icon: "📋", title: "Exam Readiness Score", desc: "A live score that updates as you practice. Know whether you're ready before you sit down at the testing center." },
  { icon: "🏅", title: "Certification Badges", desc: "When you pass, claim your digital badge. Share on LinkedIn and start your next certification journey." },
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
    <div className="bg-navy text-white overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

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
              NOW COVERING CRCST · CHL · CER · SJT
            </span>
          </div>

          <h1 className="lp-fade-up-1 text-[clamp(2.6rem,6vw,4.2rem)] font-black leading-[1.08] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            <a href="#features"
              className="inline-flex items-center px-7 py-4 rounded-xl text-[1.05rem] font-medium border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal hover:bg-teal/5 transition-all">
              See How It Works
            </a>
          </div>

          <p className="font-mono text-white/35 text-xs mt-5 tracking-wider">
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
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything you need to pass.<br />
            <span className="text-teal">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="rounded-2xl p-7 border border-white/6 bg-white/[0.025] hover:-translate-y-1 hover:border-teal/25 hover:bg-teal/[0.04] transition-all duration-300">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-[1.05rem] font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CERTIFICATIONS ───────────────────────────────────────────────────── */}
      <section id="certifications" className="py-20 px-4 bg-white/[0.015] border-t border-white/5 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">Exam Coverage</p>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
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
                  <span className="text-4xl">{c.icon}</span>
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
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
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

      {/* ── RESUME SERVICE ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-teal text-[0.7rem] tracking-[0.12em] mb-3 uppercase">Career Services</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black leading-snug mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your certification opens doors.<br />
              <span className="text-teal">A qualified resume gets you through them.</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 text-[0.95rem]">
              Certification is just the beginning. Stand out to hiring managers and pass ATS filters with a professionally written resume tailored for healthcare and SPD roles.
            </p>
            <a href="https://www.myqualifiedresume.com/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-[0.95rem] hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
              Explore Resume Services →
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { stat: "87%", label: "Interview Rate", desc: "Clients who land interviews after using our service" },
              { stat: "48h", label: "Delivery Time", desc: "Expert-written and human-reviewed, fast" },
              { stat: "$29", label: "Starting Price", desc: "Affordable packages from Starter to Premium" },
            ].map(({ stat, label, desc }) => (
              <div key={label}
                className="flex items-start gap-5 bg-white/[0.04] border border-teal/20 rounded-2xl px-5 py-4">
                <div className="font-serif text-3xl font-black text-teal leading-none flex-shrink-0">{stat}</div>
                <div>
                  <div className="font-semibold text-sm mb-0.5 text-white">{label}</div>
                  <div className="text-xs text-white/50 leading-snug">{desc}</div>
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
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
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
          <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Do you need professional study assistance?
          </h2>
          <p className="text-white/55 text-base leading-relaxed mb-8 font-light">
            Aseptic Technical Solutions offers a proven certification training program with flexible options built for every learner — in-person classes, live virtual sessions, and self-study formats. Whether you are preparing solo or building a high-performing SPD team, our expert instructors are ready to help you get certified and stay compliant.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://aseptictechnicalsolutions.com"
              className="inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-2))" }}>
              Explore Training Programs at Aseptic Technical Solutions
            </a>
            <a href="mailto:contact@aseptictechnicalsolutions.com"
              className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 hover:border-teal/50 hover:text-teal transition-all">
              Contact Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-teal text-[0.72rem] tracking-[0.12em] mb-3 uppercase">FAQ</p>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
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
          <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-black leading-[1.1] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
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
            <a href="mailto:support@spdcertprep.com"
              className="block text-white/45 text-sm mb-1.5 hover:text-teal transition-colors">
              Contact Us
            </a>
            <span className="block text-white/45 text-sm">Baltimore 2025</span>
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
