"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Crown, Search, FileText, BarChart2, Briefcase,
  ArrowRight, CheckCircle, Star, Zap, Shield, TrendingUp,
  ChevronDown, Menu, X, AlertCircle, ArrowLeftRight, Tag, Target, ArrowUp
} from "lucide-react";

const ACTIVITY_FEED = [
  { name: "Alex T.",   company: "Google",    pts: 34, time: "2m" },
  { name: "Sarah M.",  company: "Stripe",    pts: 28, time: "4m" },
  { name: "Marcus L.", company: "Netflix",   pts: 41, time: "1m" },
  { name: "Priya K.",  company: "Anthropic", pts: 19, time: "6m" },
  { name: "Jordan R.", company: "Linear",    pts: 36, time: "3m" },
  { name: "Emma S.",   company: "Figma",     pts: 22, time: "8m" },
  { name: "Dev P.",    company: "OpenAI",    pts: 45, time: "1m" },
  { name: "Nina W.",   company: "Apple",     pts: 31, time: "5m" },
];

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
    desc: "AI rewrites your resume for each specific job. Beats ATS filters while staying authentic and readable to humans.",
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
    desc: "Drop your PDF or Word file. Instantly parses your experience, skills, and achievements — building your Career Profile.",
  },
  {
    step: "02",
    title: "Search & Match",
    desc: "Enter your target role. ResumeIdol pulls from 500+ job boards, scores each listing against your profile, and surfaces the best fits.",
  },
  {
    step: "03",
    title: "Apply with Precision",
    desc: "Click any job. ResumeIdol tailors your resume specifically for that role in seconds. Download and apply. Track everything in one place.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "0",
    period: "No credit card needed",
    desc: "See the magic — once",
    features: [
      "1 AI resume tailor — free forever",
      "ATS score before & after",
      "Keyword gap analysis",
      "DOCX + PDF download",
    ],
    cta: "Try for Free",
    plan: "free",
    featured: false,
    badge: null,
  },
  {
    name: "Starter",
    price: "9",
    period: "per month",
    desc: "For the casual job seeker",
    features: [
      "8 AI resume tailors / month",
      "ATS score before & after",
      "Keyword gap analysis",
      "DOCX + PDF download",
    ],
    cta: "Start for $9 →",
    plan: "starter",
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "29",
    annualPrice: "19",
    period: "per month",
    annualPeriod: "per month, billed $228/yr",
    desc: "For the focused job seeker",
    features: [
      "Unlimited AI tailoring",
      "ATS score before & after",
      "Keyword gap analysis",
      "Word-level diff comparison",
      "DOCX + PDF download",
      "Cancel anytime",
    ],
    cta: "Unlock Pro →",
    plan: "pro",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Lifetime",
    price: "349",
    period: "one-time payment",
    desc: "The last resume tool you'll ever buy",
    features: [
      "Unlimited tailoring — forever",
      "Everything in Pro",
      "All future features included",
      "No renewals, no expiry",
      "Priority support",
    ],
    cta: "Get Lifetime Access →",
    plan: "lifetime",
    featured: false,
    badge: "Best Value",
  },
];

const COMPANIES = ["Google", "Stripe", "Netflix", "Apple", "Anthropic", "Linear", "OpenAI", "Figma"];

const FAQS = [
  {
    q: "How is ResumeIdol different from just using LinkedIn or Indeed?",
    a: "Job boards show you listings. ResumeIdol tells you which ones you'll actually win, then rewrites your resume to maximize your chances — all in one place. It's the difference between spraying and sniping.",
  },
  {
    q: "Does the AI-tailored resume still sound like me?",
    a: "Yes. Our AI doesn't replace your content — it repositions and refines it. Your voice, your experience, your achievements. Just framed for the exact role you're applying to.",
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

const TESTIMONIALS = [
  { initials: "MK", name: "Maya K.", role: "Product Manager, hired at Figma", quote: "Got 3 callbacks in 2 weeks. My ATS score jumped from 52% to 91% for my dream role." },
  { initials: "JR", name: "James R.", role: "Software Engineer, hired at Stripe", quote: "Tailored 12 applications in a weekend. Landed my offer in 18 days." },
  { initials: "SP", name: "Shreya P.", role: "UX Designer, hired at Linear", quote: "I was skeptical but the keyword gap analysis alone was worth the Pro plan." },
];

const MARQUEE_ROW_1 = ["+ technical program management", "+ cross-functional collaboration", "+ ATS optimization", "+ stakeholder alignment", "+ Python automation", "+ CI/CD integration", "+ data-driven decision making", "+ agile methodology", "+ strategic leadership", "+ systems-level thinking"];
const MARQUEE_ROW_2 = ["+ user research", "+ design systems", "+ A/B testing", "+ information architecture", "+ user journey mapping", "+ design tokens", "+ accessibility standards", "+ product roadmap", "+ sprint planning", "+ metrics & KPIs"];

function KeywordMarquee() {
  const row1 = [...MARQUEE_ROW_1, ...MARQUEE_ROW_1];
  const row2 = [...MARQUEE_ROW_2, ...MARQUEE_ROW_2];
  return (
    <div className="mt-16 fade-section" style={{ animationDelay: "0.5s" }}>
      <p className="text-center text-[#4B5563] text-[11px] uppercase tracking-widest mb-5 font-medium">
        Keywords woven into your resume
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

const PREVIEW_TABS = [
  { id: "resume",   label: "Tailored Resume" },
  { id: "compare",  label: "Compare" },
  { id: "keywords", label: "Keywords" },
  { id: "gaps",     label: "Gaps" },
] as const;
type PreviewTab = typeof PREVIEW_TABS[number]["id"];

function OutputPreview() {
  const [tab, setTab] = useState<PreviewTab>("resume");

  return (
    <section className="pb-28 max-w-3xl mx-auto px-6 fade-section">
      <div className="text-center mb-12">
        <div className="badge-gold mb-4 mx-auto w-fit"><Zap size={10} /><span>Live output preview</span></div>
        <h2 className="heading-lg text-[#F0F2F7] mb-4">
          Your resume,{" "}
          <span className="shimmer-text">transformed in seconds</span>
        </h2>
        <p className="text-[#8A9AB8] text-base max-w-lg mx-auto mb-8">
          Most tools hand you a rewrite and call it done.<br className="hidden sm:block" />
          ResumeIdol gives you <strong className="text-[#C4CEDF] font-semibold">four outputs</strong> that put you in control of every application.
        </p>
        {/* 4 output feature tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto">
          {([
            { icon: FileText,       label: "Tailored Resume", sub: "Fully rewritten for this role",      color: "#C9A84C" },
            { icon: ArrowLeftRight, label: "Word Diff",        sub: "Every change, word by word",        color: "#6366f1" },
            { icon: Tag,            label: "Keywords",         sub: "14 avg. woven in naturally",        color: "#22c55e" },
            { icon: Target,         label: "Skill Gaps",       sub: "Know what to address first",        color: "#f59e0b" },
          ] as const).map(({ icon: Icon, label, sub, color }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl"
              style={{ background: `${color}0D`, border: `1px solid ${color}22` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}28` }}
              >
                <Icon size={14} strokeWidth={1.75} style={{ color }} />
              </div>
              <div>
                <p className="text-[#D4DBE8] text-xs font-semibold mb-0.5 leading-tight">{label}</p>
                <p className="text-[#6B7A99] text-[0.68rem] leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(145deg, #111827 0%, #0C101A 100%)", border: "1px solid rgba(201,168,76,0.15)", boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(201,168,76,0.06)" }}>
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.45), transparent)" }} />

        {/* Card header */}
        <div className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="badge-gold"><Zap size={10} /><span>Tailored in 14s</span></div>
            <span className="text-[#C4CEDF] font-semibold text-sm">Senior Product Designer · Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6B7A99] text-xs">ATS</span>
            <span className="text-[#4B5563] text-sm font-bold line-through">54%</span>
            <span className="text-[#22c55e] text-sm font-bold">→ 88%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>+34 pts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {PREVIEW_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: tab === t.id ? "rgba(201,168,76,0.14)" : "transparent",
                  color: tab === t.id ? "#DEC27A" : "#6B7A99",
                  border: tab === t.id ? "1px solid rgba(201,168,76,0.28)" : "1px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-5">
          {tab === "resume" && (
            <div className="rounded-xl p-4 text-[0.72rem] leading-loose overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#B0BBC8", fontFamily: "JetBrains Mono, monospace", maxHeight: "260px" }}>
              <p className="text-[#DEC27A] font-semibold text-[0.7rem] tracking-widest mb-2.5">PROFESSIONAL SUMMARY</p>
              <p className="mb-4">Results-driven Product Designer with 7+ years leading end-to-end design for high-growth SaaS products. Deep expertise in <span style={{ color: "#4ade80" }}>design systems</span>, <span style={{ color: "#4ade80" }}>user journey mapping</span>, and <span style={{ color: "#4ade80" }}>stakeholder alignment</span> across cross-functional teams.</p>
              <p className="text-[#DEC27A] font-semibold text-[0.7rem] tracking-widest mb-2.5">EXPERIENCE</p>
              <p className="text-[#C9A84C] mb-1.5">Senior Product Designer — Figma · 2021–Present</p>
              <p className="mb-1">• Led <span style={{ color: "#4ade80" }}>design systems</span> overhaul reducing inconsistencies by 40% across 8 product squads</p>
              <p className="mb-1">• Established <span style={{ color: "#4ade80" }}>A/B testing</span> framework improving feature adoption by 23%</p>
              <p className="mb-1">• Drove <span style={{ color: "#4ade80" }}>stakeholder alignment</span> workshops for 3 flagship product launches</p>
              <p className="mt-3 text-[#445568]">↓ continues for 2 more roles...</p>
            </div>
          )}

          {tab === "compare" && (
            <div>
              <p className="text-[#6B7A99] text-xs mb-3">Word-level diff — red is removed, green is added</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[#6B7A99] text-[10px] uppercase tracking-wider mb-2 font-medium">Original</p>
                  <div className="rounded-xl p-3 text-[0.7rem] leading-relaxed" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", color: "#9CA3AF", fontFamily: "JetBrains Mono, monospace" }}>
                    <span>Designed user interfaces for </span>
                    <span style={{ background: "rgba(239,68,68,0.3)", color: "#f87171", textDecoration: "line-through", borderRadius: "2px", padding: "0 2px" }}>web applications</span>
                    <span> and worked with </span>
                    <span style={{ background: "rgba(239,68,68,0.3)", color: "#f87171", textDecoration: "line-through", borderRadius: "2px", padding: "0 2px" }}>teams</span>
                    <span> on new features.</span>
                  </div>
                </div>
                <div>
                  <p className="text-[#6B7A99] text-[10px] uppercase tracking-wider mb-2 font-medium">Tailored</p>
                  <div className="rounded-xl p-3 text-[0.7rem] leading-relaxed" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", color: "#9CA3AF", fontFamily: "JetBrains Mono, monospace" }}>
                    <span>Led </span>
                    <span style={{ background: "rgba(34,197,94,0.22)", color: "#4ade80", borderRadius: "2px", padding: "0 2px" }}>design systems</span>
                    <span> and </span>
                    <span style={{ background: "rgba(34,197,94,0.22)", color: "#4ade80", borderRadius: "2px", padding: "0 2px" }}>user journey mapping</span>
                    <span> for </span>
                    <span style={{ background: "rgba(34,197,94,0.22)", color: "#4ade80", borderRadius: "2px", padding: "0 2px" }}>cross-functional</span>
                    <span> teams, driving </span>
                    <span style={{ background: "rgba(34,197,94,0.22)", color: "#4ade80", borderRadius: "2px", padding: "0 2px" }}>stakeholder alignment</span>
                    <span>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "keywords" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#8A9AB8] text-xs">Woven in naturally — not a keyword dump</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>14 added</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["design systems", "user journey mapping", "A/B testing", "cross-functional", "stakeholder alignment", "information architecture", "design tokens", "accessibility standards", "product roadmap", "sprint planning", "metrics & KPIs", "user research", "agile methodology", "data-driven decisions"].map((k) => (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                    <span style={{ fontSize: "0.6rem" }}>+</span> {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {tab === "gaps" && (
            <div>
              <p className="text-[#8A9AB8] text-xs mb-4">Honest gaps identified — so you know what to address before applying or in the interview</p>
              <div className="space-y-3">
                {[
                  { skill: "Figma Advanced Prototyping", note: "Job requires deep prototyping experience — only mentioned briefly on your resume" },
                  { skill: "SQL / data querying", note: "Stripe emphasizes data-driven design — no SQL experience visible on resume" },
                  { skill: "B2B enterprise experience", note: "Stripe is enterprise B2B — your resume focuses on consumer product design" },
                ].map((gap, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                    <div>
                      <p className="text-[#DEC27A] text-xs font-semibold mb-0.5">{gap.skill}</p>
                      <p className="text-[#8A9AB8] text-xs">{gap.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA nudge */}
      <div className="text-center mt-10">
        <p className="text-[#6B7A99] text-sm mb-4">Try it free — no credit card required</p>
        <Link href="/tailor" className="btn-gold btn-gold-hero inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
          <Zap size={15} />
          Tailor my resume now
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
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
      className="faq-item border-b border-[rgba(255,255,255,0.06)] py-5 cursor-pointer group"
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
        <p className="text-[#8A9AB8] text-[0.92rem] leading-relaxed pt-3">{a}</p>
      </div>
    </div>
  );
}

function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        ...style,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.5s ease" : "transform 0.12s ease",
        transformOrigin: "center center",
        willChange: "transform",
      }}
      onMouseMove={(e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: y * 7, y: -x * 7 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [annual, setAnnual] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, visible: false });
  const [companyIdx, setCompanyIdx] = useState(0);
  const [companyFading, setCompanyFading] = useState(false);

  const [liveCount, setLiveCount] = useState(2847);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerOn, setTickerOn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // Activity ticker — starts 4s after mount, cycles every 6s forever
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      setTickerOn(true);
      intervalId = setInterval(() => setTickerIdx(i => (i + 1) % ACTIVITY_FEED.length), 6000);
    }, 4000);
    return () => { clearTimeout(start); clearInterval(intervalId); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompanyFading(true);
      setTimeout(() => {
        setCompanyIdx(i => (i + 1) % COMPANIES.length);
        setCompanyFading(false);
      }, 380);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

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
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please try again.");
      }
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
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden hero-glow dot-grid"
        onMouseMove={(e) => {
          const rect = heroRef.current?.getBoundingClientRect();
          if (!rect) return;
          setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
        }}
        onMouseLeave={() => setSpotlight(p => ({ ...p, visible: false }))}
      >
        {/* Cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: spotlight.visible
              ? `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, rgba(201,168,76,0.08) 0%, transparent 70%)`
              : "none",
            zIndex: 1,
          }}
        />
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
            className="text-[#8A9AB8] text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animation: "fadeUp 0.6s 0.2s ease-out both" }}
          >
            ResumeIdol searches 500+ job boards, scores every listing against your profile, and tailors your resume with AI — so you apply to fewer jobs and land more interviews.
          </p>

          {/* Morphing company pill */}
          <div
            className="flex items-center justify-center gap-2.5 mb-8"
            style={{ animation: "fadeUp 0.6s 0.26s ease-out both" }}
          >
            <span className="text-[#4B5563] text-sm">Recently tailored for roles at</span>
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                background: "rgba(201,168,76,0.1)",
                border: "1px solid rgba(201,168,76,0.25)",
                color: "#DEC27A",
                opacity: companyFading ? 0 : 1,
                transform: companyFading ? "translateY(-5px)" : "translateY(0px)",
                transition: "opacity 0.32s ease, transform 0.32s ease",
                display: "inline-block",
              }}
            >
              {COMPANIES[companyIdx]}
            </span>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            style={{ animation: "fadeUp 0.6s 0.3s ease-out both" }}
          >
            <Link href="/search" className="btn-gold btn-gold-hero px-8 py-3.5 rounded-xl text-base flex items-center gap-2">
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <Link href="/tailor" className="btn-ghost px-8 py-3.5 rounded-xl text-base flex items-center gap-2">
              <FileText size={16} className="text-[#C9A84C]" />
              Try Resume Tailor
            </Link>
          </div>

          {/* Trust */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm" style={{ animation: "fadeUp 0.6s 0.4s ease-out both" }}>
            {[
              { icon: "✦", label: "1 free tailor, no card" },
              { icon: "✦", label: "Beat ATS filters instantly" },
              { icon: "✦", label: "DOCX + PDF in seconds" },
            ].flatMap(({ icon, label }, i) => [
              i > 0 ? <span key={`sep-${i}`} className="text-[#2A3040] hidden sm:inline">·</span> : null,
              <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span style={{ color: "#C9A84C", fontSize: "0.55rem" }}>{icon}</span>
                <span className="text-[#6B7A99]">{label}</span>
              </span>,
            ]).filter(Boolean)}
          </div>

          {/* Keyword marquee */}
          <KeywordMarquee />

          {/* Scroll hint */}
          <div className="scroll-hint mt-16 flex flex-col items-center gap-1.5 opacity-40">
            <span className="text-[#6B7A99] text-xs tracking-widest uppercase">Scroll</span>
            <ChevronDown size={16} className="text-[#C9A84C]" />
          </div>
        </div>
      </section>

      {/* ── OUTPUT PREVIEW ── */}
      <OutputPreview />

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
          <p className="text-[#8A9AB8] text-lg max-w-xl mx-auto">
            One platform covers your entire job search — from finding the right roles to walking into the interview prepared.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <TiltCard key={f.title} className="card-feature p-6 fade-section" style={{ animationDelay: `${i * 0.08}s`, ["--card-glow" as string]: `linear-gradient(90deg, transparent, ${f.color}40, transparent)` }}>
                <div
                  className="feature-icon-wrap w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30`, ["--icon-glow" as string]: `${f.color}40` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="text-[#F0F2F7] font-semibold mb-2 text-[1.05rem]">{f.title}</h3>
                <p className="text-[#8A9AB8] text-[0.9rem] leading-relaxed">{f.desc}</p>
              </TiltCard>
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
        <div className="text-center mb-10 fade-section">
          <div className="badge-gold mb-5">
            <Zap size={11} />
            <span>Simple, honest pricing</span>
          </div>
          <h2 className="heading-lg text-[#F0F2F7] mb-4">
            Premium AI tools.<br />
            <span className="text-gold-gradient">Without the premium price.</span>
          </h2>
          <p className="text-[#8A9AB8] text-lg mb-5">Start free. Upgrade when you&apos;re ready.</p>
          <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: "#22c55e" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "#22c55e" }} />
            {liveCount.toLocaleString()} resumes tailored this week
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 fade-section">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-xl p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-[#C9A84C]" fill="#C9A84C" />)}
              </div>
              <p className="text-[#9CA3AF] text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "rgba(201,168,76,0.12)", color: "#DEC27A" }}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[#F0F2F7] text-xs font-semibold">{t.name}</p>
                  <p className="text-[#4B5563] text-[0.7rem]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Annual / Monthly toggle */}
        <div className="flex items-center justify-center gap-4 mb-10 fade-section">
          <span className={`text-base font-medium transition-colors ${!annual ? "text-[#F0F2F7]" : "text-[#6B7A99]"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing"
            className={`relative w-12 h-6 rounded-full transition-all duration-300 toggle-track ${annual ? "active" : ""}`}
          >
            <span
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
              style={{ left: annual ? "calc(100% - 20px)" : "4px" }}
            />
          </button>
          <span className={`text-base font-medium flex items-center gap-2.5 transition-colors ${annual ? "text-[#F0F2F7]" : "text-[#6B7A99]"}`}>
            Annual
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}
            >
              Save $120 / year
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
          {PRICING.map((plan, i) => {
            const isLifetime = plan.plan === "lifetime";
            const isStarter = plan.plan === "starter";
            const isPro = plan.featured;
            const displayPrice = isPro && annual ? plan.annualPrice! : plan.price;
            const displayPeriod = isPro && annual ? plan.annualPeriod! : plan.period;
            const checkoutPlan = isPro && annual ? "pro_annual" : plan.plan;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col fade-section ${isPro ? "md:-mt-4 md:mb-4" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Floating badge above card */}
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 z-10 ${isPro ? "badge-shimmer" : ""}`}
                  style={isLifetime ? {
                    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399",
                    fontSize: "0.72rem", fontWeight: 600, padding: "0.22rem 0.75rem", borderRadius: "9999px", whiteSpace: "nowrap"
                  } : isStarter ? {
                    background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24",
                    fontSize: "0.72rem", fontWeight: 600, padding: "0.22rem 0.75rem", borderRadius: "9999px", whiteSpace: "nowrap"
                  } : {}}>
                    {plan.badge}
                  </div>
                )}

                <div
                  className={`card-pricing-interactive flex flex-col flex-1 rounded-2xl p-8 relative overflow-hidden${isPro ? " pricing-pro-glow" : ""}`}
                  style={isPro ? {
                    background: "linear-gradient(160deg, #181F33 0%, #0F1420 100%)",
                    border: "1px solid rgba(201,168,76,0.35)",
                    boxShadow: "0 0 80px rgba(201,168,76,0.12), 0 0 0 1px rgba(201,168,76,0.1)",
                    ["--pricing-hover-shadow" as string]: "0 32px 90px rgba(201,168,76,0.18), 0 0 0 1px rgba(201,168,76,0.25)",
                    ["--pricing-hover-border" as string]: "rgba(201,168,76,0.6)",
                  } : isLifetime ? {
                    background: "linear-gradient(160deg, #0C1A15 0%, #0A150F 100%)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    boxShadow: "0 0 60px rgba(16,185,129,0.07)",
                    ["--pricing-hover-shadow" as string]: "0 32px 80px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.3)",
                    ["--pricing-hover-border" as string]: "rgba(16,185,129,0.45)",
                  } : isStarter ? {
                    background: "linear-gradient(160deg, #18150A 0%, #10100B 100%)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    boxShadow: "0 0 40px rgba(245,158,11,0.04)",
                    ["--pricing-hover-shadow" as string]: "0 24px 60px rgba(245,158,11,0.1), 0 0 0 1px rgba(245,158,11,0.25)",
                    ["--pricing-hover-border" as string]: "rgba(245,158,11,0.4)",
                  } : {
                    background: "#0F1420",
                    border: "1px solid rgba(255,255,255,0.07)",
                    ["--pricing-hover-shadow" as string]: "0 24px 60px rgba(0,0,0,0.6)",
                    ["--pricing-hover-border" as string]: "rgba(255,255,255,0.15)",
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-12 right-12 h-px" style={{
                    background: isPro
                      ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)"
                      : isLifetime
                      ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)"
                      : isStarter
                      ? "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
                  }} />

                  {/* Plan name + desc */}
                  <h3
                    className="text-xl font-bold mb-1 mt-1"
                    style={{ color: isPro ? "#DEC27A" : isLifetime ? "#34d399" : isStarter ? "#fbbf24" : "#F0F2F7", fontFamily: "Playfair Display, serif" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-[#6B7A99] text-sm mb-6">{plan.desc}</p>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-start gap-1">
                      {plan.plan !== "free" && (
                        <span className="text-[#6B7A99] text-xl font-medium mt-3">$</span>
                      )}
                      <span
                        className={`font-bold leading-none ${isPro ? "text-gold-gradient" : isLifetime ? "" : "text-[#F0F2F7]"}`}
                        style={{
                          fontFamily: "Playfair Display, serif",
                          fontSize: plan.plan === "free" ? "3.5rem" : "4.5rem",
                          color: isLifetime ? "#34d399" : isStarter ? "#fbbf24" : undefined,
                        }}
                      >
                        {displayPrice === "0" ? "Free" : displayPrice}
                      </span>
                    </div>

                    {/* Annual savings callout */}
                    {isPro && annual && (
                      <div className="flex items-center gap-2 mt-2 mb-1">
                        <span className="text-[#4B5563] text-sm line-through">${plan.price}/mo</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                          You save $120/yr
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-[#6B7A99] text-sm mb-2">{displayPeriod}</p>

                  {/* Lifetime value callout */}
                  {isLifetime && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                      <TrendingUp size={13} className="shrink-0 mt-0.5" style={{ color: "#10b981" }} />
                      <p className="text-[0.78rem] leading-snug" style={{ color: "#6ee7b7" }}>
                        Pay once. Use it every job search, for every role, for the rest of your career — no renewals, no surprises.
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[0.88rem] text-[#9CA3AF]">
                        <CheckCircle size={15} className="shrink-0" style={{ color: isPro ? "#C9A84C" : isLifetime ? "#10b981" : isStarter ? "#f59e0b" : "#6B7A99" }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleCheckout(checkoutPlan)}
                    disabled={checkoutLoading !== null}
                    className={`w-full text-center py-3.5 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPro ? "btn-gold" : isLifetime ? "btn-emerald" : isStarter ? "btn-amber" : "btn-ghost"
                    }`}
                  >
                    {checkoutLoading === plan.plan ? "Redirecting…" : plan.cta}
                  </button>

                  {/* Money-back guarantee for Pro + Starter */}
                  {(isPro || isStarter) && (
                    <div className="flex items-center justify-center gap-1.5 mt-3 text-[0.72rem]" style={{ color: "#22c55e" }}>
                      <Shield size={10} />
                      7-day money-back guarantee, no questions asked
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[#6B7A99] text-sm mt-10 fade-section">
          7-day money-back guarantee on all paid plans. No questions asked.
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
            <p className="text-[#8A9AB8] mb-8 text-lg max-w-md mx-auto">
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

            <p className="text-[#6B7A99] text-xs mt-6">1 free tailor. No card required.</p>
          </div>
        </div>
      </section>

      {/* ── Live activity ticker — floating bottom-left ── */}
      <AnimatePresence mode="wait">
        {tickerOn && (
          <motion.div
            key={tickerIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-8 left-6 z-50 pointer-events-none"
            style={{ maxWidth: "260px" }}
          >
            <div style={{
              background: "rgba(7,9,15,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(201,168,76,0.22)",
              borderRadius: "14px",
              padding: "10px 14px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.06)",
            }}>
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0 animate-pulse" style={{ boxShadow: "0 0 8px rgba(34,197,94,0.6)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug" style={{ color: "#9CA3AF" }}>
                    <span style={{ color: "#F0F2F7", fontWeight: 600 }}>{ACTIVITY_FEED[tickerIdx % ACTIVITY_FEED.length].name}</span>
                    {" "}tailored for{" "}
                    <span style={{ color: "#C9A84C", fontWeight: 600 }}>{ACTIVITY_FEED[tickerIdx % ACTIVITY_FEED.length].company}</span>
                  </p>
                  <p className="text-[0.68rem] mt-0.5 flex items-center gap-1" style={{ color: "#4ade80" }}>
                    <ArrowUp size={9} className="shrink-0" />
                    +{ACTIVITY_FEED[tickerIdx % ACTIVITY_FEED.length].pts} pts · {ACTIVITY_FEED[tickerIdx % ACTIVITY_FEED.length].time} ago
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <a key={item.label} href={item.href} className="text-[#6B7A99] text-sm hover:text-[#9CA3AF] transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-[#4B5563] text-sm">
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
