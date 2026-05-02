import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a2d42 100%)",
          borderRadius: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Teal glow orb */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: -20,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(42,157,143,0.3)",
          }}
        />
        {/* Gear */}
        <span style={{ fontSize: 80, position: "relative" }}>⚙️</span>
        {/* Brand label */}
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#2a9d8f",
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            position: "relative",
            marginTop: 4,
          }}
        >
          SPD
        </span>
      </div>
    ),
    { ...size }
  );
}
