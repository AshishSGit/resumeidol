import { NextResponse } from "next/server";

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="gold" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#F5DC78"/>
      <stop offset="45%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8B6410"/>
    </linearGradient>
    <linearGradient id="base" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C9A84C"/>
      <stop offset="50%" stop-color="#F0CC60"/>
      <stop offset="100%" stop-color="#C9A84C"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="gem">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="160" height="160" rx="36" fill="#07090F"/>

  <!-- Ambient glow -->
  <circle cx="80" cy="76" r="54" fill="#C9A84C" opacity="0.04"/>

  <!-- Crown body -->
  <polygon
    points="25,114 25,50 58,80 80,34 102,80 135,50 135,114"
    fill="url(#gold)"
    filter="url(#glow)"
  />

  <!-- Base bar -->
  <rect x="23" y="114" width="114" height="15" rx="7.5" fill="url(#base)"/>

  <!-- Center gem -->
  <circle cx="80" cy="34" r="9" fill="#FFFBE8" opacity="0.95" filter="url(#gem)"/>
  <circle cx="80" cy="34" r="4.5" fill="white"/>

  <!-- Left gem -->
  <circle cx="25" cy="50" r="7" fill="#FFFBE8" opacity="0.8" filter="url(#gem)"/>
  <circle cx="25" cy="50" r="3.5" fill="white" opacity="0.9"/>

  <!-- Right gem -->
  <circle cx="135" cy="50" r="7" fill="#FFFBE8" opacity="0.8" filter="url(#gem)"/>
  <circle cx="135" cy="50" r="3.5" fill="white" opacity="0.9"/>

  <!-- Crown sheen -->
  <polygon points="58,80 80,34 95,57 75,80" fill="white" opacity="0.07"/>

  <!-- Base accent dots -->
  <circle cx="55" cy="121.5" r="2" fill="rgba(255,248,220,0.4)"/>
  <circle cx="80" cy="121.5" r="2" fill="rgba(255,248,220,0.4)"/>
  <circle cx="105" cy="121.5" r="2" fill="rgba(255,248,220,0.4)"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
