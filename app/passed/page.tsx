"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label, Heading } from "@/components/ui/typography";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Cert = "CRCST" | "CHL" | "CER";
type Step = "entry" | "verifying" | "celebration" | "next_cert";

interface PassedData {
  name: string;
  hspaMember: string;
  cert: Cert;
  passDate: string;
}

// ─── CERT CONFIG ──────────────────────────────────────────────────────────────
const CERT_CONFIG: Record<Cert, {
  label: string;
  color: string;
  accent: string;
  icon: string;
  next: Cert | null;
  nextLabel: string | null;
  nextDesc: string | null;
}> = {
  CRCST: {
    label: "Certified Registered Central Service Technician",
    color: "#0D7377",
    accent: "#14BDAC",
    icon: "🏅",
    next: "CHL",
    nextLabel: "Certified Healthcare Leader (CHL)",
    nextDesc: "Step into leadership. The CHL proves you can manage a sterile processing department, not just work in one.",
  },
  CHL: {
    label: "Certified Healthcare Leader",
    color: "#1A4A8A",
    accent: "#4A90D9",
    icon: "🎖️",
    next: "CER",
    nextLabel: "Certified Endoscope Reprocessor (CER)",
    nextDesc: "Endoscope reprocessing is one of the fastest-growing specialties in SPD. Add CER and become indispensable.",
  },
  CER: {
    label: "Certified Endoscope Reprocessor",
    color: "#5B2D8E",
    accent: "#9B59D6",
    icon: "🔬",
    next: null,
    nextLabel: null,
    nextDesc: "You've completed all three HSPA certifications available on this platform. You're at the top of your field — consider mentoring the next generation of SPD professionals.",
  },
};

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
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

// ─── BADGE SVG ────────────────────────────────────────────────────────────────
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

      {/* Background circle */}
      <circle cx="200" cy="200" r="195" fill="url(#bgGrad)" />
      <circle cx="200" cy="200" r="185" fill="none" stroke={cfg.accent} strokeWidth="2" opacity="0.6" />
      <circle cx="200" cy="200" r="175" fill="none" stroke={cfg.accent} strokeWidth="0.5" opacity="0.3" />

      {/* Star burst ring */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const x1 = 200 + 165 * Math.cos(angle);
        const y1 = 200 + 165 * Math.sin(angle);
        const x2 = 200 + 178 * Math.cos(angle);
        const y2 = 200 + 178 * Math.sin(angle);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={cfg.accent} strokeWidth="2" opacity="0.7" />;
      })}

      {/* Icon */}
      <text x="200" y="155" textAnchor="middle" fontSize="64" filter="url(#glow)">
        {cfg.icon}
      </text>

      {/* Cert abbreviation */}
      <text
        x="200" y="215"
        textAnchor="middle"
        fontSize="48"
        fontWeight="900"
        fontFamily="Georgia, serif"
        fill={cfg.accent}
        filter="url(#glow)"
        letterSpacing="6"
      >
        {cert}
      </text>

      {/* Divider line */}
      <line x1="110" y1="228" x2="290" y2="228" stroke={cfg.accent} strokeWidth="1" opacity="0.5" />

      {/* Name */}
      <text x="200" y="256" textAnchor="middle" fontSize="15" fontFamily="Georgia, serif" fill="white" opacity="0.95">
        {name || "Your Name"}
      </text>

      {/* Full cert label */}
      <text x="200" y="278" textAnchor="middle" fontSize="9" fontFamily="Arial, sans-serif" fill="white" opacity="0.6" letterSpacing="1">
        {cert === "CRCST" ? "CERTIFIED REGISTERED CENTRAL SERVICE TECH" :
         cert === "CHL"   ? "CERTIFIED HEALTHCARE LEADER" :
         cert === "CER"   ? "CERTIFIED ENDOSCOPE REPROCESSOR" :
                            "CERTIFIED INSTRUMENT SPECIALIST"}
      </text>

      {/* Date */}
      <text x="200" y="300" textAnchor="middle" fontSize="10" fontFamily="Arial, sans-serif" fill={cfg.accent} opacity="0.8">
        {date}
      </text>

      {/* Branding */}
      <text x="200" y="340" textAnchor="middle" fontSize="9" fontFamily="Arial, sans-serif" fill="white" opacity="0.4" letterSpacing="2">
        SPDCERTPREP.COM
      </text>
      <text x="200" y="356" textAnchor="middle" fontSize="8" fontFamily="Arial, sans-serif" fill="white" opacity="0.3" letterSpacing="1">
        ASEPTIC TECHNICAL SOLUTIONS
      </text>
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PassedExamFlow() {
  const [step, setStep] = useState<Step>("entry");
  const [cert, setCert] = useState<Cert>("CRCST");
  const [name, setName] = useState("");
  const [hspaMember, setHspaMember] = useState("");
  const [passDate, setPassDate] = useState(
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
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
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep("verifying");

    const { data: { user } } = await supabase.auth.getUser();

    // User must be authenticated to claim badge
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

    // Fetch username for public profile link
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profile?.username) setUsername(profile.username);

    setStep("celebration");
  }

  function getProfileUrl() {
    return username ? `https://spdcertprep.com/u/${username}` : "https://spdcertprep.com";
  }

  function getLinkedInShareUrl() {
    const profileUrl = encodeURIComponent(getProfileUrl());
    const title = encodeURIComponent(`I just passed my ${cert} certification!`);
    const summary = encodeURIComponent(
      `Proud to share that I'm now a ${cfg.label} (${cert}). Prepared with SPD Cert Prep. #SPD #SterileProcessing #${cert} #HealthcareCareers`
    );
    return `https://www.linkedin.com/sharing/share-offsite/?url=${profileUrl}&title=${title}&summary=${summary}`;
  }

  function handleShare() {
    const url = getLinkedInShareUrl();
    const popup = window.open(url, "_blank", "noopener,noreferrer,width=600,height=600");
    if (!popup) {
      window.location.href = url;
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(getProfileUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {}
  }

  // ── ENTRY FORM ──────────────────────────────────────────────────────────────
  if (step === "entry") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 font-display"
        style={{ background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)" }}
      >
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <Heading as="h1" size="3xl" className="text-white mb-2 tracking-[-0.02em]">
              You passed your exam!
            </Heading>
            <p className="text-[#7B96A8] text-base font-sans">
              Let&apos;s make it official. Enter your details to receive your digital badge.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/[4%] border border-white/10 rounded-[20px] p-8 backdrop-blur-[10px]">

            {/* Cert selector */}
            <div className="mb-6">
              <Label color="teal" className="mb-[0.6rem]">Which certification did you pass?</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["CRCST", "CHL", "CER"] as Cert[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCert(c)}
                    className="px-3 py-3 rounded-[10px] cursor-pointer transition-all duration-200 font-display text-[0.95rem]"
                    style={{
                      border: cert === c ? `2px solid ${CERT_CONFIG[c].accent}` : "2px solid rgba(255,255,255,0.1)",
                      background: cert === c ? `${CERT_CONFIG[c].color}33` : "transparent",
                      color: cert === c ? CERT_CONFIG[c].accent : "#7B96A8",
                      fontWeight: cert === c ? "700" : "400",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <Label color="teal" className="mb-[0.6rem]">Your full name</Label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({}); }}
                placeholder="Jane Smith"
                className="w-full px-4 py-[0.85rem] rounded-[10px] bg-white/5 text-white text-base font-sans outline-none box-border"
                style={{
                  border: errors.name ? "2px solid #E85D04" : "2px solid rgba(255,255,255,0.12)",
                }}
              />
              {errors.name && <p className="text-[#E85D04] text-[0.8rem] mt-[0.3rem] font-sans">{errors.name}</p>}
            </div>

            {/* HSPA # */}
            <div className="mb-5">
              <Label color="teal" className="mb-[0.6rem]">HSPA member number</Label>
              <input
                type="text"
                value={hspaMember}
                onChange={(e) => { setHspaMember(e.target.value); setErrors({}); }}
                placeholder="e.g. 123456"
                className="w-full px-4 py-[0.85rem] rounded-[10px] bg-white/5 text-white text-base font-sans outline-none box-border"
                style={{
                  border: errors.hspaMember ? "2px solid #E85D04" : "2px solid rgba(255,255,255,0.12)",
                }}
              />
              {errors.hspaMember
                ? <p className="text-[#E85D04] text-[0.8rem] mt-[0.3rem] font-sans">{errors.hspaMember}</p>
                : <p className="text-[#7B96A8] text-[0.78rem] mt-[0.35rem] font-sans">Found on your HSPA membership card or at hspa.com</p>
              }
            </div>

            {/* Pass date */}
            <div className="mb-7">
              <Label color="teal" className="mb-[0.6rem]">Date you passed</Label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value + "T12:00:00");
                  setPassDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
                }}
                className="w-full px-4 py-[0.85rem] rounded-[10px] border-2 border-white/[12%] bg-white/5 text-white text-base font-sans outline-none box-border"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="bg-[#E85D04]/15 border border-[#E85D04]/40 rounded-[10px] px-4 py-[0.85rem] mb-4">
                <p className="text-[#E85D04] text-[0.88rem] m-0 font-sans">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl text-[1.05rem] font-bold tracking-[0.03em] font-sans"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
                boxShadow: `0 4px 20px ${cfg.accent}40`,
              }}
            >
              Claim My {cert} Badge →
            </Button>

            <p className="text-center text-[#7B96A8] text-xs mt-4 font-sans">
              Your badge is yours to download and share on LinkedIn
            </p>

            {/* Back to Home link */}
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)" }}
      >
        <div className="text-center px-4">
          <div
            className="w-20 h-20 rounded-full border-4 border-t-transparent mx-auto mb-8 animate-spin"
            style={{ borderColor: `${cfg.accent} transparent transparent transparent` }}
          />
          <p className="text-white text-lg font-display">
            Verifying your certification…
          </p>
          <p className="text-[#7B96A8] text-[0.85rem] mt-2 font-sans">
            Generating your badge
          </p>
        </div>
      </div>
    );
  }

  // ── CELEBRATION ─────────────────────────────────────────────────────────────
  if (step === "celebration") {
    return (
      <div
        className="min-h-screen relative overflow-hidden font-display"
        style={{ background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 40%, #021B3A 100%)" }}
      >
        {/* Confetti canvas */}
        <canvas
          ref={confettiRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        />

        <div className="relative z-20 max-w-2xl mx-auto px-4 py-10 text-center">

          {/* Headline */}
          <div className="mb-2">
            <span
              className="inline-block rounded-full px-5 py-[0.3rem] text-xs tracking-[0.12em] font-sans mb-4"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}40, ${cfg.accent}40)`,
                border: `1px solid ${cfg.accent}50`,
                color: cfg.accent,
              }}
            >
              CERTIFIED ✓
            </span>
          </div>

          <Heading as="h1" size="3xl" className="text-white mb-3 text-[clamp(2rem,5vw,3rem)]">
            Congratulations,<br />
            <span style={{ color: cfg.accent }}>{name}!</span>
          </Heading>

          <p className="text-[#A0BCD0] text-base mb-10 font-sans">
            You are now a <strong className="text-white">{cert}</strong> — {cfg.label}.
            <br />This is a real achievement. Be proud of it.
          </p>

          {/* Badge */}
          <div className="max-w-[280px] mx-auto mb-8 relative">
            {/* Glow effect behind badge */}
            <div
              className="absolute rounded-full animate-pulse"
              style={{
                inset: "-20px",
                background: `radial-gradient(circle, ${cfg.accent}30 0%, transparent 70%)`,
              }}
            />
            {/* Shimmer ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: "-8px",
                border: "2px solid transparent",
                background: `linear-gradient(90deg, transparent, ${cfg.accent}60, transparent) border-box`,
                WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "shimmer 2s linear infinite",
              }}
            />
            <style>{`
              @keyframes badgeDrop { from{opacity:0;transform:translateY(-30px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }
              @keyframes shimmer { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>
            <div style={{ animation: "badgeDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
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
              <div key={i} className="bg-white/[4%] border border-white/[8%] rounded-xl py-4 px-2">
                <div className="font-bold text-lg font-display" style={{ color: cfg.accent }}>{s.value}</div>
                <div className="text-[#7B96A8] text-[0.7rem] tracking-[0.08em] font-sans mt-[0.2rem] uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-[0.9rem] max-w-[380px] mx-auto mb-8">

            {/* LinkedIn Share */}
            <Button
              onClick={handleShare}
              className="w-full py-4 rounded-xl text-base font-bold font-sans flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
                boxShadow: `0 4px 20px ${cfg.accent}40`,
              }}
            >
              🔗 Share on LinkedIn
            </Button>

            {/* Copy profile link */}
            {username && (
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="w-full py-[0.85rem] rounded-xl text-[0.9rem] font-sans flex items-center justify-center gap-2"
                style={{ borderColor: `${cfg.accent}40` }}
              >
                {copiedLink ? "✓ Link copied!" : `📋 Copy profile link — spdcertprep.com/u/${username}`}
              </Button>
            )}

            {/* View public profile */}
            {username && (
              <Button asChild variant="ghost" className="w-full py-[0.85rem] rounded-xl text-[0.88rem] font-sans text-white/60 border border-white/10">
                <a href={`/u/${username}`} className="flex items-center justify-center gap-2">
                  👤 View my public profile
                </a>
              </Button>
            )}

            {/* Next cert */}
            {cfg.next && (
              <Button
                onClick={() => setStep("next_cert")}
                variant="outline"
                className="w-full py-4 rounded-xl text-base font-semibold font-sans"
                style={{ borderColor: `${cfg.accent}50` }}
              >
                🎯 Start my next certification
              </Button>
            )}

            {/* Return home */}
            <Button asChild variant="ghost" className="w-full py-[0.8rem] rounded-xl text-[0.9rem] font-sans border border-white/[15%] bg-white/5 text-white">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>

          {/* Encouragement quote */}
          <div className="bg-white/[3%] border border-white/[6%] rounded-[14px] p-6 max-w-[480px] mx-auto">
            <p className="text-[#A0BCD0] text-[0.95rem] italic leading-[1.6] m-0 font-display">
              "Every instrument you process, every patient protected —
              that's what this certification means. The work you do every day saves lives."
            </p>
            <p className="text-[0.78rem] mt-3 tracking-[0.08em] font-sans" style={{ color: cfg.accent }}>
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
      <div
        className="min-h-screen flex items-center justify-center p-4 font-display"
        style={{ background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)" }}
      >
        <div className="w-full max-w-lg text-center">

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-[0.6rem] mb-8">
            <span
              className="rounded-full px-[0.8rem] py-1 text-[0.8rem] font-sans"
              style={{
                background: `${cfg.color}40`,
                border: `1px solid ${cfg.accent}`,
                color: cfg.accent,
              }}
            >
              {cert} ✓
            </span>
            <span className="text-[#7B96A8] text-xl">→</span>
            <span
              className="rounded-full px-[0.8rem] py-1 text-[0.8rem] font-sans"
              style={{
                background: `${nextCfg.color}30`,
                border: `1px solid ${nextCfg.accent}`,
                color: nextCfg.accent,
              }}
            >
              {cfg.next}
            </span>
          </div>

          <Heading as="h1" size="3xl" className="text-white mb-4 text-[2.2rem]">
            Ready for your<br />
            <span style={{ color: nextCfg.accent }}>next level?</span>
          </Heading>

          <p className="text-[#A0BCD0] text-base mb-10 leading-[1.6] font-sans">
            {cfg.nextDesc}
          </p>

          {/* Next cert card */}
          <div
            className="rounded-[20px] p-8 mb-8"
            style={{
              background: `linear-gradient(135deg, ${nextCfg.color}20, ${nextCfg.accent}10)`,
              border: `2px solid ${nextCfg.accent}40`,
            }}
          >
            <div className="text-[3.5rem] mb-3">{nextCfg.icon}</div>
            <div className="text-[2rem] font-black tracking-[0.08em] mb-2 font-display" style={{ color: nextCfg.accent }}>
              {cfg.next}
            </div>
            <div className="text-white text-[0.95rem] font-sans opacity-85">
              {cfg.nextLabel}
            </div>

            {/* What's included */}
            <div className="mt-6 text-left">
              {[
                `Full ${cfg.next} question bank`,
                "Chapter-by-chapter study mode",
                "AI Study Chat — ask anything",
                "Exam tips and domain mastery tracking",
                "Badge when you pass",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[0.6rem] py-2 font-sans"
                  style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <span className="text-[0.9rem]" style={{ color: nextCfg.accent }}>✓</span>
                  <span className="text-[#D0E4EE] text-[0.88rem]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-[0.9rem] max-w-[380px] mx-auto">
            {cfg.next && (
              <Button
                onClick={() => window.location.href = `/${cfg.next!.toLowerCase()}`}
                className="w-full py-[1.1rem] rounded-xl text-[1.05rem] font-bold font-sans"
                style={{
                  background: `linear-gradient(135deg, ${nextCfg.color}, ${nextCfg.accent})`,
                  boxShadow: `0 4px 24px ${nextCfg.accent}50`,
                }}
              >
                Start {cfg.next} Prep Now →
              </Button>
            )}

            <Button
              onClick={() => setStep("celebration")}
              variant="ghost"
              className="w-full py-[0.8rem] rounded-xl text-[0.9rem] font-sans text-[#7B96A8]"
            >
              ← Back to my badge
            </Button>
          </div>

          {/* ATS mention */}
          <p className="text-[#7B96A8] text-[0.78rem] mt-8 font-sans leading-[1.5]">
            Need facility-wide training?{" "}
            <a href="https://aseptictechnicalsolutions.com" className="no-underline" style={{ color: cfg.accent }}>
              Aseptic Technical Solutions
            </a>{" "}
            offers on-site certification prep and compliance training for SPD departments.
          </p>

          {/* Resume Service Upsell */}
          <div className="mt-8 p-6 rounded-2xl bg-amber/[7%] border border-amber/35 text-left">
            <Label color="amber" className="mb-[0.6rem]">Career Next Step</Label>
            <h3 className="text-lg font-black text-white font-display mb-3 leading-[1.3]">
              You passed. Now land the job.
            </h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2 mb-5 font-sans">
              {[
                `Highlight your new ${cert} certification`,
                "ATS-optimized for healthcare & SPD roles",
                "87% of clients land interviews",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[#C8D8E0] text-[0.88rem]">
                  <span className="text-amber flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant="amber"
              className="rounded-[10px] text-[0.88rem] font-bold font-sans"
            >
              <a
                href="https://www.myqualifiedresume.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get My Resume – Starting at $29 →
              </a>
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
