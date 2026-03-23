"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── GOOGLE FONTS INJECTOR ────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

// ─── INTERSECTION OBSERVER HOOK ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── CERT CARD ────────────────────────────────────────────────────────────────
const CERTS = [
  { code: "CRCST", name: "Central Service Technician", color: "#0D7377", accent: "#14BDAC", icon: "⚙️", questions: 400, desc: "The foundational certification. Master sterilization, decontamination, and instrument processing." },
  { code: "CHL",   name: "Healthcare Leader",          color: "#1A4A8A", accent: "#4A90D9", icon: "🎖️", questions: 180, desc: "Lead with authority. Demonstrate management, quality, and regulatory expertise." },
  { code: "CER",   name: "Endoscope Reprocessor",      color: "#5B2D8E", accent: "#9B59D6", icon: "🔬", questions: 147, desc: "The specialist cert. Master flexible and rigid endoscope reprocessing protocols." },
];

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🧠", title: "AI Study Chat", desc: "Ask anything. Get expert answers about sterile processing, instruments, and exam concepts — powered by Claude." },
  { icon: "📊", title: "Domain Mastery Tracking", desc: "See exactly which chapters need work. Color-coded progress bars show your weak spots before they cost you on exam day." },
  { icon: "⚡", title: "Custom Quiz Mode", desc: "Filter by domain, difficulty, or chapter. Build targeted practice sessions around your specific gaps." },
  { icon: "🔥", title: "Streak Tracking", desc: "Daily study streaks keep you accountable. Build momentum in the weeks before your exam." },
  { icon: "📋", title: "Exam Readiness Score", desc: "A live score that updates as you practice. Know whether you're ready before you sit down at the testing center." },
  { icon: "🏅", title: "Certification Badges", desc: "When you pass, claim your digital badge. Share on LinkedIn and start your next certification journey." },
];

// ─── PRICING ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    highlight: false,
    features: [
      "20 practice questions/day",
      "5 AI chat questions/day",
      "Basic progress tracking",
      "Access to all cert domains",
      "Exam readiness score",
    ],
    cta: "Start Free",
    note: "No credit card required",
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "/month",
    highlight: true,
    features: [
      "Unlimited practice questions",
      "Unlimited AI Study Chat",
      "Full domain mastery tracking",
      "Custom quiz builder",
      "Pause & resume any session",
      "Priority badge processing",
    ],
    cta: "Start Pro",
    note: "Cancel anytime",
  },
  {
    name: "Lifetime",
    price: "$99",
    period: " one time",
    highlight: false,
    features: [
      "Everything in Pro — forever",
      "All future certifications included",
      "Early access to new features",
      "Lifetime badge archive",
      "Best value for career-long use",
    ],
    cta: "Get Lifetime Access",
    note: "Pay once, own it forever",
  },
];

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Darnell W.", cert: "CRCST", text: "I failed the CRCST twice before finding this. The AI chat feature alone is worth it — I could ask follow-up questions at 11pm when I was studying. Passed on my third attempt with a 92." },
  { name: "Maria G.", cert: "CER", text: "The endoscope reprocessing content is incredibly detailed. Every chapter quiz matches exactly what showed up on the actual CER exam. I felt genuinely prepared." },
  { name: "James T.", cert: "CHL", text: "Used it for my CHL after already having my CRCST. The leadership and regulatory questions are thorough. Passed first try. Already recommended it to my whole department." },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Which certifications does this cover?", a: "Currently CRCST, CHL, CER, and CIS — the four HSPA (formerly IAHCSMM) certifications. All question banks are built from current HSPA content outlines." },
  { q: "How many questions are in the question bank?", a: "Over 700 questions across all four certifications, categorized by domain, chapter, and difficulty. New questions are added regularly." },
  { q: "Is the content aligned to the actual HSPA exam?", a: "Yes. All questions are mapped to the official HSPA content outlines for each certification. We include both multiple choice and true/false question types." },
  { q: "What is the AI Study Chat?", a: "A Claude-powered chatbot specialized in sterile processing, instrumentation, and certification content. Ask it to explain a concept, quiz you verbally, or clarify a confusing answer." },
  { q: "Can I use this on my phone?", a: "Yes. SPD Cert Prep is a web app that works on any device — phone, tablet, or computer. No download required." },
  { q: "What happens after I pass?", a: "You can claim a digital certification badge by entering your name and HSPA member number. Your badge is yours to download and share on LinkedIn. You'll also get guided toward your next certification." },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [heroRef, heroInView] = useInView(0.1);
  const [statsRef, statsInView] = useInView(0.2);
  const [featRef, featInView] = useInView(0.1);
  const [certRef, certInView] = useInView(0.1);
  const [pricingRef, pricingInView] = useInView(0.1);
  const [testRef, testInView] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #021B3A; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes floatA {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0px) rotate(0deg); }
      50%      { transform: translateY(-12px) rotate(-2deg); }
    }
    @keyframes pulse {
      0%,100% { opacity: 0.5; transform: scale(1); }
      50%      { opacity: 0.8; transform: scale(1.04); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: 0.1s; }
    .reveal-delay-2 { transition-delay: 0.2s; }
    .reveal-delay-3 { transition-delay: 0.3s; }
    .reveal-delay-4 { transition-delay: 0.4s; }

    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.9rem 2rem; border-radius: 10px; border: none; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 1rem;
      background: linear-gradient(135deg, #0D7377, #14BDAC);
      color: #FFFFFF;
      box-shadow: 0 4px 20px rgba(20,189,172,0.35);
      transition: all 0.22s; letter-spacing: 0.01em;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(20,189,172,0.45); }

    .btn-ghost {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.85rem 1.8rem; border-radius: 10px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.95rem;
      border: 1.5px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.8);
      transition: all 0.22s; letter-spacing: 0.01em;
      text-decoration: none;
    }
    .btn-ghost:hover { border-color: rgba(20,189,172,0.5); color: #14BDAC; background: rgba(20,189,172,0.06); }

    .cert-card {
      border-radius: 16px; padding: 1.75rem;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.03);
      transition: all 0.3s; cursor: default;
    }
    .cert-card:hover { transform: translateY(-4px); border-color: rgba(20,189,172,0.3); background: rgba(255,255,255,0.05); }

    .feat-card {
      border-radius: 14px; padding: 1.6rem;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.025);
      transition: all 0.28s;
    }
    .feat-card:hover { transform: translateY(-3px); border-color: rgba(20,189,172,0.25); background: rgba(20,189,172,0.04); }

    .pricing-card {
      border-radius: 18px; padding: 2rem;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      transition: all 0.28s; position: relative; overflow: hidden;
    }
    .pricing-card:hover { transform: translateY(-3px); }
    .pricing-card.highlight {
      border-color: rgba(20,189,172,0.4);
      background: rgba(13,115,119,0.12);
    }

    .testimonial-card {
      border-radius: 16px; padding: 1.75rem;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.025);
    }

    .faq-item {
      border-bottom: 1px solid rgba(255,255,255,0.07);
      overflow: hidden;
    }
    .faq-q {
      width: 100%; padding: 1.2rem 0; background: none; border: none;
      cursor: pointer; display: flex; justify-content: space-between; align-items: center;
      font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 500;
      color: #FFFFFF; text-align: left; gap: 1rem;
      transition: color 0.2s;
    }
    .faq-q:hover { color: #14BDAC; }
    .faq-a {
      overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease;
      max-height: 0; opacity: 0;
    }
    .faq-a.open { max-height: 200px; opacity: 1; }

    .shimmer-text {
      background: linear-gradient(90deg, #14BDAC 0%, #FFFFFF 40%, #E8A020 60%, #14BDAC 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 4s linear infinite;
    }

    .grid-dot-bg {
      background-image:
        radial-gradient(circle at 1px 1px, rgba(20,189,172,0.12) 1px, transparent 0);
      background-size: 36px 36px;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.4rem !important; }
      .hide-mobile { display: none !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
    }
  `;

  return (
    <>
      <FontLoader />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div style={{ background: "#021B3A", color: "#FFFFFF", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "0 2rem",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: navScrolled ? "rgba(2,27,58,0.95)" : "transparent",
          backdropFilter: navScrolled ? "blur(16px)" : "none",
          borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.3s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>⚙️</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF" }}>
              SPD Cert <em style={{ color: "#14BDAC" }}>Prep</em>
            </span>
          </div>

          <div className="hide-mobile" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {["Features", "Certifications", "Pricing", "FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", fontWeight: 500,
                textDecoration: "none", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#14BDAC"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.65)"}
              >{l}</a>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Link href="/dashboard" className="btn-ghost" style={{ padding: "0.55rem 1.2rem", fontSize: "0.88rem" }}>Sign In</Link>
            <Link href="/dashboard" className="btn-primary" style={{ padding: "0.55rem 1.2rem", fontSize: "0.88rem" }}>Start Free</Link>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="grid-dot-bg" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "8rem 1.5rem 5rem", overflow: "hidden" }}>

          {/* Background orbs */}
          <div style={{ position: "absolute", top: "15%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,115,119,0.18) 0%, transparent 70%)", animation: "pulse 6s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,160,32,0.1) 0%, transparent 70%)", animation: "pulse 8s ease-in-out infinite 2s", pointerEvents: "none" }} />

          {/* Floating badges */}
          <div className="hide-mobile" style={{ position: "absolute", left: "8%", top: "30%", animation: "floatA 5s ease-in-out infinite" }}>
            <div style={{ background: "rgba(13,115,119,0.25)", border: "1px solid rgba(20,189,172,0.4)", borderRadius: 12, padding: "0.6rem 1rem", backdropFilter: "blur(8px)" }}>
              <span style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 600 }}>CRCST ✓</span>
            </div>
          </div>
          <div className="hide-mobile" style={{ position: "absolute", right: "8%", top: "25%", animation: "floatB 6s ease-in-out infinite 1s" }}>
            <div style={{ background: "rgba(26,74,138,0.25)", border: "1px solid rgba(74,144,217,0.4)", borderRadius: 12, padding: "0.6rem 1rem", backdropFilter: "blur(8px)" }}>
              <span style={{ color: "#4A90D9", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 600 }}>CHL ✓</span>
            </div>
          </div>
          <div className="hide-mobile" style={{ position: "absolute", right: "12%", bottom: "28%", animation: "floatA 7s ease-in-out infinite 0.5s" }}>
            <div style={{ background: "rgba(91,45,142,0.25)", border: "1px solid rgba(155,89,214,0.4)", borderRadius: 12, padding: "0.6rem 1rem", backdropFilter: "blur(8px)" }}>
              <span style={{ color: "#9B59D6", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", fontWeight: 600 }}>CER ✓</span>
            </div>
          </div>

          <div ref={heroRef} style={{ maxWidth: 780, textAlign: "center", position: "relative", zIndex: 2 }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(20,189,172,0.1)", border: "1px solid rgba(20,189,172,0.3)",
              borderRadius: 100, padding: "0.4rem 1.1rem", marginBottom: "1.75rem",
              animation: heroInView ? "fadeIn 0.5s ease forwards" : "none",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#14BDAC", display: "inline-block", boxShadow: "0 0 8px #14BDAC" }} />
              <span style={{ color: "#14BDAC", fontSize: "0.78rem", fontWeight: 600, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                NOW COVERING CRCST · CHL · CER · CIS
              </span>
            </div>

            <h1 className="hero-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
              fontWeight: 900, lineHeight: 1.08,
              marginBottom: "1.5rem",
              animation: heroInView ? "fadeUp 0.7s ease 0.1s both" : "none",
            }}>
              Pass Your{" "}
              <span className="shimmer-text">HSPA Certification</span>
              <br />The First Time.
            </h1>

            <p style={{
              fontSize: "1.15rem", color: "rgba(255,255,255,0.62)", lineHeight: 1.7,
              maxWidth: 580, margin: "0 auto 2.5rem",
              fontWeight: 300,
              animation: heroInView ? "fadeUp 0.7s ease 0.25s both" : "none",
            }}>
              700+ exam-aligned questions, AI-powered study chat, and domain mastery tracking — built specifically for sterile processing professionals.
            </p>

            <div style={{
              display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap",
              animation: heroInView ? "fadeUp 0.7s ease 0.4s both" : "none",
            }}>
              <Link href="/dashboard" className="btn-primary" style={{ fontSize: "1.05rem", padding: "1rem 2.2rem" }}>
                Start Studying Free
              </Link>
              <a href="#features" className="btn-ghost" style={{ fontSize: "1.05rem", padding: "1rem 2rem" }}>
                See How It Works
              </a>
            </div>

            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", marginTop: "1.25rem", fontFamily: "'DM Mono', monospace" }}>
              Free tier includes 20 questions/day · No credit card required
            </p>
          </div>
        </section>

        {/* ── STATS BAR ────────────────────────────────────────────────────── */}
        <section ref={statsRef} style={{ borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", padding: "2.5rem 1.5rem" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", textAlign: "center" }}>
            {[
              { n: 700, s: "+", label: "Practice Questions" },
              { n: 4,   s: "",  label: "Certifications Covered" },
              { n: 16,  s: "",  label: "CER Course Chapters" },
              { n: 24,  s: "",  label: "CRCST Content Domains" },
            ].map((st, i) => (
              <div key={i} style={{ opacity: statsInView ? 1 : 0, transition: `opacity 0.5s ${i * 0.1}s` }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, color: "#14BDAC", lineHeight: 1 }}>
                  {statsInView ? <Counter end={st.n} suffix={st.s} /> : "0"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 400, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>{st.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section id="features" ref={featRef} style={{ padding: "6rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>WHAT YOU GET</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, lineHeight: 1.15 }}>
              Everything you need to pass.<br />
              <span style={{ color: "#14BDAC" }}>Nothing you don't.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`feat-card reveal ${featInView ? "visible" : ""} reveal-delay-${(i % 4) + 1}`}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.6rem", color: "#FFFFFF" }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CERTIFICATIONS ───────────────────────────────────────────────── */}
        <section id="certifications" ref={certRef} style={{ padding: "5rem 1.5rem", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>EXAM COVERAGE</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900 }}>
                All Four HSPA Certifications
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.75rem", fontSize: "1rem", fontWeight: 300 }}>
                One platform. Every certification you'll ever need in sterile processing.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
              {CERTS.map((c, i) => (
                <div key={i} className={`cert-card reveal ${certInView ? "visible" : ""} reveal-delay-${i + 1}`} style={{ borderColor: `${c.accent}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "2.2rem" }}>{c.icon}</div>
                    <span style={{ background: `${c.color}40`, border: `1px solid ${c.accent}`, borderRadius: 100, padding: "0.2rem 0.7rem", color: c.accent, fontSize: "0.7rem", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      {c.questions}+ Qs
                    </span>
                  </div>
                  <div style={{ color: c.accent, fontFamily: "'DM Mono', monospace", fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.3rem" }}>{c.code}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.75rem" }}>{c.name}</div>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", lineHeight: 1.6, fontWeight: 300 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section style={{ padding: "6rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>THE PROCESS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900 }}>
              From signup to certified<br />
              <span style={{ color: "#14BDAC" }}>in four steps.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {[
              { step: "01", title: "Create your account", desc: "Free sign up. Tell us which cert you're targeting and your exam date." },
              { step: "02", title: "Practice by domain", desc: "Work through each chapter. Weak spots are flagged so you know where to focus." },
              { step: "03", title: "Ask the AI anything", desc: "Stuck on a concept? The AI Study Chat explains it in plain language, instantly." },
              { step: "04", title: "Pass and claim your badge", desc: "Enter your HSPA number, download your badge, and start the next cert." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: "2px solid rgba(20,189,172,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 1.2rem",
                  fontFamily: "'DM Mono', monospace", color: "#14BDAC", fontWeight: 600, fontSize: "0.95rem",
                }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.6rem", color: "#FFFFFF" }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 300 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section ref={testRef} style={{ padding: "5rem 1.5rem", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>FROM THE COMMUNITY</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 900 }}>
                Real techs. Real results.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className={`testimonial-card reveal ${testInView ? "visible" : ""} reveal-delay-${i + 1}`}>
                  <div style={{ display: "flex", gap: "0.3rem", marginBottom: "1rem" }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: "#E8A020", fontSize: "0.9rem" }}>★</span>)}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", lineHeight: 1.7, fontWeight: 300, marginBottom: "1.25rem", fontStyle: "italic" }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#FFFFFF", fontSize: "0.88rem", fontWeight: 600 }}>{t.name}</span>
                    <span style={{ background: "rgba(20,189,172,0.12)", border: "1px solid rgba(20,189,172,0.3)", borderRadius: 100, padding: "0.2rem 0.65rem", color: "#14BDAC", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace" }}>
                      {t.cert} ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section id="pricing" ref={pricingRef} style={{ padding: "6rem 1.5rem", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>PLANS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900 }}>
              Start free. Upgrade when<br />
              <span style={{ color: "#14BDAC" }}>you're ready to commit.</span>
            </h2>
          </div>

          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", alignItems: "start" }}>
            {PLANS.map((p, i) => (
              <div key={i} className={`pricing-card reveal ${pricingInView ? "visible" : ""} reveal-delay-${i + 1} ${p.highlight ? "highlight" : ""}`}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #0D7377, #14BDAC)" }} />
                )}
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #0D7377, #14BDAC)", borderRadius: 100, padding: "0.25rem 1rem", fontSize: "0.72rem", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.08em", color: p.highlight ? "#14BDAC" : "rgba(255,255,255,0.5)", marginBottom: "0.75rem" }}>
                    {p.name.toUpperCase()}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem", fontWeight: 900, color: "#FFFFFF" }}>{p.price}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>{p.period}</span>
                  </div>
                </div>

                <div style={{ marginBottom: "1.75rem" }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", padding: "0.45rem 0", borderBottom: j < p.features.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <span style={{ color: p.highlight ? "#14BDAC" : "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: 1 }}>✓</span>
                      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", fontWeight: 300 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a href="/dashboard" className={p.highlight ? "btn-primary" : "btn-ghost"} style={{ width: "100%", padding: "0.9rem", textAlign: "center", textDecoration: "none", display: "block" }}>
                  {p.cta}
                </a>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", textAlign: "center", marginTop: "0.75rem", fontFamily: "'DM Mono', monospace" }}>
                  {p.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ATS CALLOUT ──────────────────────────────────────────────────── */}
        <section style={{ padding: "5rem 1.5rem", background: "rgba(13,115,119,0.06)", borderTop: "1px solid rgba(20,189,172,0.15)", borderBottom: "1px solid rgba(20,189,172,0.15)" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "1rem" }}>FOR FACILITIES & DEPARTMENTS</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 900, marginBottom: "1rem" }}>
              Do you need professional study assistance?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem", fontWeight: 300 }}>
              Aseptic Technical Solutions offers a proven certification training program with flexible options built for every learner — in-person classes, live virtual sessions, and self-study formats. Whether you are preparing solo or building a high-performing SPD team, our expert instructors are ready to help you get certified and stay compliant.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://aseptictechnicalsolutions.com" className="btn-primary" style={{ textDecoration: "none" }}>
                Explore Training Programs at Aseptic Technical Solutions
              </a>
              <a href="mailto:contact@aseptictechnicalsolutions.com" className="btn-ghost" style={{ textDecoration: "none" }}>
                Contact Us Directly
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" style={{ padding: "6rem 1.5rem", maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ color: "#14BDAC", fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.12em", marginBottom: "0.75rem" }}>FAQ</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 900 }}>
              Common questions
            </h2>
          </div>

          <div>
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span style={{ color: "#14BDAC", fontSize: "1.2rem", transition: "transform 0.3s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                <div className={`faq-a ${openFaq === i ? "open" : ""}`}>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.7, paddingBottom: "1.25rem", fontWeight: 300 }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────���─────────────────────────────── */}
        <section style={{ padding: "6rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(13,115,119,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 2, maxWidth: 620, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }}>
              Your certification is<br />
              <span style={{ color: "#14BDAC" }}>closer than you think.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem", fontWeight: 300 }}>
              Start free today. 20 questions a day, no credit card required. Upgrade when your exam date gets close and you need full access.
            </p>
            <a href="/dashboard" className="btn-primary" style={{ fontSize: "1.1rem", padding: "1.1rem 2.6rem", textDecoration: "none" }}>
              Create Your Free Account →
            </a>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem", marginTop: "1rem", fontFamily: "'DM Mono', monospace" }}>
              Free · No credit card · Start in 60 seconds
            </p>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "3rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                SPD Cert <em style={{ color: "#14BDAC" }}>Prep</em>
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", lineHeight: 1.65, fontWeight: 300 }}>
                The exam prep platform built for sterile processing professionals.
              </p>
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: "0.75rem" }}>PRODUCT</p>
              {["Features", "Pricing", "CRCST Prep", "CHL Prep", "CER Prep"].map(l => (
                <div key={l}><a href="#" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", textDecoration: "none", display: "block", marginBottom: "0.4rem", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#14BDAC"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                >{l}</a></div>
              ))}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: "0.75rem" }}>ACCOUNT</p>
              {["Sign Up Free", "Sign In", "Claim Your Badge", "Upgrade to Pro"].map(l => (
                <div key={l}><a href="#" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", textDecoration: "none", display: "block", marginBottom: "0.4rem", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#14BDAC"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                >{l}</a></div>
              ))}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", letterSpacing: "0.1em", fontFamily: "'DM Mono', monospace", marginBottom: "0.75rem" }}>COMPANY</p>
              {[
                { label: "Aseptic Technical Solutions", href: "https://aseptictechnicalsolutions.com" },
                { label: "Scott Advisory Group", href: "#" },
                { label: "Contact Us", href: "#" },
                { label: "Baltimore 2025", href: "#" },
              ].map(l => (
                <div key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", textDecoration: "none", display: "block", marginBottom: "0.4rem", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#14BDAC"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
                >{l.label}</a></div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: 1100, margin: "2rem auto 0", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem", fontFamily: "'DM Mono', monospace" }}>
              © 2025 Scott Advisory Group · Aseptic Technical Solutions
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace" }}>
              Not affiliated with HSPA · All trademarks belong to their respective owners
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
