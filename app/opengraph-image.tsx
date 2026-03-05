import { ImageResponse } from "next/og";

export const alt = "ResumeIdol — AI Resume Tailor That Gets You Hired";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#07090F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Subtle gold radial glow behind content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 400,
            background: "radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top-left corner dots */}
        <div style={{ position: "absolute", top: 48, left: 60, display: "flex", gap: 8 }}>
          {[0.4, 0.25, 0.15].map((o, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: `rgba(201,168,76,${o})`, display: "flex" }} />
          ))}
        </div>

        {/* Crown icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg, #C9A84C, #B8952F)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <svg width="44" height="36" viewBox="0 0 114 96">
            <polygon points="0,80 0,22 32,50 57,0 82,50 114,22 114,80" fill="#07090F" />
            <rect x="0" y="80" width="114" height="13" rx="6.5" fill="#05070C" />
            <circle cx="57" cy="0" r="8" fill="#07090F" opacity="0.6" />
            <circle cx="0" cy="22" r="6" fill="#07090F" opacity="0.5" />
            <circle cx="114" cy="22" r="6" fill="#07090F" opacity="0.5" />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#F0F2F7",
            letterSpacing: "-1px",
            marginBottom: 16,
            display: "flex",
          }}
        >
          ResumeIdol
        </div>

        {/* Gold divider */}
        <div
          style={{
            width: 48,
            height: 2,
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            marginBottom: 20,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: "#9CA3AF",
            letterSpacing: "0.2px",
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          AI Resume Tailor That Gets You Hired
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          {["Beat ATS Filters", "Keyword Optimised", "Download DOCX & PDF"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid rgba(201,168,76,0.3)",
                background: "rgba(201,168,76,0.06)",
                color: "#C9A84C",
                fontSize: 15,
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            color: "rgba(107,122,153,0.7)",
            fontSize: 18,
            letterSpacing: "0.5px",
            display: "flex",
          }}
        >
          resumeidol.com
        </div>
      </div>
    ),
    { ...size }
  );
}
