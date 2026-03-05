import { NextResponse } from "next/server";

export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4A843"/>
      <stop offset="100%" stop-color="#A67C28"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="160" height="160" rx="36" fill="#07090F"/>

  <!-- Outer ring glow -->
  <circle cx="80" cy="80" r="52" fill="none" stroke="#C9A84C" stroke-width="1" opacity="0.2"/>

  <!-- Target rings -->
  <circle cx="80" cy="80" r="46" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.9"/>
  <circle cx="80" cy="80" r="30" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.75"/>
  <circle cx="80" cy="80" r="14" fill="none" stroke="url(#g)" stroke-width="3" opacity="0.6"/>

  <!-- Crosshair lines -->
  <line x1="80" y1="24" x2="80" y2="56" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
  <line x1="80" y1="104" x2="80" y2="136" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
  <line x1="24" y1="80" x2="56" y2="80" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
  <line x1="104" y1="80" x2="136" y2="80" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>

  <!-- Center dot -->
  <circle cx="80" cy="80" r="6" fill="url(#g)" filter="url(#glow)"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
