import Link from "next/link";
import { Crown, Home, Search, FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#07090F" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}
        >
          <Crown size={18} className="text-[#07090F]" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.35rem", color: "#F0F2F7" }}>
          ResumeIdol
        </span>
      </Link>

      {/* 404 */}
      <div
        className="text-8xl font-bold mb-4"
        style={{
          fontFamily: "Playfair Display, serif",
          background: "linear-gradient(135deg, #C9A84C, #B8952F)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </div>

      <h1 className="text-[#F0F2F7] text-2xl font-semibold mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
        Page not found
      </h1>
      <p className="text-[#6B7A99] text-sm max-w-xs mb-10">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Quick links */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#DEC27A" }}
        >
          <Home size={14} />
          Home
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
        >
          <Search size={14} />
          Job Search
        </Link>
        <Link
          href="/tailor"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
        >
          <FileText size={14} />
          Resume Tailor
        </Link>
      </div>
    </div>
  );
}
