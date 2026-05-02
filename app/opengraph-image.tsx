import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SPD Cert Prep — Pass your CRCST / CBSPD certification the first time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1b2a",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Background glow orb */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(42,157,143,0.22) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "8%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(233,196,106,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Grid dot pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(42,157,143,0.1) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Logo / brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            position: "relative",
          }}
        >
          <span style={{ fontSize: 36 }}>⚙️</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#ffffff" }}>
            SPD Cert <span style={{ color: "#2a9d8f", fontStyle: "italic" }}>Prep</span>
          </span>
        </div>

        {/* Cert badges row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 40, position: "relative" }}>
          {[
            { code: "CRCST", color: "#2a9d8f" },
            { code: "CHL", color: "#3bbfb0" },
            { code: "CER", color: "#e9c46a" },
          ].map((c) => (
            <div
              key={c.code}
              style={{
                background: `${c.color}22`,
                border: `1px solid ${c.color}66`,
                borderRadius: 100,
                padding: "6px 16px",
                fontSize: 14,
                fontFamily: "monospace",
                fontWeight: 600,
                color: c.color,
                letterSpacing: "0.08em",
              }}
            >
              {c.code} ✓
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.1,
            textAlign: "center",
            margin: 0,
            marginBottom: 20,
            position: "relative",
            maxWidth: 900,
          }}
        >
          Pass Your CRCST / CBSPD
          <br />
          <span style={{ color: "#2a9d8f" }}>The First Time.</span>
        </h1>

        {/* Sub */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.60)",
            textAlign: "center",
            margin: 0,
            marginBottom: 40,
            fontFamily: "Arial, sans-serif",
            fontWeight: 300,
            maxWidth: 700,
            position: "relative",
          }}
        >
          787+ exam-aligned questions · AI Study Chat · Domain mastery tracking
        </p>

        {/* CTA pill */}
        <div
          style={{
            background: "linear-gradient(135deg, #2a9d8f, #3bbfb0)",
            borderRadius: 12,
            padding: "14px 40px",
            fontSize: 20,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "Arial, sans-serif",
            position: "relative",
          }}
        >
          spdcertprep.com
        </div>
      </div>
    ),
    { ...size }
  );
}
