"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Cert = "CRCST" | "CHL" | "CER" | "CIS";
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
    next: "CIS",
    nextLabel: "Certified Instrument Specialist (CIS)",
    nextDesc: "Surgical instruments are complex. CIS proves you understand them at the highest level.",
  },
  CIS: {
    label: "Certified Instrument Specialist",
    color: "#8B2500",
    accent: "#E85D04",
    icon: "⚕️",
    next: null,
    nextLabel: null,
    nextDesc: "You've earned the full stack. Share your expertise — consider teaching or mentoring the next generation.",
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
        hspa_member: hspaMember,
        cert,
        pass_date: new Date().toISOString().split("T")[0],
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)",
        fontFamily: "'Georgia', serif",
      }}>
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h1 style={{
              fontSize: "2.4rem",
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "0.5rem",
            }}>
              You passed your exam!
            </h1>
            <p style={{ color: "#7B96A8", fontSize: "1rem", fontFamily: "Calibri, sans-serif" }}>
              Let's make it official. Enter your details to receive your digital badge.
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "2rem",
            backdropFilter: "blur(10px)",
          }}>

            {/* Cert selector */}
            <div className="mb-6">
              <label style={{ display: "block", color: "#14BDAC", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "0.6rem", fontFamily: "Calibri, sans-serif" }}>
                WHICH CERTIFICATION DID YOU PASS?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["CRCST", "CHL", "CER", "CIS"] as Cert[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCert(c)}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "10px",
                      border: cert === c ? `2px solid ${CERT_CONFIG[c].accent}` : "2px solid rgba(255,255,255,0.1)",
                      background: cert === c ? `${CERT_CONFIG[c].color}33` : "transparent",
                      color: cert === c ? CERT_CONFIG[c].accent : "#7B96A8",
                      fontWeight: cert === c ? "700" : "400",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label style={{ display: "block", color: "#14BDAC", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "0.6rem", fontFamily: "Calibri, sans-serif" }}>
                YOUR FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({}); }}
                placeholder="Jane Smith"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  border: errors.name ? "2px solid #E85D04" : "2px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontFamily: "Calibri, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.name && <p style={{ color: "#E85D04", fontSize: "0.8rem", marginTop: "0.3rem", fontFamily: "Calibri, sans-serif" }}>{errors.name}</p>}
            </div>

            {/* HSPA # */}
            <div className="mb-5">
              <label style={{ display: "block", color: "#14BDAC", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "0.6rem", fontFamily: "Calibri, sans-serif" }}>
                HSPA MEMBER NUMBER
              </label>
              <input
                type="text"
                value={hspaMember}
                onChange={(e) => { setHspaMember(e.target.value); setErrors({}); }}
                placeholder="e.g. 123456"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  border: errors.hspaMember ? "2px solid #E85D04" : "2px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontFamily: "Calibri, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.hspaMember
                ? <p style={{ color: "#E85D04", fontSize: "0.8rem", marginTop: "0.3rem", fontFamily: "Calibri, sans-serif" }}>{errors.hspaMember}</p>
                : <p style={{ color: "#7B96A8", fontSize: "0.78rem", marginTop: "0.35rem", fontFamily: "Calibri, sans-serif" }}>Found on your HSPA membership card or at hspa.com</p>
              }
            </div>

            {/* Pass date */}
            <div className="mb-7">
              <label style={{ display: "block", color: "#14BDAC", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "0.6rem", fontFamily: "Calibri, sans-serif" }}>
                DATE YOU PASSED
              </label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  const d = new Date(e.target.value + "T12:00:00");
                  setPassDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
                }}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  border: "2px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontFamily: "Calibri, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  colorScheme: "dark",
                }}
              />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div style={{
                background: "rgba(232,93,4,0.15)",
                border: "1px solid rgba(232,93,4,0.4)",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                marginBottom: "1rem",
              }}>
                <p style={{ color: "#E85D04", fontSize: "0.88rem", margin: 0, fontFamily: "Calibri, sans-serif" }}>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
                color: "#FFFFFF",
                fontSize: "1.05rem",
                fontWeight: "700",
                cursor: "pointer",
                letterSpacing: "0.03em",
                fontFamily: "Calibri, sans-serif",
                boxShadow: `0 4px 20px ${cfg.accent}40`,
                transition: "all 0.2s",
              }}
            >
              Claim My {cert} Badge →
            </button>

            <p style={{ textAlign: "center", color: "#7B96A8", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "Calibri, sans-serif" }}>
              Your badge is yours to download and share on LinkedIn
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── VERIFYING ───────────────────────────────────────────────────────────────
  if (step === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)",
      }}>
        <div className="text-center px-4">
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            border: `4px solid ${cfg.accent}`,
            borderTopColor: "transparent",
            margin: "0 auto 2rem",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#FFFFFF", fontSize: "1.1rem", fontFamily: "Georgia, serif" }}>
            Verifying your certification…
          </p>
          <p style={{ color: "#7B96A8", fontSize: "0.85rem", marginTop: "0.5rem", fontFamily: "Calibri, sans-serif" }}>
            Generating your badge
          </p>
        </div>
      </div>
    );
  }

  // ── CELEBRATION ─────────────────────────────────────────────────────────────
  if (step === "celebration") {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 40%, #021B3A 100%)",
        fontFamily: "Georgia, serif",
      }}>
        {/* Confetti canvas */}
        <canvas
          ref={confettiRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        />

        <div className="relative z-20 max-w-2xl mx-auto px-4 py-10 text-center">

          {/* Headline */}
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${cfg.color}40, ${cfg.accent}40)`,
              border: `1px solid ${cfg.accent}50`,
              borderRadius: "100px",
              padding: "0.3rem 1.2rem",
              fontSize: "0.75rem",
              color: cfg.accent,
              letterSpacing: "0.12em",
              fontFamily: "Calibri, sans-serif",
              marginBottom: "1rem",
            }}>
              CERTIFIED ✓
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "900",
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "0.75rem",
          }}>
            Congratulations,<br />
            <span style={{ color: cfg.accent }}>{name}!</span>
          </h1>

          <p style={{ color: "#A0BCD0", fontSize: "1rem", marginBottom: "2.5rem", fontFamily: "Calibri, sans-serif" }}>
            You are now a <strong style={{ color: "#FFFFFF" }}>{cert}</strong> — {cfg.label}.
            <br />This is a real achievement. Be proud of it.
          </p>

          {/* Badge */}
          <div style={{ maxWidth: 280, margin: "0 auto 2rem", position: "relative" }}>
            {/* Glow effect behind badge */}
            <div style={{
              position: "absolute", inset: "-20px",
              background: `radial-gradient(circle, ${cfg.accent}30 0%, transparent 70%)`,
              borderRadius: "50%",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <style>{`
              @keyframes pulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
              @keyframes badgeDrop { from{opacity:0;transform:translateY(-30px) scale(0.85)} to{opacity:1;transform:translateY(0) scale(1)} }
            `}</style>
            <div style={{ animation: "badgeDrop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
              <CertBadge cert={cert} name={name} date={passDate} />
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}>
            {[
              { label: "Certification", value: cert },
              { label: "Member #", value: hspaMember },
              { label: "Date Earned", value: passDate.split(",")[0] },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "1rem 0.5rem",
              }}>
                <div style={{ color: cfg.accent, fontSize: "1.1rem", fontWeight: "700" }}>{s.value}</div>
                <div style={{ color: "#7B96A8", fontSize: "0.7rem", letterSpacing: "0.08em", fontFamily: "Calibri, sans-serif", marginTop: "0.2rem" }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: 380, margin: "0 auto 2rem" }}>

            {/* Share */}
            <button
              onClick={handleShare}
              disabled={sharing}
              style={{
                padding: "1rem",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${cfg.color}, ${cfg.accent})`,
                color: "#FFFFFF",
                fontSize: "1rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
                boxShadow: `0 4px 20px ${cfg.accent}40`,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {copied ? "✓ Copied to clipboard!" : sharing ? "Sharing…" : "🔗 Share on LinkedIn"}
            </button>

            {/* Next cert */}
            {cfg.next && (
              <button
                onClick={() => setStep("next_cert")}
                style={{
                  padding: "1rem",
                  borderRadius: "12px",
                  border: `2px solid ${cfg.accent}50`,
                  background: "rgba(255,255,255,0.04)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "Calibri, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                🎯 Start my next certification
              </button>
            )}

            {/* Return home */}
            <button
              onClick={() => window.location.href = "/"}
              style={{
                padding: "0.8rem",
                borderRadius: "12px",
                border: "none",
                background: "transparent",
                color: "#7B96A8",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
              }}
            >
              ← Back to dashboard
            </button>
          </div>

          {/* Encouragement quote */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "1.5rem",
            maxWidth: 480,
            margin: "0 auto",
          }}>
            <p style={{ color: "#A0BCD0", fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>
              "Every instrument you process, every patient protected —
              that's what this certification means. The work you do every day saves lives."
            </p>
            <p style={{ color: cfg.accent, fontSize: "0.78rem", marginTop: "0.75rem", letterSpacing: "0.08em", fontFamily: "Calibri, sans-serif" }}>
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
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: "linear-gradient(135deg, #021B3A 0%, #0D3D5E 50%, #021B3A 100%)",
        fontFamily: "Georgia, serif",
      }}>
        <div className="w-full max-w-lg text-center">

          {/* Breadcrumb */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.6rem", marginBottom: "2rem",
          }}>
            <span style={{
              background: `${cfg.color}40`, border: `1px solid ${cfg.accent}`,
              borderRadius: "100px", padding: "0.25rem 0.8rem",
              color: cfg.accent, fontSize: "0.8rem", fontFamily: "Calibri, sans-serif",
            }}>{cert} ✓</span>
            <span style={{ color: "#7B96A8", fontSize: "1.2rem" }}>→</span>
            <span style={{
              background: `${nextCfg.color}30`, border: `1px solid ${nextCfg.accent}`,
              borderRadius: "100px", padding: "0.25rem 0.8rem",
              color: nextCfg.accent, fontSize: "0.8rem", fontFamily: "Calibri, sans-serif",
            }}>{cfg.next}</span>
          </div>

          <h1 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#FFFFFF", marginBottom: "1rem", lineHeight: 1.1 }}>
            Ready for your<br />
            <span style={{ color: nextCfg.accent }}>next level?</span>
          </h1>

          <p style={{ color: "#A0BCD0", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.6, fontFamily: "Calibri, sans-serif" }}>
            {cfg.nextDesc}
          </p>

          {/* Next cert card */}
          <div style={{
            background: `linear-gradient(135deg, ${nextCfg.color}20, ${nextCfg.accent}10)`,
            border: `2px solid ${nextCfg.accent}40`,
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
          }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>{nextCfg.icon}</div>
            <div style={{ color: nextCfg.accent, fontSize: "2rem", fontWeight: "900", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              {cfg.next}
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "0.95rem", fontFamily: "Calibri, sans-serif", opacity: 0.85 }}>
              {cfg.nextLabel}
            </div>

            {/* What's included */}
            <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
              {[
                `Full ${cfg.next} question bank`,
                "Chapter-by-chapter study mode",
                "AI Study Chat — ask anything",
                "Exam tips and domain mastery tracking",
                "Badge when you pass",
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.5rem 0",
                  borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ color: nextCfg.accent, fontSize: "0.9rem" }}>✓</span>
                  <span style={{ color: "#D0E4EE", fontSize: "0.88rem", fontFamily: "Calibri, sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxWidth: 380, margin: "0 auto" }}>
            <button
              onClick={() => window.location.href = `/study/${cfg.next?.toLowerCase()}`}
              style={{
                padding: "1.1rem",
                borderRadius: "12px",
                border: "none",
                background: `linear-gradient(135deg, ${nextCfg.color}, ${nextCfg.accent})`,
                color: "#FFFFFF",
                fontSize: "1.05rem",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
                boxShadow: `0 4px 24px ${nextCfg.accent}50`,
              }}
            >
              Start {cfg.next} Prep Now →
            </button>

            <button
              onClick={() => setStep("celebration")}
              style={{
                padding: "0.8rem",
                borderRadius: "12px",
                border: "none",
                background: "transparent",
                color: "#7B96A8",
                fontSize: "0.9rem",
                cursor: "pointer",
                fontFamily: "Calibri, sans-serif",
              }}
            >
              ← Back to my badge
            </button>
          </div>

          {/* ATS mention */}
          <p style={{
            color: "#7B96A8", fontSize: "0.78rem", marginTop: "2rem",
            fontFamily: "Calibri, sans-serif", lineHeight: 1.5,
          }}>
            Need facility-wide training?{" "}
            <a href="https://aseptictechnicalsolutions.com" style={{ color: cfg.accent, textDecoration: "none" }}>
              Aseptic Technical Solutions
            </a>{" "}
            offers on-site certification prep and compliance training for SPD departments.
          </p>

        </div>
      </div>
    );
  }

  return null;
}
