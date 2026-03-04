import Link from "next/link";
import { Target, Briefcase, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Tracker — Coming Soon | ResumeIdol",
};

export default function TrackerPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#07090F" }}>
      {/* Minimal nav */}
      <nav className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}>
            <Target size={16} className="text-[#07090F]" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.2rem", color: "#F0F2F7" }}>
            ResumeIdol
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <Briefcase size={32} className="text-[#C9A84C]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#DEC27A" }}>
            Coming Soon
          </div>

          <h1
            className="text-[#F0F2F7] mb-4"
            style={{ fontFamily: "Playfair Display, serif", fontSize: "2rem", fontWeight: 700 }}
          >
            Application Tracker
          </h1>

          <p className="text-[#6B7A99] mb-8 leading-relaxed">
            A full CRM for your job search. Track every application, set follow-up reminders, and never let a good opportunity go cold. Coming in the next update.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tailor"
              className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              Try Resume Tailor
              <ArrowRight size={15} />
            </Link>
            <Link href="/search" className="btn-ghost px-6 py-3 rounded-xl text-sm">
              Search Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
