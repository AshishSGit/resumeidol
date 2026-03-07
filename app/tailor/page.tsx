"use client";

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Upload, FileText, Zap, Download, CheckCircle, AlertCircle,
  RotateCcw, ArrowUp, ChevronRight, Loader2, X, Pencil, Check, ExternalLink, Link2,
  Tag, TrendingUp, ArrowLeftRight, Copy, Crown
} from "lucide-react";

interface TailorResult {
  tailoredResume: string;
  keywordsAdded: string;
  changesMade: string;
  atsScoreBefore: number;
  atsScoreAfter: number;
  gaps: string;
}

function ScoreRing({ before, after }: { before: number; after: number }) {
  const [displayed, setDisplayed] = useState(before);
  const [pulsed, setPulsed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const color = displayed >= 80 ? "#22c55e" : displayed >= 60 ? "#C9A84C" : "#ef4444";
  const offset = circumference - (displayed / 100) * circumference;
  const diff = after - before;

  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      distance: 68 + (i % 3) * 14,
      size: 3 + (i % 3),
    })), []);

  useEffect(() => {
    const duration = 1600;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(before + (after - before) * eased));
      if (progress >= 1) {
        clearInterval(timer);
        setPulsed(true);
        setTimeout(() => setPulsed(false), 600);
        if (after >= 85) {
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 900);
        }
      }
    }, 16);
    return () => clearInterval(timer);
  }, [before, after]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0" style={{ overflow: "visible" }}>
        {/* Gold particle burst on high score */}
        <AnimatePresence>
          {showParticles && particles.map(p => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;
            return (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: "#C9A84C",
                  boxShadow: "0 0 6px rgba(201,168,76,0.9)",
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  pointerEvents: "none",
                  zIndex: 20,
                  display: "block",
                }}
              />
            );
          })}
        </AnimatePresence>
        {/* Glow halo */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}${pulsed ? "40" : "18"} 0%, transparent 70%)`,
            filter: `blur(${pulsed ? "16px" : "8px"})`,
            transition: "all 0.4s ease",
          }}
        />
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.4s ease", filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-4xl leading-none" style={{ color, fontFamily: "Playfair Display, serif" }}>{displayed}</span>
          <span className="text-xs text-[#6B7A99] mt-1 tracking-wider uppercase">/ 100</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-[#6B7A99] mb-2 font-medium">ATS Match Score</p>
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-[#4B5563] text-base line-through">{before}%</span>
          <span className="text-4xl font-bold" style={{ color, fontFamily: "Playfair Display, serif" }}>{after}%</span>
        </div>
        {diff > 0 && (
          <span className="inline-flex items-center gap-1.5 text-base font-semibold text-[#22c55e]">
            <ArrowUp size={15} />+{diff}% improvement
          </span>
        )}
      </div>
    </div>
  );
}

function ScoreArc({ value, size, dim }: { value: number; size: number; dim?: boolean }) {
  const r = size * 0.42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = dim ? "#3A4558" : value >= 80 ? "#22c55e" : value >= 60 ? "#C9A84C" : "#ef4444";
  const cx = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={size * 0.065} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth={size * 0.065}
        strokeDasharray={circ} strokeDashoffset={dim ? circ * 0.55 : offset}
        strokeLinecap="round"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease",
          filter: dim ? "none" : `drop-shadow(0 0 10px ${color}90)`,
        }}
      />
    </svg>
  );
}

function ScoreHero({ before, after, jobTitle }: { before: number; after: number; jobTitle?: string }) {
  const [displayed, setDisplayed] = useState(before);
  const [showParticles, setShowParticles] = useState(false);
  const improvement = after - before;
  const afterColor = after >= 80 ? "#22c55e" : after >= 60 ? "#C9A84C" : "#ef4444";
  const afterLabel = after >= 80 ? "Strong Match" : after >= 65 ? "Good Match" : after >= 45 ? "Fair Match" : "Weak Match";

  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * 360,
      dist: 90 + (i % 3) * 20,
      size: 3 + (i % 3),
    })), []);

  useEffect(() => {
    const duration = 1800;
    const start = Date.now();
    const timer = setInterval(() => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(before + (after - before) * eased));
      if (p >= 1) {
        clearInterval(timer);
        if (after >= 75) { setShowParticles(true); setTimeout(() => setShowParticles(false), 1000); }
      }
    }, 16);
    return () => clearInterval(timer);
  }, [before, after]);

  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 70% 50%, ${afterColor}0A 0%, transparent 70%)` }} />

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-8 items-center py-2">
        {/* ── BEFORE ── */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: "#4B5563" }}>Before</p>
          <div className="relative" style={{ width: 144, height: 144, overflow: "visible" }}>
            <ScoreArc value={before} size={144} dim />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-4xl leading-none" style={{ color: "#4B5563", fontFamily: "Playfair Display, serif" }}>{before}</span>
              <span className="text-[0.6rem] text-[#3A4558] mt-0.5 tracking-wider uppercase">/ 100</span>
            </div>
          </div>
          <p className="text-xs font-medium" style={{ color: "#4B5563" }}>Original resume</p>
        </div>

        {/* ── IMPROVEMENT ── */}
        <div className="flex flex-col items-center gap-3 px-4">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="px-6 py-3 rounded-2xl text-center"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <p className="text-5xl font-black" style={{ color: "#4ade80", fontFamily: "Playfair Display, serif", lineHeight: 1 }}>
                +{improvement}
              </p>
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-[#22c55e] mt-1 font-semibold">pts gained</p>
            </div>
            <div className="flex items-center gap-1 text-[#3A4558]">
              <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <ArrowUp size={14} className="text-[#22c55e]" />
              <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>
          </motion.div>
        </div>

        {/* ── AFTER ── */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: "#4ade80" }}>After Tailoring</p>
          <div className="relative" style={{ width: 170, height: 170, overflow: "visible" }}>
            {/* Particle burst */}
            <AnimatePresence>
              {showParticles && particles.map(p => {
                const rad = (p.angle * Math.PI) / 180;
                return (
                  <motion.span key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                    style={{ position: "absolute", top: "50%", left: "50%", width: p.size, height: p.size, borderRadius: "50%", background: afterColor, boxShadow: `0 0 6px ${afterColor}`, marginLeft: -p.size / 2, marginTop: -p.size / 2, pointerEvents: "none", zIndex: 20 }}
                  />
                );
              })}
            </AnimatePresence>
            {/* Glow halo */}
            <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${afterColor}28 0%, transparent 70%)`, filter: "blur(12px)" }} />
            <ScoreArc value={displayed} size={170} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-black leading-none" style={{ color: afterColor, fontFamily: "Playfair Display, serif", fontSize: "3rem" }}>{displayed}</span>
              <span className="text-[0.6rem] tracking-wider uppercase mt-0.5" style={{ color: afterColor + "99" }}>/ 100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: afterColor, boxShadow: `0 0 10px ${afterColor}` }} />
            <p className="text-sm font-bold" style={{ color: afterColor }}>{afterLabel}</p>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="text-xs font-semibold tracking-wide mt-0.5"
            style={{ color: getPercentile(after).color }}
          >
            {getPercentile(after).text}
          </motion.p>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-[0.14em] text-[#3A4558] font-semibold">ATS Score Range</span>
          <span className="text-xs font-medium" style={{ color: afterColor }}>{after}/100</span>
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, #ef4444 0%, #f59e0b 40%, #C9A84C 65%, #22c55e 100%)", opacity: 0.3 }} />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: `${before}%` }}
            animate={{ width: `${after}%` }}
            transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            style={{ background: `linear-gradient(90deg, #ef4444 0%, ${afterColor} 100%)`, boxShadow: `0 0 12px ${afterColor}60` }}
          />
          {/* Needle */}
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 rounded-full"
            initial={{ left: `${before}%` }}
            animate={{ left: `${after}%` }}
            transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            style={{ background: "white", boxShadow: "0 0 8px white", marginLeft: "-1px" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {["0", "25", "50", "75", "100"].map(v => (
            <span key={v} className="text-[0.6rem] text-[#2A3448]">{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BulletList({ content, icon: Icon, iconColor }: { content: string; icon: typeof CheckCircle; iconColor: string }) {
  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 0 && !/^[-─═*]{2,}$/.test(l));

  return (
    <ul className="space-y-3">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-[#9CA3AF] leading-relaxed">
          <Icon size={16} className="shrink-0 mt-0.5" style={{ color: iconColor }} />
          {line}
        </li>
      ))}
    </ul>
  );
}

// ── Percentile helper ─────────────────────────────────────────────────────────
function getPercentile(score: number): { text: string; color: string } {
  if (score >= 85) return { text: "Top 10% of applicants", color: "#22c55e" };
  if (score >= 75) return { text: "Top 25% of applicants", color: "#22c55e" };
  if (score >= 65) return { text: "Top 35% of applicants", color: "#C9A84C" };
  if (score >= 55) return { text: "Top 50% of applicants", color: "#C9A84C" };
  if (score >= 45) return { text: "Top 65% of applicants", color: "#f59e0b" };
  return { text: "Below average match", color: "#ef4444" };
}

// ── Keyword chips ──────────────────────────────────────────────────────────────
function KeywordChips({ content }: { content: string }) {
  const keywords = content
    .split("\n")
    .map(l => l.replace(/^[-•*\d.]\s*/, "").trim())
    .filter(l => l.length > 2 && l.length < 80 && !/^[-─═*]{2,}$/.test(l));
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.72, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 380, damping: 26 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ background: "rgba(201,168,76,0.09)", border: "1px solid rgba(201,168,76,0.26)", color: "#DEC27A" }}
        >
          <CheckCircle size={11} style={{ color: "#C9A84C", flexShrink: 0 }} />
          {kw}
        </motion.span>
      ))}
    </div>
  );
}

// ── Impact cards (Changes tab) ─────────────────────────────────────────────────
function ImpactCards({ content }: { content: string }) {
  const items = content
    .split("\n")
    .map(l => l.replace(/^[-•*\d.]\s*/, "").trim())
    .filter(l => l.length > 3 && !/^[-─═*]{2,}$/.test(l));
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.055, ease: [0.25, 0.46, 0.45, 0.94], duration: 0.28 }}
          className="flex items-start gap-4 px-4 py-3.5 rounded-xl"
          style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.11)" }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.22)", color: "#4ade80", fontFamily: "Playfair Display, serif" }}
          >
            {i + 1}
          </div>
          <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Gap cards (Gaps tab) ───────────────────────────────────────────────────────
function GapCards({ content }: { content: string }) {
  const items = content
    .split("\n")
    .map(l => l.replace(/^[-•*\d.]\s*/, "").trim())
    .filter(l => l.length > 3 && !/^[-─═*]{2,}$/.test(l));
  const gapCount = items.length;
  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: "#F0F2F7" }}>
            {gapCount} skill gap{gapCount !== 1 ? "s" : ""} to address
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#4B5563", maxWidth: "22rem" }}>
            Skills the employer prioritised that don&apos;t appear in your background. Be ready to discuss these honestly in interviews.
          </p>
        </div>
        <span
          className="px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 mt-0.5"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}
        >
          Be upfront
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.26 }}
            className="flex items-start gap-3.5 px-4 py-3.5 rounded-xl"
            style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.11)" }}
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.28)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.6)" }} />
            </div>
            <p className="text-sm text-[#9CA3AF] leading-relaxed flex-1">{item}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-5 p-4 rounded-xl text-xs leading-relaxed" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#4B5563" }}>
        <span className="font-semibold" style={{ color: "#6B7A99" }}>Interview tip:</span> For each gap, prepare a 1-2 sentence honest response. Interviewers respect candidates who acknowledge gaps and show a plan to close them.
      </div>
    </div>
  );
}

// ── Word-level diff ──────────────────────────────────────────────────────────
type DiffOp = { type: "eq" | "del" | "ins"; text: string };

function computeWordDiff(oldText: string, newText: string): { left: DiffOp[]; right: DiffOp[] } {
  const tok = (s: string) => s.split(/(\s+)/).filter(Boolean);
  const a = tok(oldText).slice(0, 3000);
  const b = tok(newText).slice(0, 3000);
  const m = a.length, n = b.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  const left: DiffOp[] = [], right: DiffOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
      left.unshift({ type: "eq", text: a[i-1] });
      right.unshift({ type: "eq", text: b[j-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      right.unshift({ type: "ins", text: b[j-1] });
      j--;
    } else {
      left.unshift({ type: "del", text: a[i-1] });
      i--;
    }
  }
  return { left, right };
}

function DiffPane({ ops, side }: { ops: DiffOp[]; side: "left" | "right" }) {
  return (
    <div
      className="p-3 rounded-xl text-[0.7rem] leading-relaxed overflow-y-auto font-mono"
      style={{
        background: side === "left" ? "rgba(239,68,68,0.04)" : "rgba(34,197,94,0.04)",
        border: `1px solid ${side === "left" ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.15)"}`,
        maxHeight: "380px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {ops.map((op, idx) => {
        const isWs = /^\s+$/.test(op.text);
        if (op.type === "eq" || isWs) return <span key={idx} className="text-[#9CA3AF]">{op.text}</span>;
        if (side === "left" && op.type === "del")
          return <span key={idx} style={{ background: "rgba(239,68,68,0.3)", color: "#f87171", textDecoration: "line-through", borderRadius: "2px", padding: "0 1px" }}>{op.text}</span>;
        if (side === "right" && op.type === "ins")
          return <span key={idx} style={{ background: "rgba(34,197,94,0.22)", color: "#4ade80", borderRadius: "2px", padding: "0 1px" }}>{op.text}</span>;
        return null;
      })}
    </div>
  );
}

function TailorInner() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from search page
  const [jobTitle, setJobTitle] = useState(searchParams.get("jobTitle") || "");
  const [company, setCompany] = useState(searchParams.get("company") || "");
  const [jobDescription, setJobDescription] = useState(searchParams.get("jobDescription") || "");
  const [applyUrl] = useState(searchParams.get("applyUrl") || "");
  const [jobUrl, setJobUrl] = useState("");
  const [fetchingJd, setFetchingJd] = useState(false);
  const [fetchJdError, setFetchJdError] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [savedResumeName, setSavedResumeName] = useState<string | null>(null);
  const [savedResumeDate, setSavedResumeDate] = useState<string | null>(null);
  const [usingCloudResume, setUsingCloudResume] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingTip, setLoadingTip] = useState(0);
  const [loadingElapsed, setLoadingElapsed] = useState(0);
  const LOADING_STEPS = [
    { label: "Parsing your resume", duration: 3500 },
    { label: "Analysing job requirements", duration: 4000 },
    { label: "Optimising keywords & phrasing", duration: 5000 },
    { label: "Finalising your resume", duration: 99999 },
  ];
  const LOADING_TIPS = [
    "The average job gets 250+ applications. Yours is about to look like it was made for this role.",
    "Recruiters spend just 6 seconds scanning a resume. We're making every second count.",
    "ATS filters reject 75% of resumes before a human ever sees them. You're about to beat that.",
    "Your resume is being rewritten to mirror the exact language this hiring team uses.",
    "Top candidates tailor every application. That used to take hours. Now it takes seconds.",
  ];
  const [result, setResult] = useState<TailorResult | null>(null);
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "compare" | "keywords" | "changes" | "gaps">("resume");
  const [editMode, setEditMode] = useState(false);
  const [editedResume, setEditedResume] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [isStarter, setIsStarter] = useState(false);
  const [tailorCount, setTailorCount] = useState(0);
  const FREE_LIMIT = 1;
  const STARTER_LIMIT = 8;
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadedDocx, setDownloadedDocx] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);
  const [streamedResume, setStreamedResume] = useState("");
  const [streamComplete, setStreamComplete] = useState(true);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingTipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadingElapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const pendingActionRef = useRef<"pdf" | "docx" | "copy" | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInSent, setSignInSent] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  // ── Results blur gate (fires when tailoring completes for unauthenticated users) ──
  const [showResultsGate, setShowResultsGate] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateLoading, setGateLoading] = useState(false);
  const [gateSent, setGateSent] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  // Refs so onAuthStateChange always calls the latest handler version (avoids stale closure)
  const handleDownloadDocxRef = useRef<(() => void) | null>(null);
  const handleDownloadPdfRef = useRef<(() => void) | null>(null);
  const handleCopyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const init = async () => {
      // Server-side pro check (owner bypass via OWNER_EMAIL env var)
      const res = await fetch("/api/pro-status");
      const { isPro: serverPro, plan: serverPlan } = await res.json();
      if (serverPro) {
        setIsPro(true);
      } else if (serverPlan === "starter") {
        setIsStarter(true);
        const monthKey = `resumeidol_tailor_${new Date().toISOString().slice(0, 7)}`;
        setTailorCount(parseInt(localStorage.getItem(monthKey) ?? "0"));
      } else {
        // Free: one-time limit (not monthly)
        const freeUsed = localStorage.getItem("resumeidol_free_used") === "1";
        setTailorCount(freeUsed ? 1 : 0);
      }
      if (!localStorage.getItem("resumeidol_onboarded")) setShowOnboarding(true);

      // Auto-load saved resume from cloud
      try {
        const savedRes = await fetch("/api/resume");
        const { resume } = await savedRes.json();
        if (resume?.resume_text && !resumeText) {
          setResumeText(resume.resume_text);
          setSavedResumeName(resume.file_name ?? "Saved resume");
          setSavedResumeDate(new Date(resume.updated_at).toLocaleDateString());
          setUsingCloudResume(true);
        }
      } catch {
        // Silent — saved resume is a nice-to-have
      }
    };
    init();

    // Track auth state — get current user + fire pending action on sign-in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      // Restore result saved before magic-link redirect (user just signed in via link)
      if (u) {
        try {
          const pendingStr = sessionStorage.getItem("resumeidol_pending_result");
          if (pendingStr) {
            const pending = JSON.parse(pendingStr);
            sessionStorage.removeItem("resumeidol_pending_result");
            setResult(pending.result);
            setEditedResume(pending.result.tailoredResume);
            setOriginalResumeText(pending.resumeText ?? "");
            if (pending.jobTitle) setJobTitle(pending.jobTitle);
            if (pending.company) setCompany(pending.company);
            if (pending.resumeText) setResumeText(pending.resumeText);
          }
        } catch { /* sessionStorage not available */ }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Dissolve results blur gate
        setShowResultsGate(false);
        // Fire any action the user tried before signing in
        const pending = pendingActionRef.current;
        pendingActionRef.current = null;
        setShowSignInModal(false);
        if (pending === "docx") setTimeout(() => handleDownloadDocxRef.current?.(), 300);
        if (pending === "pdf") setTimeout(() => handleDownloadPdfRef.current?.(), 300);
        if (pending === "copy") setTimeout(() => handleCopyRef.current?.(), 300);
      } else {
        // Clear personal data when user signs out
        setResumeText("");
        setResumeFile(null);
        setUsingCloudResume(false);
        setSavedResumeName(null);
        setSavedResumeDate(null);
        setResult(null);
        setError(null);
        setOriginalResumeText("");
        setEditedResume("");
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }

    setResumeFile(file);
    setError(null);
    setParsing(true);

    try {
      let parsed = "";
      if (file.type === "text/plain") {
        parsed = await file.text();
        setResumeText(parsed);
      } else {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          parsed = data.text;
          setResumeText(parsed);
        } else {
          setResumeText("");
          setError("Auto-parsing unavailable — please paste your resume text below.");
        }
      }

      // Auto-save to cloud if we got text
      if (parsed.trim()) {
        setUsingCloudResume(false);
        setSavedResumeName(file.name);
        setSavedResumeDate(new Date().toLocaleDateString());
        fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: parsed, file_name: file.name }),
        }).catch(() => {});
      }
    } catch {
      setError("Could not read file. Please paste your resume text below.");
    } finally {
      setParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFetchJd = async () => {
    if (!jobUrl.trim()) return;
    setFetchingJd(true);
    setFetchJdError(null);
    try {
      const res = await fetch("/api/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchJdError(data.error || "Could not fetch job description.");
        return;
      }
      setJobDescription(data.text);
      // Try to parse job title + company from page title (e.g. "Senior Engineer at Stripe | Greenhouse")
      if (data.pageTitle && !jobTitle && !company) {
        const atMatch = data.pageTitle.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[|\-–]|$)/i);
        if (atMatch) {
          setJobTitle(atMatch[1].trim());
          setCompany(atMatch[2].trim());
        }
      }
    } catch {
      setFetchJdError("Could not fetch that URL. Please paste the job description manually.");
    } finally {
      setFetchingJd(false);
    }
  };

  const handleTailor = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the job description.");
      return;
    }

    if (!isPro && !isStarter && tailorCount >= FREE_LIMIT) {
      setError("You've used your 1 free tailor. Upgrade to Starter ($9/mo) or Pro for more.");
      return;
    }
    if (isStarter && tailorCount >= STARTER_LIMIT) {
      setError(`You've used all ${STARTER_LIMIT} Starter tailors this month. Upgrade to Pro for unlimited.`);
      return;
    }

    setTailoring(true);
    setLoadingStep(0);
    setLoadingElapsed(0);
    setLoadingTip(0);
    setError(null);
    // Tip rotation + elapsed counter
    if (loadingTipTimerRef.current) clearInterval(loadingTipTimerRef.current);
    if (loadingElapsedTimerRef.current) clearInterval(loadingElapsedTimerRef.current);
    loadingTipTimerRef.current = setInterval(() => setLoadingTip(t => (t + 1) % 5), 5000);
    loadingElapsedTimerRef.current = setInterval(() => setLoadingElapsed(e => e + 1), 1000);
    setResult(null);
    setOriginalResumeText(resumeText);

    // Advance loading steps on a timer
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (let s = 0; s < LOADING_STEPS.length - 1; s++) {
      elapsed += LOADING_STEPS[s].duration;
      const nextStep = s + 1;
      const t = setTimeout(() => { setLoadingStep(nextStep); }, elapsed);
      stepTimers.push(t);
    }

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, company, jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Tailoring failed.");
      }

      setResult(data);
      setEditedResume(data.tailoredResume);
      setEditMode(false);
      // Show blur gate for unauthenticated users — fires at moment of maximum desire
      if (!user) {
        setShowResultsGate(true);
        setGateSent(false);
        setGateEmail("");
        setGateError(null);
        // Persist result so magic-link page reload can restore it
        try {
          sessionStorage.setItem("resumeidol_pending_result", JSON.stringify({
            result: data,
            jobTitle,
            company,
            resumeText,
          }));
        } catch { /* sessionStorage not available */ }
      }
      // Stream the tailored resume line by line
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      setStreamedResume("");
      setStreamComplete(false);
      const resumeLines = data.tailoredResume.split("\n");
      let lineIdx = 0;
      streamTimerRef.current = setInterval(() => {
        lineIdx++;
        setStreamedResume(resumeLines.slice(0, lineIdx).join("\n"));
        if (lineIdx >= resumeLines.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current);
          setStreamComplete(true);
          setStreamedResume(data.tailoredResume);
        }
      }, 75);
      setActiveTab("resume");
      // Increment usage counter
      if (!isPro) {
        if (isStarter) {
          const monthKey = `resumeidol_tailor_${new Date().toISOString().slice(0, 7)}`;
          const newCount = tailorCount + 1;
          localStorage.setItem(monthKey, String(newCount));
          setTailorCount(newCount);
        } else {
          // Free: one-time use flag
          localStorage.setItem("resumeidol_free_used", "1");
          setTailorCount(1);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      stepTimers.forEach(clearTimeout);
      if (loadingTipTimerRef.current) { clearInterval(loadingTipTimerRef.current); loadingTipTimerRef.current = null; }
      if (loadingElapsedTimerRef.current) { clearInterval(loadingElapsedTimerRef.current); loadingElapsedTimerRef.current = null; }
      setTailoring(false);
    }
  };

  const requireAuth = useCallback((action: "pdf" | "docx" | "copy"): boolean => {
    if (user) return false;
    pendingActionRef.current = action;
    setShowSignInModal(true);
    setSignInSent(false);
    setSignInError(null);
    setSignInEmail("");
    return true;
  }, [user]);

  const handleDownloadDocx = async () => {
    if (requireAuth("docx")) return;
    if (!result) return;
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: editedResume, fileName: `resume-${company || "resumeidol"}` }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${company || "resumeidol"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedDocx(true);
      setTimeout(() => setDownloadedDocx(false), 2500);
    } catch {
      setError("DOCX download failed. Try copying the text instead.");
    }
  };

  const handleDownloadPdf = async () => {
    if (requireAuth("pdf")) return;
    if (!result) return;
    try {
      const res = await fetch("/api/download/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: editedResume, jobTitle, company }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${company || "resumeidol"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadedPdf(true);
      setTimeout(() => setDownloadedPdf(false), 2500);
    } catch {
      setError("PDF download failed. Try the .docx option instead.");
    }
  };

  // Keep refs current so onAuthStateChange always calls the latest handler
  handleDownloadDocxRef.current = handleDownloadDocx;
  handleDownloadPdfRef.current = handleDownloadPdf;
  handleCopyRef.current = () => {
    navigator.clipboard.writeText(editedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const diffOps = useMemo(
    () => (result && originalResumeText ? computeWordDiff(originalResumeText, result.tailoredResume) : { left: [], right: [] }),
    [result, originalResumeText]
  );

  const tabCounts = useMemo(() => {
    if (!result) return { keywords: 0, changes: 0, gaps: 0 };
    const count = (s: string) => s.split("\n").filter(l => l.replace(/^[-•*\d.]\s*/, "").trim().length > 3).length;
    return { keywords: count(result.keywordsAdded), changes: count(result.changesMade), gaps: count(result.gaps) };
  }, [result]);

  const withinLimit = isPro || (isStarter ? tailorCount < STARTER_LIMIT : tailorCount < FREE_LIMIT);
  const canTailor = resumeText.trim().length > 50 && jobDescription.trim().length > 50 && withinLimit;
  const step1Done = jobDescription.trim().length > 30;
  const step2Done = resumeText.trim().length > 50;
  // When results are in, step 3 is also done (show all checkmarks)
  const currentStep = result ? 4 : !step1Done ? 1 : !step2Done ? 2 : 3;

  return (
    <div className="min-h-screen relative" style={{ background: "#07090F" }}>
      {/* Ambient background */}
      <div className="dot-grid absolute inset-0 pointer-events-none" style={{ opacity: 0.35, zIndex: 0 }} />
      <div className="orb-1 absolute top-32 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)", zIndex: 0 }} />
      <div className="orb-2 absolute top-2/3 right-1/5 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 65%)", zIndex: 0 }} />
      <Navbar />

      <div className="relative z-10 pt-24 pb-20 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14 card-enter" style={{ animationDelay: "0ms" }}>
          <div className="badge-gold mb-6">
            <Crown size={11} />
            <span>Resume Tailor</span>
          </div>
          <h1
            style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2.25rem, 4vw, 3.5rem)", fontWeight: 700, color: "#F0F2F7", lineHeight: 1.1 }}
          >
            Tailor your resume.<br />
            <span className="shimmer-text">Beat ATS. Win interviews.</span>
          </h1>
          <p className="text-[#8A97AA] mt-5 max-w-xl text-base leading-relaxed">
            Paste a job URL or description, upload your resume, and let ResumeIdol rewrite it to maximise your match score — preserving your authentic voice.
          </p>
          <div className="gold-line mt-8 max-w-sm" />
        </div>

        {/* Onboarding hint — first visit only */}
        {showOnboarding && (
          <div
            className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 stagger-reveal"
            style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <div className="flex-1">
              <p className="text-[#DEC27A] text-sm font-semibold mb-3 flex items-center gap-1.5">
                <Zap size={13} />
                Get started in 3 steps
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                {[
                  "Paste a job URL or the full description",
                  "Upload your resume or paste the text",
                  "Hit Tailor — ResumeIdol rewrites it for you",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[#9CA3AF]">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5"
                      style={{ background: "rgba(201,168,76,0.15)", color: "#DEC27A", border: "1px solid rgba(201,168,76,0.3)" }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => { localStorage.setItem("resumeidol_onboarded", "1"); setShowOnboarding(false); }}
              className="text-xs text-[#4B5563] hover:text-[#6B7A99] transition-colors shrink-0 px-3 py-1.5 rounded-lg"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              Got it ✕
            </button>
          </div>
        )}

        {/* ── Step Indicator (hidden during tailoring for clean loading experience) ── */}
        {!tailoring && <div className="mb-10 card-enter" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-center gap-0">
            {([
              { n: 1, label: "Job Details" },
              { n: 2, label: "Your Resume" },
              { n: 3, label: "Results" },
            ]).map(({ n, label }, i) => {
              const done = currentStep > n;
              const active = currentStep === n;
              return (
                <div key={n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 text-sm font-bold"
                      style={{
                        background: done ? "rgba(201,168,76,0.2)" : active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                        border: done || active ? "1px solid rgba(201,168,76,0.45)" : "1px solid rgba(255,255,255,0.08)",
                        color: done ? "#C9A84C" : active ? "#DEC27A" : "#4B5563",
                        boxShadow: active ? "0 0 20px rgba(201,168,76,0.25)" : "none",
                      }}
                    >
                      {done ? <CheckCircle size={16} style={{ color: "#C9A84C" }} /> : (active && n === 3) ? <Zap size={15} style={{ color: "#DEC27A" }} /> : n}
                    </div>
                    <span className="text-[0.68rem] font-medium transition-colors duration-300" style={{ color: active ? "#DEC27A" : done ? "#C9A84C" : "#4B5563" }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="w-20 sm:w-32 h-px mx-2 mb-4 transition-all duration-500" style={{ background: currentStep > n ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>}

        <div className={`grid gap-7 ${result ? "grid-cols-1 max-w-5xl mx-auto w-full" : "grid-cols-1 max-w-2xl mx-auto w-full"}`}>
          {/* ── LEFT PANEL: Inputs — hidden during tailoring AND after results arrive ── */}
          <AnimatePresence>
          {!tailoring && !result && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {/* Job info */}
            <div className="card-input p-8 card-enter" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <FileText size={16} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.15rem", fontWeight: 600, color: "#F0F2F7", lineHeight: 1.2 }}>Job Details</h2>
                  <p className="text-xs text-[#4B5563] mt-0.5">The role you&apos;re applying for</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#6B7A99] mb-2 block font-medium">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Designer"
                      className="input-luxury w-full px-4 py-3.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7A99] mb-2 block font-medium">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Linear"
                      className="input-luxury w-full px-4 py-3.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#6B7A99] mb-2 block font-medium">
                    Job Description <span className="text-[#ef4444]">*</span>
                  </label>

                  {/* URL fetch bar */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Link2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => { setJobUrl(e.target.value); setFetchJdError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleFetchJd()}
                        placeholder="Paste job URL to auto-fill (Greenhouse, Lever, Workday…)"
                        className="input-luxury w-full pl-9 pr-3 py-3 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleFetchJd}
                      disabled={!jobUrl.trim() || fetchingJd}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#DEC27A" }}
                    >
                      {fetchingJd ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                      {fetchingJd ? "Fetching…" : "Auto-fill"}
                    </button>
                  </div>
                  {fetchJdError && (
                    <p className="text-sm text-[#f87171] mb-2">{fetchJdError}</p>
                  )}
                  {jobDescription && jobUrl && !fetchingJd && !fetchJdError && (
                    <p className="text-sm text-[#22c55e] mb-2 flex items-center gap-1.5">
                      <CheckCircle size={13} /> Job description loaded from URL
                    </p>
                  )}

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here, or use the URL auto-fill above..."
                    rows={10}
                    className="input-luxury w-full px-4 py-3.5 text-sm resize-none"
                    style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#4B5563]">{jobDescription.length} chars</span>
                    {applyUrl && (
                      <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6B7A99] hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                        View original posting <ChevronRight size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resume upload — revealed when job details filled */}
            <AnimatePresence>
            {step1Done && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
            <div className="card-input p-8" style={{ border: step2Done ? "1px solid rgba(201,168,76,0.25)" : undefined }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <Upload size={16} className="text-[#C9A84C]" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.15rem", fontWeight: 600, color: "#F0F2F7", lineHeight: 1.2 }}>Your Resume</h2>
                  <p className="text-xs text-[#4B5563] mt-0.5">Upload a file or paste text below</p>
                </div>
              </div>

              {/* Saved resume banner */}
              {usingCloudResume && savedResumeName && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={15} className="text-[#C9A84C] shrink-0" />
                    <div>
                      <span className="text-sm text-[#DEC27A] font-medium">Using saved resume</span>
                      <span className="text-xs text-[#6B7A99] ml-2">{savedResumeName} · {savedResumeDate}</span>
                    </div>
                  </div>
                  <button
                    className="text-sm text-[#6B7A99] hover:text-[#9CA3AF] transition-colors"
                    onClick={() => { setResumeText(""); setResumeFile(null); setUsingCloudResume(false); }}
                  >
                    Replace
                  </button>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`upload-zone py-10 px-8 text-center mb-5 cursor-pointer ${dragOver ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {parsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={28} className="text-[#C9A84C] animate-spin" />
                    <span className="text-base text-[#6B7A99]">Parsing resume...</span>
                  </div>
                ) : resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={24} className="text-[#C9A84C]" />
                    <div className="text-left">
                      <p className="text-[#F0F2F7] text-base font-medium">{resumeFile.name}</p>
                      <p className="text-[#6B7A99] text-sm">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      className="ml-3 text-[#4B5563] hover:text-[#6B7A99] transition-colors"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResumeText(""); }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)" }}>
                      <Upload size={22} className="text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-[#9CA3AF] text-base font-medium">Drop your resume here</p>
                      <p className="text-[#6B7A99] text-sm mt-0.5">or click to browse</p>
                    </div>
                    <span className="text-xs text-[#4B5563] px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>PDF · DOCX · TXT</span>
                  </div>
                )}
              </div>

              {/* Text fallback */}
              <div>
                <label className="text-sm text-[#6B7A99] mb-2 block font-medium">
                  Resume Text <span className="text-[#4B5563] font-normal">(or paste directly)</span>
                  <span className="text-[#ef4444] ml-0.5">*</span>
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); setUsingCloudResume(false); }}
                  onBlur={(e) => {
                    const text = e.target.value.trim();
                    if (text.length > 50) {
                      fetch("/api/resume", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ resume_text: text, file_name: "Pasted resume" }),
                      }).catch(() => {});
                    }
                  }}
                  placeholder="Paste your resume content here..."
                  rows={12}
                  className="input-luxury w-full px-4 py-3.5 resize-none font-mono"
                  style={{ fontSize: "0.8rem", lineHeight: 1.7 }}
                />
                <span className="text-xs text-[#4B5563]">{resumeText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
            </motion.div>
            )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={17} className="text-[#f87171] shrink-0 mt-0.5" />
                <span className="text-[#f87171] text-sm">{error}</span>
              </div>
            )}

            {/* Tailor button — only shown when resume is ready */}
            <AnimatePresence>
            {(step2Done || tailoring) && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
              >
                <button
                  onClick={handleTailor}
                  disabled={!canTailor || tailoring}
                  className={`btn-gold w-full py-5 rounded-2xl font-semibold flex items-center justify-center gap-2.5 text-lg disabled:opacity-40 disabled:cursor-not-allowed${step2Done && !tailoring ? " btn-gold-hero" : ""}`}
                >
                  {tailoring ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      ResumeIdol is tailoring your resume...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Tailor My Resume
                    </>
                  )}
                </button>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Step hint when not ready */}
            {!step1Done && (
              <p className="text-center text-sm text-[#4B5563]">Fill in the job details above to get started</p>
            )}
            {step1Done && !step2Done && (
              <p className="text-center text-sm text-[#4B5563]">Add your resume above to unlock tailoring</p>
            )}

            {/* Usage indicator */}
            {!isPro && (
              <div className="text-center">
                {isStarter ? (
                  tailorCount >= STARTER_LIMIT ? (
                    <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <p className="text-[#f87171] font-medium mb-1.5 text-sm">All 8 Starter tailors used this month</p>
                      <p className="text-[#6B7A99] text-sm">
                        <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Upgrade to Pro ($29/mo)</a>
                        {" "}for unlimited tailoring or{" "}
                        <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Lifetime ($349)</a>
                        {" "}for forever access.
                      </p>
                    </div>
                  ) : tailorCount >= STARTER_LIMIT - 2 ? (
                    <div className="p-4 rounded-xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                      <p className="text-[#DEC27A] font-medium mb-1 text-sm">Only {STARTER_LIMIT - tailorCount} Starter tailor{STARTER_LIMIT - tailorCount !== 1 ? "s" : ""} left this month</p>
                      <p className="text-[#6B7A99] text-sm">
                        <a href="/#pricing" className="text-[#C9A84C] hover:underline">Upgrade to Pro</a> for unlimited.
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#6B7A99] text-sm">{STARTER_LIMIT - tailorCount} of {STARTER_LIMIT} tailors remaining this month</p>
                  )
                ) : tailorCount >= FREE_LIMIT ? (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-[#f87171] font-medium mb-1.5 text-sm">Free tailor used</p>
                    <p className="text-[#6B7A99] text-sm">
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Starter ($9/mo)</a>
                      {" "}for 8/month,{" "}
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Pro ($29/mo)</a>
                      {" "}for unlimited, or{" "}
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Lifetime ($349)</a>.
                    </p>
                  </div>
                ) : (
                  <p className="text-[#6B7A99] text-sm">1 free tailor available — no card needed</p>
                )}
              </div>
            )}
          </motion.div>
          )}
          </AnimatePresence>

          {/* Results */}
          {result && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* ── ATS Score Hero ── */}
                <motion.div
                  className="overflow-hidden rounded-2xl stagger-reveal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    background: "linear-gradient(160deg, #111827 0%, #0B0E1A 100%)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    boxShadow: "0 0 80px rgba(201,168,76,0.07), 0 0 0 1px rgba(201,168,76,0.06)",
                  }}
                >
                  {/* Shimmer top line */}
                  <div style={{ height: "2px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 20%, rgba(222,194,122,1) 50%, rgba(201,168,76,0.4) 80%, transparent 100%)" }} />

                  <div className="p-8 pb-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] font-semibold mb-1.5" style={{ color: "#3A4558" }}>Analysis Complete</p>
                        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.7rem", fontWeight: 700, color: "#F0F2F7", lineHeight: 1.05 }}>
                          {result.atsScoreAfter >= 75 ? "Strong match secured" : result.atsScoreAfter >= 55 ? "Competitive position built" : "Resume analysis complete"}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        {applyUrl && (
                          <a
                            href={applyUrl} target="_blank" rel="noopener noreferrer"
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                              background: "linear-gradient(135deg, #C9A84C 0%, #B8952F 100%)",
                              color: "#07090F",
                              boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(201,168,76,0.45)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(201,168,76,0.3)"; }}
                          >
                            Apply Now
                            <ExternalLink size={13} />
                          </a>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                          <CheckCircle size={11} />
                          Optimised
                        </div>
                      </div>
                    </div>

                    {/* Score hero */}
                    <ScoreHero before={result.atsScoreBefore} after={result.atsScoreAfter} jobTitle={jobTitle || undefined} />

                    {/* Stats banner */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.9, duration: 0.4 }}
                      className="grid grid-cols-3 gap-3 mt-6"
                    >
                      {[
                        { value: tabCounts.keywords, label: "Keywords injected", icon: Tag, color: "#C9A84C" },
                        { value: tabCounts.changes, label: "Improvements made", icon: TrendingUp, color: "#22c55e" },
                        { value: tabCounts.gaps, label: "Gaps identified", icon: AlertCircle, color: "#f59e0b" },
                      ].map(({ value, label, icon: Icon, color }, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.9 + i * 0.1 }}
                          className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center"
                          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <Icon size={13} style={{ color }} />
                          <span className="text-xl font-black" style={{ color, fontFamily: "Playfair Display, serif", lineHeight: 1 }}>{value}</span>
                          <span className="text-[0.62rem] uppercase tracking-[0.12em] font-medium" style={{ color: "#3A4558" }}>{label}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Conditional banners */}
                    {result.atsScoreAfter >= 80 && result.atsScoreAfter - result.atsScoreBefore >= 10 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center gap-3 mt-6 p-4 rounded-xl"
                        style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.12)" }}>
                          <TrendingUp size={15} className="text-[#22c55e]" />
                        </div>
                        <div>
                          <p className="text-[#22c55e] text-sm font-semibold">Top candidate tier</p>
                          <p className="text-[#4B5563] text-xs mt-0.5">Your tailored resume is now in the top 25% for this role</p>
                        </div>
                      </motion.div>
                    )}
                    {result.atsScoreAfter < 20 && (
                      <div className="flex items-center gap-3 mt-6 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <AlertCircle size={16} className="text-[#f87171] shrink-0" />
                        <span className="text-[#f87171] text-sm">Low score — the job description may be incomplete. Try pasting the full description for better results.</span>
                      </div>
                    )}

                    {/* Mobile apply button */}
                    {applyUrl && (
                      <a
                        href={applyUrl} target="_blank" rel="noopener noreferrer"
                        className="sm:hidden flex items-center justify-center gap-2 mt-6 py-3.5 rounded-xl text-sm font-semibold"
                        style={{ background: "linear-gradient(135deg, #C9A84C 0%, #B8952F 100%)", color: "#07090F", boxShadow: "0 4px 20px rgba(201,168,76,0.3)" }}
                      >
                        Apply Now with Tailored Resume <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </motion.div>

                {/* ── Blur gate wrapper: tabs + re-tailor blurred until sign-in ── */}
                <div className="relative">
                  <div style={showResultsGate ? { filter: "blur(6px)", pointerEvents: "none", userSelect: "none", transition: "filter 0.6s ease" } : { transition: "filter 0.6s ease" }}>
                {/* Tabs */}
                <div className="card-input overflow-hidden stagger-reveal" style={{ animationDelay: "180ms" }}>
                  {/* Gold accent line at top */}
                  <div style={{ height: "2px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 40%, rgba(201,168,76,0.7) 60%, transparent 100%)" }} />
                  {/* Tab bar with animated sliding indicator */}
                  <div className="px-3 pt-3 pb-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
                    <div className="flex gap-0.5 overflow-x-auto">
                      {([
                        { id: "resume",   label: "Tailored Resume", icon: FileText },
                        { id: "compare",  label: "Compare",         icon: ArrowLeftRight },
                        { id: "keywords", label: "Keywords",        icon: Tag },
                        { id: "changes",  label: "Changes",         icon: TrendingUp },
                        { id: "gaps",     label: "Gaps",            icon: AlertCircle },
                      ] as const).map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative flex items-center gap-1.5 py-3 px-3.5 text-[0.8rem] font-medium rounded-t-lg transition-colors duration-150 whitespace-nowrap"
                            style={{ color: active ? "#DEC27A" : "#4B5563" }}
                          >
                            {active && (
                              <motion.div
                                layoutId="tab-pill"
                                className="absolute inset-0 rounded-t-lg"
                                style={{
                                  background: "rgba(201,168,76,0.08)",
                                  borderTop: "1px solid rgba(201,168,76,0.2)",
                                  borderLeft: "1px solid rgba(201,168,76,0.1)",
                                  borderRight: "1px solid rgba(201,168,76,0.1)",
                                  borderBottom: "1px solid #07090F",
                                  bottom: "-1px",
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                            )}
                            <tab.icon size={13} className="relative z-10 shrink-0" />
                            <span className="relative z-10">{tab.label}</span>
                            {tab.id === "keywords" && tabCounts.keywords > 0 && (
                              <span className="relative z-10 ml-0.5 px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold leading-none" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>{tabCounts.keywords}</span>
                            )}
                            {tab.id === "changes" && tabCounts.changes > 0 && (
                              <span className="relative z-10 ml-0.5 px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold leading-none" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>{tabCounts.changes}</span>
                            )}
                            {tab.id === "gaps" && tabCounts.gaps > 0 && (
                              <span className="relative z-10 ml-0.5 px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold leading-none" style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>{tabCounts.gaps}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="p-6"
                  >
                    {activeTab === "resume" && (
                      <div>
                        {/* Resume display */}
                        {/* Resume content */}
                        {editMode ? (
                          <textarea
                            value={editedResume}
                            onChange={(e) => setEditedResume(e.target.value)}
                            className="input-luxury w-full px-4 py-4 leading-relaxed font-mono resize-none mb-5"
                            style={{ minHeight: "460px", fontSize: "0.83rem", color: "#D4DBE8", lineHeight: 1.82 }}
                            spellCheck={false}
                          />
                        ) : (
                          <div className="relative mb-5">
                          <div
                            className="p-5 rounded-xl leading-relaxed whitespace-pre-wrap overflow-y-auto font-mono"
                            style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "460px", fontSize: "0.83rem", color: "#C4CEDF", lineHeight: 1.82 }}
                          >
                            {streamComplete ? editedResume : streamedResume}
                            {!streamComplete && (
                              <span
                                className="inline-block animate-pulse"
                                style={{ width: "2px", height: "13px", background: "#C9A84C", marginLeft: "2px", verticalAlign: "text-bottom" }}
                              />
                            )}
                          </div>
                          {/* Bottom fade — hints there's more to scroll */}
                          <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-xl pointer-events-none" style={{ background: "linear-gradient(to top, rgba(7,9,15,0.7) 0%, transparent 100%)" }} />
                          </div>
                        )}

                        {/* Action row */}
                        <div className="pt-6 mt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {editMode ? (
                            <p className="text-xs uppercase tracking-widest text-[#3A4558] font-semibold mb-4">Editing — changes apply to downloads</p>
                          ) : (
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" }}>
                                <Crown size={16} style={{ color: "#C9A84C" }} />
                              </div>
                              <div>
                                <p className="text-base font-bold" style={{ color: "#DEC27A" }}>Your resume is interview-ready</p>
                                <p className="text-sm" style={{ color: "#4B5563" }}>Tailored specifically for this role — download to apply</p>
                              </div>
                            </div>
                          )}

                          {/* Primary CTA — PDF full width */}
                          <button
                            onClick={handleDownloadPdf}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-base transition-all mb-3"
                            style={downloadedPdf
                              ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", boxShadow: "0 4px 16px rgba(34,197,94,0.15)" }
                              : { background: "linear-gradient(135deg, #C9A84C 0%, #B8952F 100%)", color: "#07090F", boxShadow: "0 6px 28px rgba(201,168,76,0.35)" }
                            }
                          >
                            {downloadedPdf ? <CheckCircle size={17} /> : <Download size={17} />}
                            {downloadedPdf ? "Downloaded! Good luck." : "Download PDF"}
                            {!downloadedPdf && <span className="text-xs font-normal opacity-60 ml-1">Best for applications</span>}
                          </button>

                          {/* Secondary row — DOCX + Copy */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button
                              onClick={handleDownloadDocx}
                              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                              style={downloadedDocx
                                ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }
                                : { background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(29,78,216,0.08) 100%)", border: "1px solid rgba(96,165,250,0.25)", color: "#93c5fd", boxShadow: "0 4px 14px rgba(37,99,235,0.1)" }
                              }
                            >
                              {downloadedDocx ? <CheckCircle size={14} /> : <Download size={14} />}
                              {downloadedDocx ? "Saved!" : "Word .docx"}
                            </button>
                            <button
                              onClick={() => {
                                if (requireAuth("copy")) return;
                                navigator.clipboard.writeText(editedResume);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                              }}
                              className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                              style={copied
                                ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }
                                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#9CA3AF" }
                              }
                            >
                              <Copy size={14} />
                              {copied ? "Copied!" : "Copy text"}
                            </button>
                          </div>

                          {/* Tertiary — edit toggle */}
                          <button
                            onClick={() => setEditMode(!editMode)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={editMode
                              ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)", color: "#DEC27A" }
                              : { background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#4B5563" }
                            }
                          >
                            {editMode ? <Check size={13} /> : <Pencil size={13} />}
                            {editMode ? "Done editing" : "Edit before downloading"}
                          </button>
                        </div>
                      </div>
                    )}
                    {activeTab === "compare" && (
                      <div>
                        <div className="flex items-center gap-4 mb-5">
                          <div className="flex items-center gap-2 text-sm text-[#6B7A99]">
                            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)" }} />
                            Original
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#6B7A99]">
                            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)" }} />
                            Tailored
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium" style={{ color: "#f87171" }}>Original</span>
                              <span className="badge-gold text-[0.65rem]">{result.atsScoreBefore}% ATS</span>
                            </div>
                            <DiffPane ops={diffOps.left} side="left" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#4ade80]">Tailored</span>
                              <span className="badge-green text-[0.65rem]">{result.atsScoreAfter}% ATS</span>
                            </div>
                            <DiffPane ops={diffOps.right} side="right" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2 p-4 rounded-xl text-sm" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}>
                          <ArrowUp size={14} className="text-[#22c55e]" />
                          <span className="text-[#9CA3AF]">ATS score lifted from <span className="text-[#f87171] font-semibold">{result.atsScoreBefore}%</span> → <span className="text-[#4ade80] font-semibold">{result.atsScoreAfter}%</span> — a <span className="text-[#C9A84C] font-bold">+{result.atsScoreAfter - result.atsScoreBefore}% improvement</span></span>
                        </div>
                      </div>
                    )}
                    {activeTab === "keywords" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="text-base font-semibold" style={{ color: "#F0F2F7" }}>
                              <span style={{ color: "#C9A84C", fontFamily: "Playfair Display, serif" }}>{tabCounts.keywords}</span> keywords injected
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Naturally woven into your resume for maximum ATS relevance</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)", color: "#C9A84C" }}>ATS Optimised</span>
                        </div>
                        <KeywordChips content={result.keywordsAdded} />
                      </div>
                    )}
                    {activeTab === "changes" && (
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="text-base font-semibold" style={{ color: "#F0F2F7" }}>
                              <span style={{ color: "#4ade80", fontFamily: "Playfair Display, serif" }}>{tabCounts.changes}</span> improvements made
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Every change was crafted to strengthen your candidacy for this specific role</p>
                          </div>
                        </div>
                        <ImpactCards content={result.changesMade} />
                      </div>
                    )}
                    {activeTab === "gaps" && (
                      <GapCards content={result.gaps} />
                    )}
                  </motion.div>
                  </AnimatePresence>
                </div>

                {/* Re-tailor */}
                <div className="flex flex-col items-center gap-3 pt-2 stagger-reveal" style={{ animationDelay: "320ms" }}>
                  <p className="text-xs" style={{ color: "#3A4558" }}>Applying to another role?</p>
                  <button
                    onClick={() => { setResult(null); setError(null); setShowResultsGate(false); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7A99" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.25)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#DEC27A";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#6B7A99";
                    }}
                  >
                    <RotateCcw size={13} />
                    Tailor for a different role
                  </button>
                </div>
                  </div>{/* /blur inner */}

                  {/* ── Results Gate Overlay ── */}
                  <AnimatePresence>
                  {showResultsGate && (
                    <motion.div
                      key="results-gate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 flex items-start justify-center pt-12 px-4"
                      style={{ zIndex: 10 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 32, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="w-full max-w-sm rounded-2xl overflow-hidden"
                        style={{
                          background: "linear-gradient(145deg, rgba(13,17,28,0.99) 0%, rgba(7,10,18,0.99) 100%)",
                          border: "1px solid rgba(201,168,76,0.3)",
                          boxShadow: "0 0 0 1px rgba(201,168,76,0.07), 0 48px 120px rgba(0,0,0,0.7), 0 0 100px rgba(201,168,76,0.12)",
                        }}
                      >
                        {/* Gold shimmer top line */}
                        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 20%, rgba(222,194,122,1) 50%, rgba(201,168,76,0.4) 80%, transparent 100%)" }} />

                        <div className="p-8">
                          {/* Icon + headline */}
                          <div className="flex flex-col items-center text-center mb-6">
                            <motion.div
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
                              className="mb-4 rounded-2xl p-4 relative"
                              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}
                            >
                              <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)", filter: "blur(10px)" }} />
                              <Crown size={30} style={{ color: "#C9A84C", position: "relative", zIndex: 1 }} />
                            </motion.div>
                            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", fontWeight: 700, color: "#F0F2F7", marginBottom: "0.6rem", lineHeight: 1.15 }}>
                              Your resume is ready
                            </h2>
                            <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B7280", maxWidth: "20rem" }}>
                              Sign in free to unlock your tailored resume, every keyword injected, and PDF + DOCX downloads.
                            </p>
                            {/* Feature unlock chips */}
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              {[
                                { label: `${tabCounts.keywords} keywords added`, color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)" },
                                { label: `${tabCounts.changes} improvements`, color: "#4ade80", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.18)" },
                                { label: "PDF + DOCX download", color: "#93c5fd", bg: "rgba(96,165,250,0.06)", border: "rgba(96,165,250,0.18)" },
                              ].map(({ label, color, bg, border }) => (
                                <motion.span
                                  key={label}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.3 + Math.random() * 0.2, type: "spring", stiffness: 400, damping: 25 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                  style={{ background: bg, border: `1px solid ${border}`, color }}
                                >
                                  <CheckCircle size={9} style={{ color }} />
                                  {label}
                                </motion.span>
                              ))}
                            </div>
                          </div>

                          {/* Form or success state */}
                          {gateSent ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-5"
                            >
                              <div className="mb-4 mx-auto w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", boxShadow: "0 0 30px rgba(34,197,94,0.15)" }}>
                                <CheckCircle size={26} style={{ color: "#4ade80" }} />
                              </div>
                              <p className="font-semibold text-base mb-2" style={{ color: "#F0F2F7" }}>Check your email</p>
                              <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                                Magic link sent to{" "}
                                <span style={{ color: "#C9A84C", fontWeight: 600 }}>{gateEmail}</span>.<br />
                                Click it to unlock your results instantly.
                              </p>
                            </motion.div>
                          ) : (
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              if (!gateEmail.trim()) return;
                              setGateLoading(true);
                              setGateError(null);
                              try {
                                const supabase = createClient();
                                const { error: err } = await supabase.auth.signInWithOtp({
                                  email: gateEmail.trim(),
                                  options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                                });
                                if (err) throw err;
                                setGateSent(true);
                              } catch (err: unknown) {
                                setGateError(err instanceof Error ? err.message : "Something went wrong.");
                              } finally {
                                setGateLoading(false);
                              }
                            }}>
                              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#4B5563" }}>
                                Email address
                              </label>
                              <input
                                type="email"
                                required
                                value={gateEmail}
                                onChange={e => setGateEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input-luxury w-full px-4 py-3 mb-3 text-sm"
                                autoFocus
                              />
                              {gateError && (
                                <p className="text-xs mb-3" style={{ color: "#f87171" }}>{gateError}</p>
                              )}
                              <button
                                type="submit"
                                disabled={gateLoading || !gateEmail.trim()}
                                className="btn-gold w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontSize: "0.95rem", letterSpacing: "0.01em" }}
                              >
                                {gateLoading ? (
                                  <><Loader2 size={15} className="animate-spin" />Sending link...</>
                                ) : (
                                  <>Unlock My Results →</>
                                )}
                              </button>
                            </form>
                          )}

                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs" style={{ color: "#374151" }}>Free · No card · 10 seconds</p>
                            <button
                              onClick={() => setShowResultsGate(false)}
                              className="text-xs transition-colors"
                              style={{ color: "#374151" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#6B7280"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}
                            >
                              Skip (view only)
                            </button>
                          </div>
                        </div>

                        {/* Bottom shimmer */}
                        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 50%, transparent 100%)" }} />
                      </motion.div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>{/* /relative gate wrapper */}
              </motion.div>
            )}
        </div>
      </div>

      {/* ── Loading overlay — fixed, centered below navbar ── */}
      <AnimatePresence>
        {tailoring && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 right-0 bottom-0 z-40 flex flex-col items-center justify-center px-6"
            style={{ top: "60px", background: "#07090F" }}
          >
            {/* Ambient radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{ width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.04) 40%, transparent 68%)" }} />
            </div>

            {/* Orbital rings */}
            <div className="relative mb-10" style={{ width: 200, height: 200, zIndex: 1, overflow: "visible" }}>
              {/* Outer ring — slow spin */}
              <svg
                className="absolute animate-spin"
                style={{ inset: "-12px", width: "calc(100% + 24px)", height: "calc(100% + 24px)", animationDuration: "5s", animationTimingFunction: "linear", overflow: "visible" }}
                viewBox="0 0 224 224"
              >
                <circle cx="112" cy="112" r="104" fill="none" stroke="rgba(201,168,76,0.06)" strokeWidth="1.5" />
                <circle cx="112" cy="112" r="104" fill="none" stroke="rgba(201,168,76,0.7)" strokeWidth="2" strokeLinecap="round" strokeDasharray="80 573" />
                <circle cx="112" cy="8" r="3.5" fill="rgba(201,168,76,0.9)" style={{ filter: "blur(1px)" }} />
              </svg>
              {/* Middle ring — reverse spin */}
              <svg
                className="absolute animate-spin"
                style={{ inset: "10px", width: "calc(100% - 20px)", height: "calc(100% - 20px)", animationDuration: "3s", animationTimingFunction: "linear", animationDirection: "reverse", overflow: "visible" }}
                viewBox="0 0 180 180"
              >
                <circle cx="90" cy="90" r="84" fill="none" stroke="rgba(201,168,76,0.04)" strokeWidth="1" />
                <circle cx="90" cy="90" r="84" fill="none" stroke="rgba(201,168,76,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="55 473" />
              </svg>
              {/* Inner ring — fast spin */}
              <svg
                className="absolute animate-spin"
                style={{ inset: "34px", width: "calc(100% - 68px)", height: "calc(100% - 68px)", animationDuration: "2s", animationTimingFunction: "linear", overflow: "visible" }}
                viewBox="0 0 132 132"
              >
                <circle cx="66" cy="66" r="60" fill="none" stroke="rgba(201,168,76,0.03)" strokeWidth="1" />
                <circle cx="66" cy="66" r="60" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="35 342" />
              </svg>
              {/* Center Crown */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)",
                    border: "1px solid rgba(201,168,76,0.4)",
                    boxShadow: "0 0 40px rgba(201,168,76,0.25), 0 0 80px rgba(201,168,76,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <Crown size={28} style={{ color: "#C9A84C" }} strokeWidth={2} />
                </div>
              </div>
            </div>

            <h3 className="shimmer-text" style={{ fontFamily: "Playfair Display, serif", fontSize: "1.85rem", fontWeight: 700, marginBottom: "1rem", textAlign: "center", position: "relative", zIndex: 1 }}>
              Working its magic...
            </h3>

            {/* Progress bar + elapsed */}
            <div className="flex items-center gap-3 mb-5" style={{ position: "relative", zIndex: 1 }}>
              <span className="text-xs font-mono tabular-nums" style={{ color: "#3A4558", minWidth: "2.5rem", textAlign: "right" }}>{loadingElapsed}s</span>
              <div className="w-40 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min((loadingElapsed / 28) * 90, 90)}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.45) 0%, rgba(222,194,122,0.95) 100%)", boxShadow: "0 0 8px rgba(201,168,76,0.4)" }}
                />
              </div>
              <span className="text-xs" style={{ color: "#2A3040" }}>~28s</span>
            </div>

            {/* Rotating tip */}
            <div className="mb-8 text-center overflow-hidden" style={{ maxWidth: 340, height: "2.8rem", position: "relative", zIndex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingTip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.32 }}
                  className="text-sm text-center absolute inset-0 flex items-center justify-center px-2"
                  style={{ color: "#4B5563", lineHeight: 1.55 }}
                >
                  {LOADING_TIPS[loadingTip]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Step list */}
            <div className="w-full max-w-[340px] space-y-3" style={{ position: "relative", zIndex: 1 }}>
              {LOADING_STEPS.map((s, i) => {
                const done = i < loadingStep;
                const active = i === loadingStep;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-400"
                    style={{
                      background: done ? "rgba(34,197,94,0.05)" : active ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${done ? "rgba(34,197,94,0.15)" : active ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)"}`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: done ? "rgba(34,197,94,0.15)" : active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${done ? "rgba(34,197,94,0.35)" : active ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {done ? <CheckCircle size={13} className="text-[#22c55e]" /> : active ? <Loader2 size={12} className="text-[#C9A84C] animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />}
                    </div>
                    <span
                      className="text-sm transition-colors duration-300 flex-1"
                      style={{ color: done ? "#4ade80" : active ? "#DEC27A" : "#3A4558", fontWeight: active ? 500 : 400 }}
                    >
                      {s.label}
                    </span>
                    {done && <CheckCircle size={13} className="text-[#22c55e] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sign-in gate modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showSignInModal && (
          <motion.div
            key="signin-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowSignInModal(false); }}
          >
            <motion.div
              key="signin-card"
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #111827 0%, #0A0E17 100%)",
                border: "1px solid rgba(201,168,76,0.18)",
                boxShadow: "0 0 0 1px rgba(201,168,76,0.06), 0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(201,168,76,0.05)",
              }}
            >
              {/* Gold shimmer top line */}
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)" }} />

              {/* Close button */}
              <button
                onClick={() => setShowSignInModal(false)}
                className="absolute top-4 right-4 rounded-lg p-1.5 transition-all"
                style={{ color: "#4B5563", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#4B5563"; }}
              >
                <X size={14} />
              </button>

              <div className="p-8">
                {/* Icon + headline */}
                <div className="flex flex-col items-center text-center mb-7">
                  <div className="mb-4 rounded-2xl p-3" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
                    <Crown size={26} style={{ color: "#C9A84C" }} />
                  </div>
                  <h2 className="text-xl font-semibold mb-1.5" style={{ color: "#F0F2F7", fontFamily: "var(--font-playfair)" }}>
                    Save your tailored resume
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                    Sign in to download, copy, and keep your results. It only takes 10 seconds.
                  </p>
                </div>

                {signInSent ? (
                  <div className="text-center py-4">
                    <div className="mb-3 mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                      <CheckCircle size={22} style={{ color: "#4ade80" }} />
                    </div>
                    <p className="font-medium mb-1" style={{ color: "#F0F2F7" }}>Check your email</p>
                    <p className="text-sm" style={{ color: "#6B7280" }}>
                      We sent a magic link to <span style={{ color: "#C9A84C" }}>{signInEmail}</span>. Click it to sign in instantly.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!signInEmail.trim()) return;
                      setSignInLoading(true);
                      setSignInError(null);
                      try {
                        const supabase = createClient();
                        const { error: err } = await supabase.auth.signInWithOtp({
                          email: signInEmail.trim(),
                          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                        });
                        if (err) throw err;
                        setSignInSent(true);
                      } catch (err: unknown) {
                        setSignInError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
                      } finally {
                        setSignInLoading(false);
                      }
                    }}
                  >
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#4B5563" }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-luxury w-full px-4 py-3 mb-3 text-sm"
                      autoFocus
                    />
                    {signInError && (
                      <p className="text-xs mb-3" style={{ color: "#f87171" }}>{signInError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={signInLoading || !signInEmail.trim()}
                      className="btn-gold w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signInLoading ? (
                        <><Loader2 size={15} className="animate-spin" /> Sending link...</>
                      ) : (
                        <>Send magic link</>
                      )}
                    </button>
                    <p className="text-center text-xs mt-4" style={{ color: "#374151" }}>
                      No password needed · Free to sign in
                    </p>
                  </form>
                )}
              </div>

              {/* Bottom gold shimmer */}
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 50%, transparent 100%)" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TailorPage() {
  return (
    <Suspense fallback={<div style={{ background: "#07090F", minHeight: "100vh" }} />}>
      <TailorInner />
    </Suspense>
  );
}
