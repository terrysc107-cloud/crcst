"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Cert = "CRCST" | "CHL" | "CER";
type Step = "entry" | "verifying" | "celebration" | "next_cert";

interface PassedData {
  name: string;
  hspaMember: string;
  cert: Cert;
  passDate: string;
}

const CERT_CONFIG: Record<Cert, {
  label: string;
  color: string;
  accent: string;
  icon: string;
  next: Cert | null;
  nextLabel: string | null;
  nextDesc: string | null;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  gradientClass: string;
}> = {
  CRCST: {
    label: "Certified Registered Central Service Technician",
    color: "#0D7377",
    accent: "#14BDAC",
    icon: "🏅",
    next: "CHL",
    nextLabel: "Certified Healthcare Leader (CHL)",
    nextDesc: "Step into leadership. The CHL proves you can manage a sterile processing department, not just work in one.",
    accentClass: "text-[#14BDAC]",
    borderClass: "border-[#14BDAC]",
    bgClass: "bg-[#0D7377]/[0.12]",
    gradientClass: "bg-gradient-to-br from-[#0D7377] to-[#14BDAC]",
  },
  CHL: {
    label: "Certified Healthcare Leader",
    color: "#1A4A8A",
    accent: "#4A90D9",
    icon: "🎖️",
    next: "CER",
    nextLabel: "Certified Endoscope Reprocessor (CER)",
    nextDesc: "Endoscope reprocessing is one of the fastest-growing specialties in SPD. Add CER and become indispensable.",
    accentClass: "text-[#4A90D9]",
    borderClass: "border-[#4A90D9]",
    bgClass: "bg-[#1A4A8A]/[0.12]",
    gradientClass: "bg-gradient-to-br from-[#1A4A8A] to-[#4A90D9]",
  },
  CER: {
    label: "Certified Endoscope Reprocessor",
    color: "#5B2D8E",
    accent: "#9B59D6",
    icon: "🔬",
    next: null,
    nextLabel: null,
    nextDesc: "You've completed all three HSPA certifications available on this platform. You're at the top of your field — consider mentoring the next generation of SPD professionals.",
    accentClass: "text-[#9B59D6]",
    borderClass: "border-[#9B59D6]",
    bgClass: "bg-[#5B2D8E]/[0.12]",
    gradientClass: "bg-gradient-to-br from-[#5B2D8E] to-[#9B59D6]",
  },
};

function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#14BDAC", "#E8A020", "#FFFFFF", "#4A90D9", "#9B59D6", "#E85D04"];
    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number; rotSpeed: number; shape: "rect" | "circle";
    }[] = [];

    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      });
    }

    let frame: number;
    let tick = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy += 0.04;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / (canvas.height * 1.1));
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (tick < 240) frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return canvasRef;
}

function CertBadge({ cert, name, date }: { cert: Cert; name: string; date: string }) {
  const cfg = CERT_CONFIG[cert];
  return (
    <svg
      id="cert-badge-svg"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs mx-auto drop-shadow-2xl"
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={cfg.color} stopOpacity="1" />
          <stop offset="100%" stopColor="#021B3A" stopOpacity="1" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="200" cy="200" r="195" fill="url(#bgGrad)" />
      <circle cx="200" cy="200" r="185" fill="none" stroke={cfg.accent} strokeWidth="2" opacity="0.6" />
      <circle cx="200" cy="200" r="175" fill="none" stroke={cfg.accent} strokeWidth="0.5" opacity="0.3" />

      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const x1 = 200 + 165 * Math.cos(angle);
        const y1 = 200 + 165 * Math.sin(angle);
        const x2 = 200 + 178 * Math.cos(angle);
        const y2 = 200 + 178 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.accent} strokeWidth="2" opacity="0.7" />;
      })}

      <text x="200" y="155" textAnchor="middle" fontSize="64" filter="url(#glow)">{cfg.icon}</text>

      <text x="200" y="215" textAnchor="middle" fontSize="48" fontWeight="900" fontFamily="Georgia, serif"
        fill={cfg.accent} filter="url(#glow)" letterSpacing="6">
        {cert}
      </text>

      <line x1="110" y1="228" x2="290" y2="228" stroke={cfg.accent} strokeWidth="1" opacity="0.5" />

      <text x="200" y="256" textAnchor="middle" fontSize="15" fontFamily="Georgia, serif" fill="white" opacity="0.95">
        {name || "Your Name"}
      </text>

      <text x="200" y="278" textAnchor="middle" fontSize="9" fontFamily="Arial, sans-serif" fill="white" opacity="0.6" letterSpacing="1">
        {cert === "CRCST" ? "CERTIFIED REGISTERED CENTRAL SERVICE TECH" :
         cert === "CHL"   ? "CERTIFIED HEALTHCARE LEADER" :
         cert === "CER"   ? "CERTIFIED ENDOSCOPE REPROCESSOR" :
                            "CERTIFIED INSTRUMENT SPECIALIST"}
      </text>

      <text x="200" y="300" textAnchor="middle" fontSize="10" fontFamily="Arial, sans-serif" fill={cfg.accent} opacity="0.8">
        {date}
      </text>

      <text x="200" y="340" textAnchor="middle" fontSize="9" fontFamily="Arial, sans-serif" fill="white" opacity="0.4" letterSpacing="2">
        SPDCERTPREP.COM
      </text>
      <text x="200" y="356" textAnchor="middle" fontSize="8" fontFamily="Arial, sans-serif" fill="white" opacity="0.3" letterSpacing="1">
        ASEPTIC TECHNICAL SOLUTIONS
      </text>
    </svg>
  );
}

export default function PassedExamFlow() {
  const [step, setStep] = useState<Step>("entry");
  const [cert, setCert] = useState<Cert>("CRCST");
  const [name, setName] = useState("");
  const [hspaMember, setHspaMember] = useState("");
  const [passDate, setPassDate] = useState(
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const confettiRef = useConfetti(step === "celebration");
  const cfg = CERT_CONFIG[cert];

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your full name";
    if (!hspaMember.trim()) e.hspaMember = "Please enter your HSPA member number";
    else if (!/^\d{4,10}$/.test(hspaMember.replace(/\D/g, "")))
      e.hspaMember = "Member number should be 4–10 digits";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("verifying");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStep("entry");
      setErrors({ submit: "Please sign in to claim your badge. Visit the dashboard to create an account." });
      return;
    }

    const { error } = await supabase
      .from("certified_users")
      .insert({
        user_id: user.id,
        full_name: name,
        hspa_member: hspaMember ? true : false,
        hspa_member_number: hspaMember || null,
        cert,
        pass_date: passDate || new Date().toISOString().split("T")[0],
      });

    if (error) {
      setStep("entry");
      if (error.code === "23505") {
        setErrors({ submit: "You have already claimed this certification badge." });
      } else {
        setErrors({ submit: "Something went wrong. Please try again." });
      }
      return;
    }

    setStep("celebration");
  }

  async function handleShare() {
    setSharing(true);
    const text = `🎉 I just passed my ${cert} exam!\n\nCertified ${cfg.label}.\n\nPrepared with SPD Cert Prep — spdcertprep.com\n#SPD #SterileProcessing #${cert} #HealthcareCareers`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `I passed my ${cert}!`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {}
    setSharing(false);
  }

  // ── ENTRY FORM ──────────────────────────────────────────────────────────────
  if (step === "entry") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-[#0D3D5E] to-navy font-serif">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-[2.4rem] font-black text-white tracking-tight leading-tight mb-2">
              You passed your exam!
            </h1>
            <p className="text-[#7B96A8] text-base font-sans">
              Let&apos;s make it official. Enter your details to receive your digital badge.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-[20px] p-8 backdrop-blur-[10px]">
            {/* Cert selector */}
            <div className="mb-6">
              <label className="block text-teal text-xs tracking-[0.1em] mb-[0.6rem] font-sans">
                WHICH CERTIFICATION DID YOU PASS?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["CRCST", "CHL", "CER"] as Cert[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCert(c)}
                    className={`px-3 py-3 rounded-[10px] border-2 text-[0.95rem] cursor-pointer transition-all duration-quick font-serif ${
                      cert === c
                        ? `${CERT_CONFIG[c].bgClass} ${CERT_CONFIG[c].borderClass} ${CERT_CONFIG[c].accentClass} font-bold`
                        : "bg-transparent border-white/10 text-[#7B96A8] hover:border-white/25"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="block text-teal text-xs tracking-[0.1em] mb-[0.6rem] font-sans">
                YOUR FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({}); }}
                placeholder="Jane Smith"
                className={`w-full px-4 py-[0.85rem] rounded-[10px] border-2 bg-white/[0.05] text-white text-base font-sans outline-none box-border placeholder:text-white/30 ${
                  errors.name ? "border-[#E85D04]" : "border-white/12 focus:border-white/30"
                }`}
              />
              {errors.name && <p className="text-[#E85D04] text-[0.8rem] mt-1 font-sans">{errors.name}</p>}
            </div>

            {/* HSPA # */}
            <div className="mb-5">
              <label className="block text-teal text-xs tracking-[0.1em] mb-[0.6rem] font-sans">
                HSPA MEMBER NUMBER
              </label>
              <input
                type="text"
                value={hspaMember}
                onChange={(e) => { setHspaMember(e.target.value); setErrors({}); }}
                placeholder="e.g. 123456"
                className={`w-full px-4 py-[0.85rem] rounded-[10px] border-2 bg-white/[0.05] text-white text-base font-sans outline-none box-border placeholder:text-white/30 ${
                  errors.hspaMember ? "border-[#E85D04]" : "border-white/12 focus:border-white/30"
                }`}
              />
              {errors.hspaMember
                ? <p className="text-[#E85D04] text-[0.8rem] mt-1 font-sans">{errors.hspaMember}</p>
                : <p className="text-[#7B96A8] text-[0.78rem] mt-1 font-sans">Found on your HSPA membership card or at hspa.com</p>
              }
            </div>

            {/* Pass date */}
            <div className="mb-7">
              <label className="block text-teal text-xs tracking-[0.1em] mb-[0.6rem] font-sans">
                DATE YOU PASSED
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value + "T12:00:00");
                  setPassDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
                }}
                className="w-full px-4 py-[0.85rem] rounded-[10px] border-2 border-white/12 bg-white/[0.05] text-white text-base font-sans outline-none box-border [color-scheme:dark]"
              />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="bg-[#E85D04]/15 border border-[#E85D04]/40 rounded-[10px] px-4 py-[0.85rem] mb-4">
                <p className="text-[#E85D04] text-[0.88rem] m-0 font-sans">{errors.submit}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className={`w-full py-4 rounded-xl border-none text-white text-[1.05rem] font-bold cursor-pointer tracking-[0.03em] font-sans transition-all duration-quick ${cfg.gradientClass}`}
              style={{ boxShadow: `0 4px 20px ${cfg.accent}40` }}
            >
              Claim My {cert} Badge →
            </button>

            <p className="text-center text-[#7B96A8] text-xs mt-4 font-sans">
              Your badge is yours to download and share on LinkedIn
            </p>

            <Link
              href="/"
              className="block text-center text-[#7B96A8] text-[0.85rem] mt-6 font-sans no-underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── VERIFYING ───────────────────────────────────────────────────────────────
  if (step === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-[#0D3D5E] to-navy">
        <div className="text-center px-4">
          <div
            className="w-20 h-20 rounded-full border-4 border-t-transparent mx-auto mb-8 animate-spin"
            style={{ borderColor: `${cfg.accent} transparent transparent transparent` }}
          />
          <p className="text-white text-[1.1rem] font-serif">Verifying your certification…</p>
          <p className="text-[#7B96A8] text-[0.85rem] mt-2 font-sans">Generating your badge</p>
        </div>
      </div>
    );
  }

  // ── CELEBRATION ─────────────────────────────────────────────────────────────
  if (step === "celebration") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-navy via-[#0D3D5E_40%] to-navy font-serif">
        <canvas ref={confettiRef} className="absolute inset-0 pointer-events-none z-10" />

        <div className="relative z-20 max-w-2xl mx-auto px-4 py-10 text-center">
          {/* Headline badge */}
          <div className="mb-2">
            <span className={`inline-block ${cfg.bgClass} border ${cfg.borderClass}/50 rounded-full px-5 py-1 text-xs ${cfg.accentClass} tracking-[0.12em] font-sans mb-4`}>
              CERTIFIED ✓
            </span>
          </div>

          <h1 className="text-[clamp(2rem,5vw,3rem)] font-black text-white leading-tight mb-3">
            Congratulations,<br />
            <span className={cfg.accentClass}>{name}!</span>
          </h1>

          <p className="text-[#A0BCD0] text-base mb-10 font-sans">
            You are now a <strong className="text-white">{cert}</strong> — {cfg.label}.
            <br />This is a real achievement. Be proud of it.
          </p>

          {/* Badge with glow */}
          <div className="max-w-[280px] mx-auto mb-8 relative">
            <div
              className="absolute inset-[-20px] rounded-full opacity-60 animate-pulse"
              style={{ background: `radial-gradient(circle, ${cfg.accent}30 0%, transparent 70%)` }}
            />
            <style>{`
              @keyframes badgeDrop { from{opacity:0;transform:translateY(-30px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }
              @keyframes shimmer { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>
            <div className="[animation:badgeDrop_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
              <CertBadge cert={cert} name={name} date={passDate} />
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Certification", value: cert },
              { label: "Member #", value: hspaMember },
              { label: "Date Earned", value: passDate.split(",")[0] },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/[0.08] rounded-xl py-4 px-2">
                <div className={`text-[1.1rem] font-bold ${cfg.accentClass}`}>{s.value}</div>
                <div className="text-[#7B96A8] text-[0.7rem] tracking-[0.08em] font-sans mt-1">{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-[0.9rem] max-w-[380px] mx-auto mb-8">
            <button
              onClick={handleShare}
              disabled={sharing}
              className={`w-full py-4 rounded-xl border-none text-white text-base font-bold cursor-pointer font-sans transition-all duration-quick flex items-center justify-center gap-2 ${cfg.gradientClass}`}
              style={{ boxShadow: `0 4px 20px ${cfg.accent}40` }}
            >
              {copied ? "✓ Copied to clipboard!" : sharing ? "Sharing…" : "🔗 Share on LinkedIn"}
            </button>

            {cfg.next && (
              <button
                onClick={() => setStep("next_cert")}
                className={`w-full py-4 rounded-xl border-2 ${cfg.borderClass}/50 bg-white/[0.04] text-white text-base font-semibold cursor-pointer font-sans transition-all duration-quick hover:bg-white/[0.08]`}
              >
                🎯 Start my next certification
              </button>
            )}

            <Link
              href="/"
              className="block py-[0.8rem] rounded-xl border border-white/15 bg-white/[0.05] text-white text-[0.9rem] cursor-pointer font-sans no-underline text-center hover:bg-white/[0.08] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Quote */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-[14px] p-6 max-w-[480px] mx-auto">
            <p className="text-[#A0BCD0] text-[0.95rem] italic leading-relaxed m-0">
              "Every instrument you process, every patient protected —
              that&apos;s what this certification means. The work you do every day saves lives."
            </p>
            <p className={`${cfg.accentClass} text-[0.78rem] mt-3 tracking-[0.08em] font-sans`}>
              — ASEPTIC TECHNICAL SOLUTIONS
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── NEXT CERT ────────────────────────────────────────────────────────────────
  if (step === "next_cert" && cfg.next) {
    const nextCfg = CERT_CONFIG[cfg.next];
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy via-[#0D3D5E] to-navy font-serif">
        <div className="w-full max-w-lg text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-[0.6rem] mb-8">
            <span className={`${cfg.bgClass} border ${cfg.borderClass} rounded-full px-3 py-1 ${cfg.accentClass} text-[0.8rem] font-sans`}>
              {cert} ✓
            </span>
            <span className="text-[#7B96A8] text-[1.2rem]">→</span>
            <span className={`${nextCfg.bgClass} border ${nextCfg.borderClass} rounded-full px-3 py-1 ${nextCfg.accentClass} text-[0.8rem] font-sans`}>
              {cfg.next}
            </span>
          </div>

          <h1 className="text-[2.2rem] font-black text-white mb-4 leading-tight">
            Ready for your<br />
            <span className={nextCfg.accentClass}>next level?</span>
          </h1>

          <p className="text-[#A0BCD0] text-base mb-10 leading-relaxed font-sans">{cfg.nextDesc}</p>

          {/* Next cert card */}
          <div className={`${nextCfg.bgClass} border-2 ${nextCfg.borderClass}/40 rounded-[20px] p-8 mb-8`}>
            <div className="text-[3.5rem] mb-3">{nextCfg.icon}</div>
            <div className={`${nextCfg.accentClass} text-[2rem] font-black tracking-[0.08em] mb-2`}>
              {cfg.next}
            </div>
            <div className="text-white text-[0.95rem] font-sans opacity-85">{cfg.nextLabel}</div>

            <div className="mt-6 text-left">
              {[
                `Full ${cfg.next} question bank`,
                "Chapter-by-chapter study mode",
                "AI Study Chat — ask anything",
                "Exam tips and domain mastery tracking",
                "Badge when you pass",
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-[0.6rem] py-2 ${i < 4 ? "border-b border-white/[0.05]" : ""}`}>
                  <span className={`${nextCfg.accentClass} text-[0.9rem]`}>✓</span>
                  <span className="text-[#D0E4EE] text-[0.88rem] font-sans">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-[0.9rem] max-w-[380px] mx-auto">
            {cfg.next && (
              <button
                onClick={() => window.location.href = `/${cfg.next!.toLowerCase()}`}
                className={`w-full py-[1.1rem] rounded-xl border-none text-white text-[1.05rem] font-bold cursor-pointer font-sans ${nextCfg.gradientClass}`}
                style={{ boxShadow: `0 4px 24px ${nextCfg.accent}50` }}
              >
                Start {cfg.next} Prep Now →
              </button>
            )}

            <button
              onClick={() => setStep("celebration")}
              className="w-full py-[0.8rem] rounded-xl border-none bg-transparent text-[#7B96A8] text-[0.9rem] cursor-pointer font-sans hover:text-white transition-colors"
            >
              ← Back to my badge
            </button>
          </div>

          <p className="text-[#7B96A8] text-[0.78rem] mt-8 font-sans leading-relaxed">
            Need facility-wide training?{" "}
            <a href="https://aseptictechnicalsolutions.com" className={`${cfg.accentClass} no-underline`}>
              Aseptic Technical Solutions
            </a>{" "}
            offers on-site certification prep and compliance training for SPD departments.
          </p>

          {/* Resume Service Upsell */}
          <div className="mt-8 p-6 rounded-2xl bg-[#E8A020]/[0.07] border border-[#E8A020]/35 text-left">
            <div className="text-xs tracking-[0.12em] text-[#E8A020] font-mono mb-[0.6rem]">
              CAREER NEXT STEP
            </div>
            <h3 className="text-[1.15rem] font-extrabold text-white font-serif mb-3 leading-snug">
              You passed. Now land the job.
            </h3>
            <ul className="list-none p-0 m-0 mb-5 flex flex-col gap-2">
              {[
                `Highlight your new ${cert} certification`,
                "ATS-optimized for healthcare & SPD roles",
                "87% of clients land interviews",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[#C8D8E0] text-[0.88rem] font-sans">
                  <span className="text-[#E8A020] flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="https://www.myqualifiedresume.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-[1.4rem] py-[0.7rem] rounded-[10px] bg-gradient-to-br from-[#E8A020] to-[#DAA520] text-navy font-bold text-[0.88rem] no-underline font-sans"
            >
              Get My Resume – Starting at $29 →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
