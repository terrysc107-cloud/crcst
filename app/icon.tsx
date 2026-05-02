import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #0d1b2a 0%, #1a2d42 100%)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Teal glow */}
        <div
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(42,157,143,0.4)",
          }}
        />
        {/* Gear icon text */}
        <span style={{ fontSize: 18, position: "relative" }}>⚙️</span>
      </div>
    ),
    { ...size }
  );
}
