"use client";

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import {
  Upload, FileText, Zap, Download, CheckCircle, AlertCircle,
  RotateCcw, ArrowUp, ChevronRight, Loader2, X, Pencil, Check, ExternalLink, Link2
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

function BulletList({ content, icon: Icon, iconColor }: { content: string; icon: typeof CheckCircle; iconColor: string }) {
  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length > 0 && !/^[-─═*]{2,}$/.test(l));

  return (
    <ul className="space-y-3">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-3 text-[0.9rem] text-[#9CA3AF] leading-relaxed">
          <Icon size={16} className="shrink-0 mt-0.5" style={{ color: iconColor }} />
          {line}
        </li>
      ))}
    </ul>
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
  const LOADING_STEPS = [
    { label: "Parsing your resume", duration: 3500 },
    { label: "Analysing job requirements", duration: 4000 },
    { label: "Optimising keywords & phrasing", duration: 5000 },
    { label: "Finalising your resume", duration: 99999 },
  ];
  const [result, setResult] = useState<TailorResult | null>(null);
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "compare" | "keywords" | "changes" | "gaps">("resume");
  const [editMode, setEditMode] = useState(false);
  const [editedResume, setEditedResume] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [tailorCount, setTailorCount] = useState(0);
  const FREE_LIMIT = 3;
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streamedResume, setStreamedResume] = useState("");
  const [streamComplete, setStreamComplete] = useState(true);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const init = async () => {
      // Server-side pro check (owner bypass via OWNER_EMAIL env var)
      const res = await fetch("/api/pro-status");
      const { isPro: serverPro } = await res.json();
      if (serverPro) {
        setIsPro(true);
      } else {
        // localStorage fallback (pro purchase)
        const pro = localStorage.getItem("resumeidol_pro") === "true";
        setIsPro(pro);
      }
      const monthKey = `resumeidol_tailor_${new Date().toISOString().slice(0, 7)}`;
      setTailorCount(parseInt(localStorage.getItem(monthKey) ?? "0"));
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

    // Clear personal data when user signs out
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
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

    if (!isPro && tailorCount >= FREE_LIMIT) {
      setError(`You've used all ${FREE_LIMIT} free tailors this month. Upgrade to Pro (30/mo) or get Lifetime for unlimited.`);
      return;
    }

    setTailoring(true);
    setLoadingStep(0);
    setError(null);
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
        const monthKey = `resumeidol_tailor_${new Date().toISOString().slice(0, 7)}`;
        const newCount = tailorCount + 1;
        localStorage.setItem(monthKey, String(newCount));
        setTailorCount(newCount);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      stepTimers.forEach(clearTimeout);
      setTailoring(false);
    }
  };

  const handleDownloadDocx = async () => {
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
    } catch {
      setError("DOCX download failed. Try copying the text instead.");
    }
  };

  const handleDownloadPdf = async () => {
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
    } catch {
      setError("PDF download failed. Try the .docx option instead.");
    }
  };

  const diffOps = useMemo(
    () => (result && originalResumeText ? computeWordDiff(originalResumeText, result.tailoredResume) : { left: [], right: [] }),
    [result, originalResumeText]
  );

  const canTailor = resumeText.trim().length > 50 && jobDescription.trim().length > 50;
  const step1Done = jobTitle.trim().length > 1 && jobDescription.trim().length > 30;
  const step2Done = resumeText.trim().length > 50;
  const currentStep = !step1Done ? 1 : !step2Done ? 2 : 3;

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
            <Zap size={11} />
            <span>AI Resume Tailor</span>
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

        {/* ── Step Indicator ── */}
        <div className="mb-10 card-enter" style={{ animationDelay: "60ms" }}>
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
                      {done ? <CheckCircle size={16} style={{ color: "#C9A84C" }} /> : n}
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
        </div>

        <div className={`grid gap-7 ${tailoring || result ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto w-full"}`}>
          {/* ── LEFT PANEL: Inputs ── */}
          <div className="space-y-6">
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
                  className={`btn-gold w-full py-5 rounded-2xl font-semibold flex items-center justify-center gap-2.5 text-lg disabled:opacity-40 disabled:cursor-not-allowed${canTailor && !tailoring ? " btn-gold-hero" : ""}`}
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
                {tailorCount >= FREE_LIMIT ? (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-[#f87171] font-medium mb-1.5 text-sm">Free limit reached for this month</p>
                    <p className="text-[#6B7A99] text-sm">
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Upgrade to Pro ($18/mo)</a>
                      {" "}for 30 tailors, or{" "}
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline font-medium">Lifetime ($249)</a>
                      {" "}for unlimited.
                    </p>
                  </div>
                ) : tailorCount === FREE_LIMIT - 1 ? (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <p className="text-[#DEC27A] font-medium mb-1 text-sm">This is your last free tailor this month</p>
                    <p className="text-[#6B7A99] text-sm">
                      <a href="/#pricing" className="text-[#C9A84C] hover:underline">Upgrade to Pro</a> to keep going after this.
                    </p>
                  </div>
                ) : (
                  <p className="text-[#6B7A99] text-sm">{FREE_LIMIT - tailorCount} free tailor{FREE_LIMIT - tailorCount !== 1 ? "s" : ""} remaining this month</p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL: Results (only shown when tailoring or result available) ── */}
          {(tailoring || result) && (
          <motion.div
            className="card-enter"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ animationDelay: "120ms" }}
          >
            {/* Loading state — multi-step progress */}
            {tailoring && (
              <div className="card-input flex flex-col items-center justify-center py-16 px-10" style={{ minHeight: "580px" }}>
                {/* Orbital animation */}
                <div className="relative w-32 h-32 mb-10">
                  {/* Outer ring — slow spin */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "3s", animationTimingFunction: "linear" }} viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="2" />
                    <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(201,168,76,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="60 305" />
                  </svg>
                  {/* Inner ring — reverse spin */}
                  <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: "2s", animationTimingFunction: "linear", animationDirection: "reverse" }} viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="44" fill="none" stroke="rgba(201,168,76,0.05)" strokeWidth="1.5" />
                    <circle cx="64" cy="64" r="44" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="35 240" />
                  </svg>
                  {/* Center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", boxShadow: "0 0 30px rgba(201,168,76,0.15)" }}>
                      <Zap size={24} className="text-[#C9A84C]" />
                    </div>
                  </div>
                </div>

                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", fontWeight: 600, color: "#F0F2F7", marginBottom: "0.625rem", textAlign: "center" }}>
                  ResumeIdol is working its magic...
                </h3>
                <p className="text-[#6B7A99] text-base mb-12 text-center max-w-xs leading-relaxed">
                  Rewriting every line to maximise your ATS score and human appeal.
                </p>

                {/* Step list */}
                <div className="w-full max-w-[290px] space-y-5">
                  {LOADING_STEPS.map((s, i) => {
                    const done = i < loadingStep;
                    const active = i === loadingStep;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                          style={{
                            background: done ? "rgba(34,197,94,0.15)" : active ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${done ? "rgba(34,197,94,0.4)" : active ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          {done ? (
                            <CheckCircle size={14} className="text-[#22c55e] step-tick" />
                          ) : active ? (
                            <Loader2 size={13} className="text-[#C9A84C] animate-spin" />
                          ) : (
                            <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
                          )}
                        </div>
                        <span
                          className="text-base transition-colors duration-300"
                          style={{ color: done ? "#22c55e" : active ? "#DEC27A" : "#4B5563", fontWeight: active ? 500 : 400 }}
                        >
                          {s.label}
                          {done && " ✓"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {/* Score card */}
                <div className="card-input p-8 stagger-reveal" style={{ animationDelay: "0ms" }}>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 600, color: "#F0F2F7", marginBottom: "1.75rem" }} className="flex items-center gap-2.5">
                    <CheckCircle size={17} className="text-[#22c55e]" />
                    ATS Optimisation Results
                  </h3>
                  <ScoreRing before={result.atsScoreBefore} after={result.atsScoreAfter} />
                  <div className="flex items-center gap-3 mt-7 p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                    <ArrowUp size={16} className="text-[#22c55e] shrink-0" />
                    <span className="text-[#22c55e] text-sm font-medium">
                      You&apos;re now in the top candidate tier for this role
                    </span>
                  </div>
                  {applyUrl && (
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold w-full mt-5 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      Apply Now with Tailored Resume
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>

                {/* Tabs */}
                <div className="card-input overflow-hidden stagger-reveal" style={{ animationDelay: "180ms" }}>
                  {/* Pill-style tab bar */}
                  <div className="p-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}>
                    <div className="flex gap-1 overflow-x-auto">
                      {([
                        { id: "resume", label: "Tailored Resume" },
                        { id: "compare", label: "Compare" },
                        { id: "keywords", label: "Keywords" },
                        { id: "changes", label: "Changes" },
                        { id: "gaps", label: "Gaps" },
                      ] as const).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className="flex-1 py-2.5 px-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
                          style={{
                            color: activeTab === tab.id ? "#07090F" : "#6B7A99",
                            background: activeTab === tab.id ? "linear-gradient(135deg, #DEC27A 0%, #C9A84C 100%)" : "transparent",
                            fontWeight: activeTab === tab.id ? 600 : 500,
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
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
                        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                          <span className="text-sm text-[#6B7A99]">
                            {editMode ? "Editing — changes save to your downloads" : "Copy, edit, or download your tailored resume"}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setEditMode(!editMode)}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                              style={editMode
                                ? { background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#DEC27A" }
                                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7A99" }
                              }
                            >
                              {editMode ? <><Check size={11} />Done</> : <><Pencil size={11} />Edit</>}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(editedResume);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg transition-all"
                              style={copied
                                ? { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }
                                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6B7A99" }
                              }
                            >
                              {copied ? "✓ Copied!" : "Copy"}
                            </button>
                            <button onClick={handleDownloadDocx} className="btn-ghost text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Download size={11} />
                              .docx
                            </button>
                            <button onClick={handleDownloadPdf} className="btn-gold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              <Download size={11} />
                              PDF
                            </button>
                          </div>
                        </div>
                        {editMode ? (
                          <textarea
                            value={editedResume}
                            onChange={(e) => setEditedResume(e.target.value)}
                            className="input-luxury w-full px-4 py-4 leading-relaxed font-mono resize-none"
                            style={{ minHeight: "460px", fontSize: "0.8rem", color: "#D4DBE8", lineHeight: 1.75 }}
                            spellCheck={false}
                          />
                        ) : (
                          <div
                            className="p-5 rounded-xl leading-relaxed whitespace-pre-wrap overflow-y-auto font-mono"
                            style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", maxHeight: "460px", fontSize: "0.8rem", color: "#C4CEDF", lineHeight: 1.75 }}
                          >
                            {streamComplete ? editedResume : streamedResume}
                            {!streamComplete && (
                              <span
                                className="inline-block animate-pulse"
                                style={{ width: "2px", height: "13px", background: "#C9A84C", marginLeft: "2px", verticalAlign: "text-bottom" }}
                              />
                            )}
                          </div>
                        )}
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
                        <p className="text-sm text-[#6B7A99] mb-5 leading-relaxed">These keywords from the job description were naturally woven into your resume:</p>
                        <BulletList content={result.keywordsAdded} icon={CheckCircle} iconColor="#C9A84C" />
                      </div>
                    )}
                    {activeTab === "changes" && (
                      <div>
                        <p className="text-sm text-[#6B7A99] mb-5 leading-relaxed">Key improvements made to maximise your impact:</p>
                        <BulletList content={result.changesMade} icon={ArrowUp} iconColor="#22c55e" />
                      </div>
                    )}
                    {activeTab === "gaps" && (
                      <div>
                        <p className="text-sm text-[#6B7A99] mb-5 leading-relaxed">Skills in the job description that don&apos;t appear in your background — be upfront about these in applications:</p>
                        <BulletList content={result.gaps} icon={AlertCircle} iconColor="#f59e0b" />
                      </div>
                    )}
                  </motion.div>
                  </AnimatePresence>
                </div>

                {/* Re-tailor */}
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="btn-ghost w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 stagger-reveal"
                  style={{ animationDelay: "320ms" }}
                >
                  <RotateCcw size={15} />
                  Start over with a different job
                </button>
              </motion.div>
            )}
          </motion.div>
          )}
        </div>
      </div>
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
