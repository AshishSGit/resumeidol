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

const MARQUEE_ROW_1 = ["+ technical program management", "+ cross-functional collaboration", "+ ATS optimization", "+ stakeholder alignment", "+ Python automation", "+ CI/CD integration", "+ data-driven decision making", "+ agile methodology", "+ strategic leadership", "+ systems-level thinking"];
const MARQUEE_ROW_2 = ["+ user research", "+ design systems", "+ A/B testing", "+ information architecture", "+ user journey mapping", "+ design tokens", "+ accessibility standards", "+ product roadmap", "+ sprint planning", "+ metrics & KPIs"];

function KeywordMarquee() {
  const row1 = [...MARQUEE_ROW_1, ...MARQUEE_ROW_1];
  const row2 = [...MARQUEE_ROW_2, ...MARQUEE_ROW_2];
  return (
    <div className="mt-16 fade-section" style={{ animationDelay: "0.5s" }}>
      <p className="text-center text-[#374151] text-[11px] uppercase tracking-widest mb-5 font-medium">
        Keywords Claude weaves into your resume
      </p>
      <div className="space-y-2.5 overflow-hidden marquee-fade">
        <div className="marquee-track gap-2.5">
          {row1.map((kw, i) => (
            <span key={i} className="flex-shrink-0 text-xs px-3 py-1 rounded-full whitespace-nowrap" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", color: "#C9A84C" }}>
              {kw}
            </span>
          ))}
        </div>
        <div className="marquee-track-rev gap-2.5">
          {row2.map((kw, i) => (
            <span key={i} className="flex-shrink-0 text-xs px-3 py-1 rounded-full whitespace-nowrap" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", color: "#4ade80" }}>
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultShowcase() {
  return (
    <div className="pb-28 max-w-2xl mx-auto px-6 fade-section">
      <div
        className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #111827 0%, #0C101A 100%)",
          border: "1px solid rgba(201,168,76,0.15)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(201,168,76,0.06)",
        }}
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent)" }} />

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="badge-gold">
            <Zap size={10} />
            <span>Tailored in 14 seconds</span>
          </div>
          <span className="text-[#F0F2F7] font-semibold text-sm">Senior Product Designer · Stripe</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#6B7A99] text-xs font-medium uppercase tracking-widest">ATS Match Score</span>
            <span className="text-[#22c55e] text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
              +34 points
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#4B5563] text-2xl font-bold line-through" style={{ fontFamily: "Playfair Display, serif" }}>54%</span>
            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full fill-bar" style={{ background: "linear-gradient(90deg, #C9A84C, #E8D5A3)", boxShadow: "0 0 16px rgba(201,168,76,0.35)" }} />
            </div>
            <span className="text-[#C9A84C] text-2xl font-bold" style={{ fontFamily: "Playfair Display, serif" }}>88%</span>
          </div>
        </div>

        <div>
          <p className="text-[#374151] text-[11px] uppercase tracking-widest mb-3 font-medium">14 keywords woven in</p>
          <div className="flex flex-wrap gap-2">
            {["user research", "design systems", "A/B testing", "cross-functional", "stakeholder alignment", "information architecture", "user journey mapping", "design tokens"].map((k) => (
              <span key={k} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                + {k}
              </span>
            ))}
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
          <div className="flex items-center justify-center gap-2 text-sm" style={{ animation: "fadeUp 0.6s 0.4s ease-out both" }}>
            <span className="text-[#6B7A99]">Used by candidates targeting</span>
            <span className="font-semibold" style={{ color: "#DEC27A" }}>Google · Meta · Stripe · Amazon · Apple</span>
          </div>

          {/* Keyword marquee */}
          <KeywordMarquee />
        </div>
      </section>

      {/* ── RESULT SHOWCASE ── */}
      <ResultShowcase />

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
              <div key={f.title} className="card-feature p-6 fade-section" style={{ animationDelay: `${i * 0.08}s`, ["--card-glow" as string]: `linear-gradient(90deg, transparent, ${f.color}40, transparent)` }}>
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
                <div className="glass rounded-2xl p-8 h-full relative overflow-hidden">
                  {/* Large background step number */}
                  <div
                    className="absolute bottom-2 right-4 font-black leading-none pointer-events-none select-none"
                    style={{ fontSize: "7rem", fontFamily: "Playfair Display, serif", color: "rgba(201,168,76,0.04)" }}
                  >
                    {step.step}
                  </div>
                  <div className="text-gold-gradient font-mono text-4xl font-bold mb-5 opacity-40 relative z-10">
                    {step.step}
                  </div>
                  <h3 className="heading-md text-[#F0F2F7] mb-3 relative z-10">{step.title}</h3>
                  <p className="text-[#6B7A99] leading-relaxed relative z-10">{step.desc}</p>
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
