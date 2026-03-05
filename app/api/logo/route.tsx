import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 160,
          height: 160,
          background: "#07090F",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* SVG crown — polygon/circle/rect are all Satori-safe */}
        <svg width="114" height="96" viewBox="0 0 114 96">
          {/* Crown body */}
          <polygon
            points="0,80 0,22 32,50 57,0 82,50 114,22 114,80"
            fill="#C9A84C"
          />
          {/* Lighter highlight on left face of crown */}
          <polygon
            points="0,22 32,50 57,0 42,0 20,42"
            fill="#F0CC60"
            opacity="0.35"
          />
          {/* Base bar */}
          <rect x="0" y="80" width="114" height="13" rx="6.5" fill="#D4A843" />
          {/* Base bar shimmer */}
          <rect x="22" y="83" width="70" height="5" rx="2.5" fill="#F5DC78" opacity="0.4" />
          {/* Center gem (brightest) */}
          <circle cx="57" cy="0" r="8" fill="#FFFBE8" />
          <circle cx="57" cy="0" r="4.5" fill="white" />
          {/* Left gem */}
          <circle cx="0" cy="22" r="6" fill="#FFFBE8" opacity="0.85" />
          <circle cx="0" cy="22" r="3" fill="white" opacity="0.8" />
          {/* Right gem */}
          <circle cx="114" cy="22" r="6" fill="#FFFBE8" opacity="0.85" />
          <circle cx="114" cy="22" r="3" fill="white" opacity="0.8" />
        </svg>
      </div>
    ),
    { width: 160, height: 160 }
  );
}
