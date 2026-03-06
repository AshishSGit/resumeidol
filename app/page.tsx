"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Crown, Search, FileText, BarChart2, Briefcase,
  ArrowRight, CheckCircle, Star, Zap, Shield, TrendingUp,
  ChevronDown, Menu, X
} from "lucide-react";

const STATS = [
  { value: "784", label: "avg applications to land 1 offer", suffix: "x" },
  { value: "59", label: "of resumes never reach a human", suffix: "%" },
  { value: "3", label: "minutes to tailor your resume with AI", suffix: "min" },
];

const FEATURES = [
  {
    icon: Search,
    title: "Multi-Source Job Search",
    desc: "Aggregates LinkedIn, Indeed, Glassdoor, and 500+ boards in one search. Real-time. Deduplicated.",
    color: "#6366f1",
  },
  {
    icon: FileText,
    title: "AI Resume Tailor",
    desc: "Claude AI rewrites your resume for each job. Beats ATS while staying readable to humans.",
    color: "#C9A84C",
  },
  {
    icon: Shield,
    title: "Ghost Job Filter",
    desc: "Automatically flags listings older than 3 weeks or from companies with no hiring signals.",
    color: "#22c55e",
  },
  {
    icon: BarChart2,
    title: "Match Score",
    desc: "See exactly how well you fit before you apply. Know your gaps. Decide smarter.",
    color: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "ATS Score",
    desc: "See your resume's ATS score before and after tailoring. Know exactly where you stand.",
    color: "#ec4899",
  },
  {
    icon: Briefcase,
    title: "One-Click Download",
    desc: "Download your tailored resume as a polished DOCX or PDF, ready to submit instantly.",
    color: "#06b6d4",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload Your Resume",
    desc: "Drop your PDF or Word file. Our AI instantly parses your experience, skills, and achievements — building your Career Profile.",
  },
  {
    step: "02",
    title: "Search & Match",
    desc: "Enter your target role. ResumeIdol pulls from 500+ job boards, scores each listing against your profile, and surfaces the best fits.",
  },
  {
    step: "03",
    title: "Apply with Precision",
    desc: "Click any job. AI tailors your resume specifically for that role in seconds. Download and apply. Track everything in one place.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    desc: "For the curious job seeker",
    features: [
      "3 AI resume tailors / month",
      "ATS score before & after",
      "Keyword gap analysis",
      "DOCX + PDF download",
    ],
    cta: "Start for Free",
    plan: "free",
    featured: false,
  },
  {
    name: "Pro",
    price: "18",
    period: "per month",
    desc: "For the serious job seeker",
    features: [
      "30 AI resume tailors / month",
      "ATS score before & after",
      "Keyword gap analysis",
      "DOCX + PDF download",
      "Word-level diff comparison",
      "Cancel anytime",
    ],
    cta: "Start Pro — $18/mo",
    plan: "pro",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Lifetime",
    price: "249",
    period: "one-time",
    desc: "Pay once, own forever",
    features: [
      "Everything in Pro",
      "Unlimited tailoring — forever",
      "All future features included",
      "No renewals, no expiry",
      "Priority support",
    ],
    cta: "Get Lifetime — $249",
    plan: "lifetime",
    featured: false,
    badge: "Best Value",
  },
];

const FAQS = [
  {
    q: "How is ResumeIdol different from just using LinkedIn or Indeed?",
    a: "Job boards show you listings. ResumeIdol tells you which ones you'll actually win, then rewrites your resume to maximize your chances — all in one place. It's the difference between spraying and sniping.",
  },
  {
    q: "Does the AI-tailored resume still sound like me?",
    a: "Yes. Claude AI doesn't replace your content — it repositions and refines it. Your voice, your experience, your achievements. Just framed for the exact role you're applying to.",
  },
  {
    q: "What job boards does ResumeIdol pull from?",
    a: "We aggregate from LinkedIn, Indeed, Glassdoor, Dice, ZipRecruiter, The Muse, Remotive, and 490+ more via our multi-source API layer. You search once, we check everywhere.",
  },
  {
    q: "What ATS systems does the resume tailoring optimize for?",
    a: "Our AI optimizes for the major systems: Workday, Greenhouse, Lever, iCIMS, and Taleo. It formats, keywords, and structures your resume to pass each system's specific quirks.",
  },
];

function ProductPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden preview-shadow"
      style={{ border: "1px solid rgba(201,168,76,0.12)" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "#0B0E1A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-md text-[11px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#6B7A99", maxWidth: 260, width: "100%" }}
          >
            <span className="text-[#374151] select-none">🔒</span>
            <span>resumeidol.com/tailor</span>
          </div>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-md"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
        >
          <Zap size={9} />
          AI Active
        </div>
      </div>

      {/* App body */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ background: "#07090F" }}>
        {/* Left: inputs */}
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-[rgba(255,255,255,0.05)]">
          <p className="text-[10px] text-[#374151] uppercase tracking-widest mb-2 font-medium">Job Description</p>
          <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.12)" }}>
            <p className="text-[#DEC27A] text-xs font-semibold mb-0.5">Senior Product Designer</p>
            <p className="text-[#6B7A99] text-[11px]">Stripe · San Francisco, CA · $160k–$220k</p>
            <p className="text-[#4B5563] text-[11px] mt-2 leading-relaxed">Looking for a Senior Product Designer to lead user research, design systems, and cross-functional initiatives. 5+ yrs Figma required…</p>
          </div>
          <p className="text-[10px] text-[#374151] uppercase tracking-widest mb-2 font-medium">Your Resume</p>
          <div className="p-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[#9CA3AF] text-[11px]">Alex Rivera · Product Designer · 4 yrs · Figma, Sketch, Prototyping · Previously at Notion, Webflow</p>
          </div>
          <div className="flex justify-end">
            <div
              className="text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #DEC27A, #C9A84C)", color: "#07090F" }}
            >
              <Zap size={11} />
              Tailoring…
            </div>
          </div>
        </div>

        {/* Right: output */}
        <div className="p-5">
          {/* ATS score comparison */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-center">
              <p className="text-[10px] text-[#374151] mb-1.5">Before</p>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 48 48" className="w-14 h-14" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                  <circle cx="24" cy="24" r="19" fill="none" stroke="#6366f1" strokeWidth="4.5"
                    strokeDasharray="119" strokeDashoffset="55" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#6366f1]">54%</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-[#374151] shrink-0" />
            <div className="text-center">
              <p className="text-[10px] text-[#374151] mb-1.5">After</p>
              <div className="relative w-14 h-14">
                <svg viewBox="0 0 48 48" className="w-14 h-14" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                  <circle cx="24" cy="24" r="19" fill="none" stroke="#C9A84C" strokeWidth="4.5"
                    strokeDasharray="119" strokeDashoffset="14" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#C9A84C]">88%</div>
              </div>
            </div>
            <div
              className="ml-1 px-2 py-1 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
            >
              +34pts
            </div>
          </div>

          {/* Keywords added */}
          <p className="text-[10px] text-[#374151] uppercase tracking-widest mb-2 font-medium">Keywords Added</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {["user research", "design systems", "A/B testing", "cross-functional"].map((k) => (
              <span
                key={k}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
              >
                + {k}
              </span>
            ))}
          </div>

          {/* Tailored resume snippet */}
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[#F0F2F7] text-xs font-semibold mb-1">Alex Rivera</p>
            <p className="text-[#6B7A99] text-[11px] leading-relaxed mb-2">Senior Product Designer with 4+ yrs leading user research, design systems, and cross-functional product initiatives at Notion and Webflow.</p>
            <div className="flex gap-2">
              {["↓ DOCX", "↓ PDF"].map((l) => (
                <span
                  key={l}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)", color: "#C9A84C" }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedStat({ value, suffix, label }: { value: string; suffix: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const target = parseInt(value);
          const duration = 1500;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="flex items-end justify-center gap-1 mb-2">
        <span
          className="text-gold-gradient"
          style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1 }}
        >
          {count}
        </span>
        <span className="text-[#C9A84C] text-2xl font-semibold mb-1">{suffix}</span>
      </div>
      <p className="text-[#6B7A99] text-sm max-w-[160px] mx-auto leading-relaxed">{label}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-[rgba(255,255,255,0.06)] py-5 cursor-pointer group"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="text-[#F0F2F7] text-[0.95rem] font-medium group-hover:text-[#DEC27A] transition-colors">
          {q}
        </h4>
        <ChevronDown
          size={18}
          className="text-[#6B7A99] shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      <div
        style={{
          maxHeight: open ? "200px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p className="text-[#6B7A99] text-sm leading-relaxed pt-3">{a}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleCheckout = async (plan: string) => {
    if (plan === "free") { window.location.href = "/tailor"; return; }
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-section").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#07090F" }}>
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(7,9,15,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)", boxShadow: "0 0 16px rgba(201,168,76,0.35)" }}>
              <Crown size={18} className="text-[#07090F]" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, fontSize: "1.35rem", color: "#F0F2F7", letterSpacing: "-0.01em" }}>
              ResumeIdol
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="nav-link">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/tailor" className="btn-gold text-sm px-5 py-2 rounded-lg">
                Go to app →
              </Link>
            ) : (
              <>
                <Link href="/signin" className="btn-ghost text-sm px-4 py-2 rounded-lg">
                  Sign in
                </Link>
                <Link href="/tailor" className="btn-gold text-sm px-5 py-2 rounded-lg">
                  Start Free →
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-[#9CA3AF] hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[rgba(255,255,255,0.06)]" style={{ background: "rgba(7,9,15,0.97)" }}>
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="nav-link text-base py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              {isLoggedIn ? (
                <Link href="/tailor" className="btn-gold text-sm px-5 py-2.5 rounded-lg text-center mt-2">
                  Go to app →
                </Link>
              ) : (
                <Link href="/tailor" className="btn-gold text-sm px-5 py-2.5 rounded-lg text-center mt-2">
                  Start Free →
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-glow dot-grid">
        {/* Animated ambient orbs */}
        <div className="orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)" }} />
        <div className="orb-2 absolute bottom-1/3 right-1/4 w-[420px] h-[420px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)" }} />
        <div className="orb-3 absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 badge-gold mb-8" style={{ animation: "fadeUp 0.5s ease-out forwards" }}>
            <Zap size={12} />
            <span>AI-Powered Job Intelligence</span>
          </div>

          {/* Headline */}
          <h1
            className="heading-xl text-[#F0F2F7] mb-6"
            style={{ animation: "fadeUp 0.6s 0.1s ease-out both" }}
          >
            The resume that makes{" "}
            <br />
            <span className="text-gold-gradient italic">recruiters say yes.</span>
          </h1>

          {/* Sub */}
          <p
            className="text-[#6B7A99] text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "fadeUp 0.6s 0.2s ease-out both" }}
          >
            ResumeIdol searches 500+ job boards, scores every listing against your profile, and tailors your resume with AI — so you apply to fewer jobs and land more interviews.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            style={{ animation: "fadeUp 0.6s 0.3s ease-out both" }}
          >
            <Link href="/search" className="btn-gold px-8 py-3.5 rounded-xl text-base flex items-center gap-2">
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <Link href="/tailor" className="btn-ghost px-8 py-3.5 rounded-xl text-base flex items-center gap-2">
              <FileText size={16} className="text-[#C9A84C]" />
              Try Resume Tailor
            </Link>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 text-[#6B7A99] text-sm" style={{ animation: "fadeUp 0.6s 0.4s ease-out both" }}>
            <div className="flex -space-x-2">
              {["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#07090F] flex items-center justify-center text-xs font-bold" style={{ background: c, zIndex: 5 - i }}>
                  {["A", "B", "C", "D", "E"][i]}
                </div>
              ))}
            </div>
            <span>Be among the <strong className="text-[#DEC27A]">first to try</strong> ResumeIdol — free to start</span>
          </div>

          {/* Board logos */}
          <div className="mt-14 fade-section" style={{ animationDelay: "0.5s" }}>
            <p className="text-[#374151] text-xs uppercase tracking-widest mb-5 font-medium">Searches across</p>
            <div className="flex items-center justify-center flex-wrap gap-6">
              {["LinkedIn", "Indeed", "Glassdoor", "Dice", "ZipRecruiter", "Remotive", "+490 more"].map((name) => (
                <span key={name} className="text-[#374151] text-sm font-medium hover:text-[#6B7A99] transition-colors">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="pb-24 max-w-5xl mx-auto px-6 -mt-8 fade-section">
        <ProductPreview />
      </section>

      {/* ── STATS ── */}
      <section className="py-20 relative">
        <div className="gold-line" />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {STATS.map((s) => (
              <AnimatedStat key={s.label} {...s} />
            ))}
          </div>
        </div>
        <div className="gold-line" />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-section">
          <div className="badge-gold mb-4">
            <Star size={11} />
            <span>Everything you need to win</span>
          </div>
          <h2 className="heading-lg text-[#F0F2F7] mb-4">
            The unfair advantage<br />
            <span className="text-gold-gradient">every job seeker deserves</span>
          </h2>
          <p className="text-[#6B7A99] text-lg max-w-xl mx-auto">
            One platform covers your entire job search — from finding the right roles to walking into the interview prepared.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-feature p-6 fade-section" style={{ animationDelay: `${i * 0.08}s` }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-[#F0F2F7] font-semibold mb-2 text-[1.05rem]">{f.title}</h3>
                <p className="text-[#6B7A99] text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 fade-section">
            <div className="badge-gold mb-4">
              <TrendingUp size={11} />
              <span>Simple 3-step process</span>
            </div>
            <h2 className="heading-lg text-[#F0F2F7] mb-4">
              From resume to interview,<br />
              <span className="text-gold-gradient">in minutes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative fade-section" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="glass rounded-2xl p-8 h-full">
                  <div className="text-gold-gradient font-mono text-4xl font-bold mb-5 opacity-40">
                    {step.step}
                  </div>
                  <h3 className="heading-md text-[#F0F2F7] mb-3">{step.title}</h3>
                  <p className="text-[#6B7A99] leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div
                    className="hidden lg:block absolute top-1/2 -right-4 z-10"
                    style={{ transform: "translateY(-50%)" }}
                  >
                    <ArrowRight size={20} className="text-[#C9A84C] opacity-40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 fade-section">
            <Link href="/search" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base">
              Try it now — it&apos;s free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 fade-section">
          <div className="badge-gold mb-4">
            <Zap size={11} />
            <span>Simple, honest pricing</span>
          </div>
          <h2 className="heading-lg text-[#F0F2F7] mb-4">
            Stop paying $50/month<br />
            <span className="text-gold-gradient">for a tool that doesn&apos;t work</span>
          </h2>
          <p className="text-[#6B7A99] text-lg">Start free. Upgrade when you&apos;re ready. Cancel anytime.</p>
        </div>

        {/* Annual / Monthly toggle */}
        <div className="flex items-center justify-center gap-4 mb-12 fade-section">
          <span className={`text-sm font-medium transition-colors ${!annual ? "text-[#F0F2F7]" : "text-[#6B7A99]"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
            className={`relative w-11 h-6 rounded-full transition-all duration-300 toggle-track ${annual ? "active" : ""}`}
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
              style={{ left: annual ? "calc(100% - 20px)" : "4px" }}
            />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 transition-colors ${annual ? "text-[#F0F2F7]" : "text-[#6B7A99]"}`}>
            Annual
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}
            >
              Save 28%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((plan, i) => (
            <div
              key={plan.name}
              className={`pricing-card p-8 fade-section ${plan.featured ? "featured" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.badge && (
                <div className={`${plan.featured ? "badge-gold" : "badge-green"} text-xs mb-5 w-fit`}>
                  {plan.badge}
                </div>
              )}
              <h3 className="text-[#F0F2F7] font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-[#6B7A99] text-sm mb-6">{plan.desc}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-[#6B7A99] text-lg">$</span>
                <span
                  className={`text-5xl font-bold ${plan.featured ? "text-gold-gradient" : "text-[#F0F2F7]"}`}
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  {plan.featured && annual ? "13" : plan.price}
                </span>
              </div>
              <p className="text-[#374151] text-sm mb-8">
                {plan.featured && annual ? "per month, billed $156/yr" : plan.period}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#9CA3AF]">
                    <CheckCircle size={15} className="text-[#C9A84C] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.featured && annual ? "pro_annual" : plan.plan)}
                disabled={checkoutLoading !== null}
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.featured ? "btn-gold" : "btn-ghost"} disabled:opacity-60`}
              >
                {checkoutLoading === plan.plan
                  ? "Redirecting…"
                  : plan.featured && annual
                  ? "Start Pro — $13/mo"
                  : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[#374151] text-sm mt-8 fade-section">
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 fade-section">
          <h2 className="heading-lg text-[#F0F2F7] mb-3">
            Questions? <span className="text-gold-gradient">We&apos;ve got answers.</span>
          </h2>
        </div>
        <div className="fade-section">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </section>

      {/* ── CTA / WAITLIST ── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center fade-section">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #141B2D 0%, #0F1420 100%)",
              border: "1px solid rgba(201,168,76,0.2)",
              boxShadow: "0 0 80px rgba(201,168,76,0.08)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px" style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }} />
            <div className="badge-gold mb-6 mx-auto w-fit">
              <Crown size={11} />
              <span>Free to start — no credit card</span>
            </div>
            <h2 className="heading-lg text-[#F0F2F7] mb-4">
              Stop spraying.<br />
              <span className="text-gold-gradient">Start landing.</span>
            </h2>
            <p className="text-[#6B7A99] mb-8 text-lg max-w-md mx-auto">
              Tailor your resume for free. Upgrade to Pro when you&apos;re ready to go all in.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tailor" className="btn-gold px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                Start Tailoring Free
                <ArrowRight size={15} />
              </Link>
              <Link href="/search" className="btn-ghost px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                <Search size={15} className="text-[#C9A84C]" />
                Search Jobs
              </Link>
            </div>

            <p className="text-[#374151] text-xs mt-6">3 free tailors per month. No card required.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C9A84C, #B8952F)" }}>
              <Crown size={12} className="text-[#07090F]" />
            </div>
            <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 700, color: "#9CA3AF", fontSize: "0.95rem" }}>
              ResumeIdol
            </span>
          </div>
          <div className="flex items-center gap-8">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms", href: "/terms" },
              { label: "Contact", href: "mailto:hello@resumeidol.com" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="text-[#374151] text-sm hover:text-[#6B7A99] transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-[#374151] text-sm">
              © 2026 ResumeIdol. All rights reserved.
            </p>
            <a
              href="https://anthropic.com/claude"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-50 hover:opacity-75 transition-opacity"
            >
              <span className="text-[#4B5563] text-xs">Powered by</span>
              <span className="text-[#C9A84C] text-xs font-medium tracking-wide">Claude</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
