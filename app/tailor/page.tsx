"use client";

import { useState, useCallback, useRef, Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

function ScoreBar({ label, before, after }: { label: string; before: number; after: number }) {
  const diff = after - before;
  const color = after >= 80 ? "#22c55e" : after >= 60 ? "#C9A84C" : "#ef4444";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#6B7A99]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[#4B5563] line-through text-xs">{before}%</span>
          <span className="font-bold" style={{ color }}>{after}%</span>
          {diff > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-[#22c55e]">
              <ArrowUp size={11} />+{diff}
            </span>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${after}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
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
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-[#9CA3AF]">
          <Icon size={14} className="shrink-0 mt-0.5" style={{ color: iconColor }} />
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
  const [result, setResult] = useState<TailorResult | null>(null);
  const [originalResumeText, setOriginalResumeText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "compare" | "keywords" | "changes" | "gaps">("resume");
  const [editMode, setEditMode] = useState(false);
  const [editedResume, setEditedResume] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [tailorCount, setTailorCount] = useState(0);
  const FREE_LIMIT = 3;

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
    setError(null);
    setResult(null);
    setOriginalResumeText(resumeText);

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

  return (
    <div className="min-h-screen" style={{ background: "#07090F" }}>
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="badge-gold mb-4">
            <Zap size={11} />
            <span>AI Resume Tailor</span>
          </div>
          <h1
            style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 700, color: "#F0F2F7" }}
          >
            Tailor your resume.<br />
            <span className="text-gold-gradient">Beat ATS. Win interviews.</span>
          </h1>
          <p className="text-[#6B7A99] mt-3 max-w-lg text-base">
            Paste the job description, upload your resume, and let Claude rewrite it to maximise your match score — without losing your authentic voice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── LEFT PANEL: Inputs ── */}
          <div className="space-y-5">
            {/* Job info */}
            <div className="card p-6">
              <h2 className="text-[#F0F2F7] font-semibold mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#C9A84C]" />
                Job Details
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#6B7A99] mb-1.5 block">Job Title</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Designer"
                      className="input-luxury w-full px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6B7A99] mb-1.5 block">Company</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Linear"
                      className="input-luxury w-full px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#6B7A99] mb-1.5 block">
                    Job Description <span className="text-[#ef4444]">*</span>
                  </label>

                  {/* URL fetch bar */}
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-1">
                      <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" />
                      <input
                        type="url"
                        value={jobUrl}
                        onChange={(e) => { setJobUrl(e.target.value); setFetchJdError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleFetchJd()}
                        placeholder="Paste job URL to auto-fill (Greenhouse, Lever, Workday…)"
                        className="input-luxury w-full pl-8 pr-3 py-2 text-xs"
                      />
                    </div>
                    <button
                      onClick={handleFetchJd}
                      disabled={!jobUrl.trim() || fetchingJd}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#DEC27A" }}
                    >
                      {fetchingJd ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {fetchingJd ? "Fetching…" : "Auto-fill"}
                    </button>
                  </div>
                  {fetchJdError && (
                    <p className="text-xs text-[#f87171] mb-2">{fetchJdError}</p>
                  )}
                  {jobDescription && jobUrl && !fetchingJd && !fetchJdError && (
                    <p className="text-xs text-[#22c55e] mb-2 flex items-center gap-1">
                      <CheckCircle size={11} /> Job description loaded from URL
                    </p>
                  )}

                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here, or use the URL auto-fill above..."
                    rows={8}
                    className="input-luxury w-full px-3.5 py-2.5 text-sm resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[#374151]">{jobDescription.length} chars</span>
                    {applyUrl && (
                      <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#6B7A99] hover:text-[#C9A84C] transition-colors flex items-center gap-1">
                        View original posting <ChevronRight size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resume upload */}
            <div className="card p-6">
              <h2 className="text-[#F0F2F7] font-semibold mb-4 flex items-center gap-2">
                <Upload size={16} className="text-[#C9A84C]" />
                Your Resume
              </h2>

              {/* Saved resume banner */}
              {usingCloudResume && savedResumeName && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg mb-3"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-[#C9A84C] shrink-0" />
                    <div>
                      <span className="text-xs text-[#DEC27A] font-medium">Using saved resume</span>
                      <span className="text-xs text-[#6B7A99] ml-1.5">{savedResumeName} · {savedResumeDate}</span>
                    </div>
                  </div>
                  <button
                    className="text-xs text-[#6B7A99] hover:text-[#9CA3AF] transition-colors"
                    onClick={() => { setResumeText(""); setResumeFile(null); setUsingCloudResume(false); }}
                  >
                    Replace
                  </button>
                </div>
              )}

              {/* Drop zone */}
              <div
                className={`upload-zone p-6 text-center mb-4 cursor-pointer ${dragOver ? "dragover" : ""}`}
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
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="text-[#C9A84C] animate-spin" />
                    <span className="text-sm text-[#6B7A99]">Parsing resume...</span>
                  </div>
                ) : resumeFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={20} className="text-[#C9A84C]" />
                    <div className="text-left">
                      <p className="text-[#F0F2F7] text-sm font-medium">{resumeFile.name}</p>
                      <p className="text-[#6B7A99] text-xs">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      className="ml-2 text-[#374151] hover:text-[#6B7A99]"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); setResumeText(""); }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-[#374151]" />
                    <div>
                      <span className="text-[#6B7A99] text-sm font-medium">Drop your resume here</span>
                      <span className="text-[#374151] text-sm"> or click to browse</span>
                    </div>
                    <span className="text-[#374151] text-xs">PDF, DOCX, or TXT</span>
                  </div>
                )}
              </div>

              {/* Text fallback */}
              <div>
                <label className="text-xs text-[#6B7A99] mb-1.5 block">
                  Resume Text <span className="text-[#374151]">(or paste directly)</span>
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
                  rows={10}
                  className="input-luxury w-full px-3.5 py-2.5 text-sm resize-none font-mono text-xs"
                />
                <span className="text-xs text-[#374151]">{resumeText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle size={16} className="text-[#f87171] shrink-0 mt-0.5" />
                <span className="text-[#f87171]">{error}</span>
              </div>
            )}

            {/* Tailor button */}
            <button
              onClick={handleTailor}
              disabled={!canTailor || tailoring}
              className="btn-gold w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {tailoring ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Claude is tailoring your resume...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Tailor My Resume with AI
                </>
              )}
            </button>
            {!canTailor && (
              <p className="text-center text-xs text-[#6B7A99]">
                Add your resume and job description to continue
              </p>
            )}
            {/* Usage indicator */}
            {!isPro && (
              <p className="text-center text-xs text-[#6B7A99]">
                {tailorCount >= FREE_LIMIT ? (
                  <span className="text-[#ef4444]">
                    Free limit reached.{" "}
                    <a href="/#pricing" className="text-[#C9A84C] hover:underline">Upgrade to Pro ($18/mo)</a>
                    {" "}for 30 tailors, or Lifetime ($249) for unlimited.
                  </span>
                ) : (
                  <span>{FREE_LIMIT - tailorCount} free tailor{FREE_LIMIT - tailorCount !== 1 ? "s" : ""} remaining this month</span>
                )}
              </p>
            )}
          </div>

          {/* ── RIGHT PANEL: Results ── */}
          <div>
            {/* Empty state */}
            {!result && !tailoring && (
              <div
                className="card flex flex-col items-center justify-center text-center py-20 px-8"
                style={{ minHeight: "500px" }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)" }}>
                  <Zap size={24} className="text-[#C9A84C] opacity-70" />
                </div>
                <h3 className="text-[#F0F2F7] font-semibold text-lg mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                  Your tailored resume will appear here
                </h3>
                <p className="text-[#6B7A99] text-sm max-w-xs leading-relaxed">
                  Add your resume and the job description, then hit the button. Claude will optimise every line for maximum ATS and human impact.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
                  {[["ATS Score", "+25%"], ["Keywords", "Added"], ["Interview", "Rate ↑"]].map(([label, val]) => (
                    <div key={label} className="text-center">
                      <div className="text-[#C9A84C] font-bold text-lg">{val}</div>
                      <div className="text-[#374151] text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state */}
            {tailoring && (
              <div className="card flex flex-col items-center justify-center text-center py-20 px-8" style={{ minHeight: "500px" }}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }}>
                    <Zap size={24} className="text-[#C9A84C]" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: "rgba(201,168,76,0.1)" }} />
                </div>
                <h3 className="text-[#F0F2F7] font-semibold text-lg mb-2">Tailoring your resume...</h3>
                <p className="text-[#6B7A99] text-sm">
                  Claude is analysing the job description and optimising every line of your resume. This takes about 15–20 seconds.
                </p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Score cards */}
                <div className="card p-5">
                  <h3 className="text-[#F0F2F7] font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#22c55e]" />
                    ATS Optimisation Results
                  </h3>
                  <ScoreBar label="ATS Match Score" before={result.atsScoreBefore} after={result.atsScoreAfter} />
                  <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                    <ArrowUp size={16} className="text-[#22c55e] shrink-0" />
                    <span className="text-[#22c55e] text-sm font-medium">
                      +{result.atsScoreAfter - result.atsScoreBefore}% improvement — you&apos;re now in the top candidate tier
                    </span>
                  </div>
                  {applyUrl && (
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      Apply Now with Tailored Resume
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>

                {/* Tabs */}
                <div className="card overflow-hidden">
                  <div className="flex border-b border-[rgba(255,255,255,0.06)] overflow-x-auto">
                    {([
                      { id: "resume", label: "Tailored Resume" },
                      { id: "compare", label: "⚡ Compare" },
                      { id: "keywords", label: "Keywords" },
                      { id: "changes", label: "Changes" },
                      { id: "gaps", label: "Gaps" },
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex-1 py-3 text-xs font-medium transition-all"
                        style={{
                          color: activeTab === tab.id ? "#DEC27A" : "#6B7A99",
                          borderBottom: activeTab === tab.id ? "2px solid #C9A84C" : "2px solid transparent",
                          background: activeTab === tab.id ? "rgba(201,168,76,0.04)" : "transparent",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {activeTab === "resume" && (
                      <div>
                        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                          <span className="text-xs text-[#6B7A99]">
                            {editMode ? "Editing — changes save to your downloads" : "Copy, edit, or download your tailored resume"}
                          </span>
                          <div className="flex items-center gap-2">
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
                              onClick={() => navigator.clipboard.writeText(editedResume)}
                              className="btn-ghost text-xs px-3 py-1.5 rounded-lg"
                            >
                              Copy
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
                            className="input-luxury w-full px-4 py-4 text-xs text-[#C8D0E0] leading-relaxed font-mono resize-none"
                            style={{ minHeight: "400px" }}
                            spellCheck={false}
                          />
                        ) : (
                          <div
                            className="p-4 rounded-xl text-xs text-[#9CA3AF] leading-relaxed whitespace-pre-wrap overflow-y-auto font-mono"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", maxHeight: "400px" }}
                          >
                            {editedResume}
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "compare" && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2 text-xs text-[#6B7A99]">
                            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)" }} />
                            Original
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#6B7A99]">
                            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.35)" }} />
                            Tailored
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium" style={{ color: "#f87171" }}>Original</span>
                              <span className="badge-gold text-[0.65rem]">{result.atsScoreBefore}% ATS</span>
                            </div>
                            <DiffPane ops={diffOps.left} side="left" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[#4ade80]">Tailored</span>
                              <span className="badge-green text-[0.65rem]">{result.atsScoreAfter}% ATS</span>
                            </div>
                            <DiffPane ops={diffOps.right} side="right" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}>
                          <ArrowUp size={14} className="text-[#22c55e]" />
                          <span className="text-[#9CA3AF]">ATS score lifted from <span className="text-[#f87171] font-semibold">{result.atsScoreBefore}%</span> → <span className="text-[#4ade80] font-semibold">{result.atsScoreAfter}%</span> — a <span className="text-[#C9A84C] font-bold">+{result.atsScoreAfter - result.atsScoreBefore}% improvement</span></span>
                        </div>
                      </div>
                    )}
                    {activeTab === "keywords" && (
                      <div>
                        <p className="text-xs text-[#6B7A99] mb-4">These keywords from the job description were naturally woven into your resume:</p>
                        <BulletList content={result.keywordsAdded} icon={CheckCircle} iconColor="#C9A84C" />
                      </div>
                    )}
                    {activeTab === "changes" && (
                      <div>
                        <p className="text-xs text-[#6B7A99] mb-4">Key improvements made to maximise your impact:</p>
                        <BulletList content={result.changesMade} icon={ArrowUp} iconColor="#22c55e" />
                      </div>
                    )}
                    {activeTab === "gaps" && (
                      <div>
                        <p className="text-xs text-[#6B7A99] mb-4">Skills or experience in the JD that don&apos;t appear in your background. Be honest about these in applications:</p>
                        <BulletList content={result.gaps} icon={AlertCircle} iconColor="#f59e0b" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Re-tailor */}
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="btn-ghost w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw size={15} />
                  Start over with a different job
                </button>
              </div>
            )}
          </div>
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
