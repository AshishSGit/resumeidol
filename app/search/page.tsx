"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import JobCard, { Job } from "@/components/JobCard";
import {
  Search, SlidersHorizontal, MapPin, X, Loader2,
  Wifi, WifiOff, ChevronDown, LayoutGrid, List, ArrowRight, CheckCircle
} from "lucide-react";

const SENIORITY = ["Any Level", "Internship", "Entry Level", "Mid Level", "Senior", "Lead", "Director"];
const JOB_TYPES = ["Any Type", "Full-time", "Part-time", "Contract", "Remote", "Internship"];
const DATE_POSTED = ["Any time", "Past 24 hours", "Past week", "Past month"];
const SOURCES = ["All", "LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Dice", "Remotive", "BeBee", "Jooble", "Snagajob"];

const SCAN_BOARDS = ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Dice", "Remotive", "Monster", "BeBee"];

const DEFAULT_LOCATIONS = [
  "Remote", "New York, NY", "San Francisco, CA", "San Jose, CA",
  "Los Angeles, CA", "Seattle, WA", "Austin, TX", "Chicago, IL",
  "Boston, MA", "London, UK", "Toronto, Canada", "Sydney, Australia",
];

const TRENDING_ROLES = [
  { title: "Senior Product Designer",  company: "Stripe",     location: "Remote",        salary: "$175k+", tag: "Hot" },
  { title: "Staff Frontend Engineer",  company: "Linear",     location: "San Francisco", salary: "$195k+", tag: "New" },
  { title: "DevRel Lead",              company: "Vercel",     location: "Remote",        salary: "$160k+", tag: "" },
  { title: "Product Manager, Growth",  company: "Figma",      location: "New York",      salary: "$170k+", tag: "Hot" },
  { title: "AI Research Engineer",     company: "Anthropic",  location: "Remote",        salary: "$220k+", tag: "New" },
  { title: "Engineering Manager",      company: "Notion",     location: "San Francisco", salary: "$210k+", tag: "" },
];

const COMPANY_STYLE: Record<string, { bg: string; color: string; grad: string }> = {
  "Stripe":    { bg: "rgba(99,102,241,0.12)",  color: "#818cf8", grad: "rgba(99,102,241,0.18)" },
  "Linear":    { bg: "rgba(121,87,255,0.12)",  color: "#a78bfa", grad: "rgba(121,87,255,0.18)" },
  "Vercel":    { bg: "rgba(240,242,247,0.07)", color: "#D0D4E0", grad: "rgba(240,242,247,0.12)" },
  "Figma":     { bg: "rgba(241,100,76,0.12)",  color: "#fb923c", grad: "rgba(241,100,76,0.18)" },
  "Anthropic": { bg: "rgba(201,168,76,0.12)",  color: "#C9A84C", grad: "rgba(201,168,76,0.18)" },
  "Notion":    { bg: "rgba(255,255,255,0.07)", color: "#E8EDF5", grad: "rgba(255,255,255,0.1)" },
};

function formatPlace(displayName: string): string {
  const parts = displayName.split(", ").map((p) => p.trim());
  if (parts.length >= 2) return `${parts[0]}, ${parts[parts.length - 1]}`;
  return parts[0];
}

function FilterSelect({
  value, onChange, options, active,
}: {
  value: string; onChange: (v: string) => void; options: string[]; active?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-luxury text-xs pl-3 pr-7 py-2 rounded-lg appearance-none cursor-pointer"
        style={{ color: active ? "#DEC27A" : "#6B7A99" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7A99]" />
    </div>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const locRef = useRef<HTMLDivElement>(null);
  const [remote, setRemote] = useState(false);
  const [seniority, setSeniority] = useState("Any Level");
  const [jobType, setJobType] = useState("Any Type");
  const [datePosted, setDatePosted] = useState("Past week");
  const [source, setSource] = useState("All");
  const [showFilters, setShowFilters] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const inputRef = useRef<HTMLInputElement>(null);

  // Live job counter for hero
  const [liveCount, setLiveCount] = useState(14_847);
  useEffect(() => {
    const t = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3 + 1)), 4500);
    return () => clearInterval(t);
  }, []);

  // Scan progress + board checkmarks
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedBoards, setScannedBoards] = useState<string[]>([]);
  const scanTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startScanAnimation = useCallback(() => {
    scanTimers.current.forEach(clearTimeout);
    scanTimers.current = [];
    setScanProgress(0);
    setScannedBoards([]);

    // Progress bar: 0 → 72% over 3s, then creep to 90% waiting for result
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(p + (p < 70 ? 4 : 0.8), 90);
      setScanProgress(Math.round(p));
    }, 180);
    scanTimers.current.push(tick as unknown as ReturnType<typeof setTimeout>);

    // Board checkmarks appear one by one
    SCAN_BOARDS.forEach((board, i) => {
      const t = setTimeout(() => setScannedBoards(prev => [...prev, board]), 400 + i * 520);
      scanTimers.current.push(t);
    });
  }, []);

  const stopScanAnimation = useCallback(() => {
    scanTimers.current.forEach(clearTimeout);
    setScanProgress(100);
    setScannedBoards(SCAN_BOARDS);
  }, []);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setShowLocSuggestions(false);
    setLoading(true);
    setSearched(true);
    setJobs([]);
    startScanAnimation();
    try {
      const locVal = locationInput.trim();
      const effectiveLocation = locVal === "" || locVal.toLowerCase() === "anywhere" ? "" : locVal;
      const effectiveRemote = remote || locVal.toLowerCase() === "remote";
      const params = new URLSearchParams({ q: query, location: effectiveLocation, remote: String(effectiveRemote), seniority, jobType, datePosted, source });
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setNotice(data.notice || null);
      setIsLive(data.source === "live");
    } catch (err) {
      console.error(err);
    } finally {
      stopScanAnimation();
      setLoading(false);
    }
  }, [query, locationInput, remote, seniority, jobType, datePosted, source, startScanAnimation, stopScanAnimation]);

  const handleTailor = (job: Job) => {
    const params = new URLSearchParams({ jobTitle: job.title, company: job.company, jobDescription: job.description, applyUrl: job.applyUrl });
    router.push(`/tailor?${params}`);
  };

  const clearSearch = () => { setQuery(""); setJobs([]); setSearched(false); inputRef.current?.focus(); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setShowLocSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [nominatimResults, setNominatimResults] = useState<string[]>([]);
  const nominatimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = locationInput.trim();
    if (!q || q.toLowerCase() === "remote") { setNominatimResults([]); return; }
    if (nominatimTimer.current) clearTimeout(nominatimTimer.current);
    nominatimTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&featuretype=city&addressdetails=0&accept-language=en`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const names: string[] = Array.from(new Set((data as { display_name: string }[]).map((d) => formatPlace(d.display_name))));
        setNominatimResults(names.slice(0, 8));
      } catch { setNominatimResults([]); }
    }, 350);
    return () => { if (nominatimTimer.current) clearTimeout(nominatimTimer.current); };
  }, [locationInput]);

  const locSuggestions = useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return DEFAULT_LOCATIONS;
    if (q === "remote") return ["Remote"];
    const combined = nominatimResults.length > 0 ? nominatimResults : DEFAULT_LOCATIONS.filter((l) => l.toLowerCase().includes(q));
    if (!combined.some((c) => c.toLowerCase() === locationInput.trim().toLowerCase())) return [locationInput.trim(), ...combined].slice(0, 9);
    return combined;
  }, [locationInput, nominatimResults]);

  const activeFilterCount = [seniority !== "Any Level", jobType !== "Any Type", datePosted !== "Past week", source !== "All"].filter(Boolean).length;

  const launchSearch = (title: string) => {
    setQuery(title);
    setTimeout(() => inputRef.current?.form?.requestSubmit(), 50);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#07090F" }}>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      {/* ── Hero beam ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[700px] pointer-events-none"
        style={{
          zIndex: 0,
          background: "radial-gradient(ellipse 85% 55% at 50% -15%, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.05) 50%, transparent 75%)",
        }}
      />

      {/* ── Side orbs ── */}
      <div className="absolute pointer-events-none" style={{ top: "10%", left: "-15%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />
      <div className="absolute pointer-events-none" style={{ top: "45%", right: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", filter: "blur(80px)", zIndex: 0 }} />

      <Navbar />

      <div className="relative z-10 pt-20 pb-12">

        {/* ── Search Hero ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
          <div className="text-center mb-10">
            {/* Live counter badge */}
            <div className="badge-gold mb-5 inline-flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <motion.span
                key={liveCount}
                initial={{ opacity: 0.6, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="tabular-nums font-bold"
              >
                {liveCount.toLocaleString()}
              </motion.span>
              <span style={{ color: "#8A8060" }}>jobs live · 500+ boards · real-time</span>
            </div>

            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(2rem, 4.5vw, 3.1rem)",
                fontWeight: 700,
                color: "#F0F2F7",
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              Find your next{" "}
              <span className="shimmer-text italic">breakthrough role</span>
            </h1>
            <p className="text-[#6B7A99] mt-4 text-[1rem] max-w-md mx-auto leading-relaxed">
              Search once. ResumeIdol scans 500+ boards and surfaces the best fits — then tailors your resume in one click.
            </p>
          </div>

          {/* ── Unified search pill ── */}
          <form onSubmit={handleSearch}>
            <div
              className="search-pill-container flex flex-col sm:flex-row rounded-2xl mb-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 16px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.05)",
                transition: "box-shadow 0.2s ease",
              }}
            >
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7A99] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, skill, or company..."
                  className="search-pill-input w-full pl-11 pr-10 py-4 text-sm"
                />
                {query && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#9CA3AF] transition-colors">
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="hidden sm:block w-px self-stretch my-3" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="sm:hidden h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="relative sm:w-52" ref={locRef}>
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7A99] pointer-events-none z-10" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => { setLocationInput(e.target.value); setShowLocSuggestions(true); if (!e.target.value.trim()) setRemote(false); }}
                  onFocus={() => setShowLocSuggestions(true)}
                  placeholder="Location or Remote"
                  className="search-pill-input w-full pl-9 pr-8 py-4 text-sm"
                  style={{ color: locationInput ? "#DEC27A" : undefined }}
                />
                {locationInput ? (
                  <button type="button" onClick={() => { setLocationInput(""); setRemote(false); setShowLocSuggestions(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#9CA3AF] transition-colors">
                    <X size={13} />
                  </button>
                ) : (
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7A99]" />
                )}
                {showLocSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-xl" style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "220px", overflowY: "auto" }}>
                    {locSuggestions.slice(0, 10).map((loc) => (
                      <button
                        key={loc} type="button"
                        onMouseDown={(e) => { e.preventDefault(); setLocationInput(loc); setShowLocSuggestions(false); if (loc === "Remote") setRemote(true); else setRemote(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors"
                        style={{ color: "#9CA3AF" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <MapPin size={12} className="text-[#6B7A99] shrink-0" />{loc}
                      </button>
                    ))}
                    {locSuggestions.length === 0 && <div className="px-4 py-3 text-xs text-[#6B7A99]">No matching locations — press Search to use your input</div>}
                  </div>
                )}
              </div>
              <div className="sm:hidden h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-gold search-btn px-8 py-4 font-semibold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Search
              </button>
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRemote(!remote)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0"
                style={{ background: remote ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)", border: remote ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.07)", color: remote ? "#4ade80" : "#6B7A99" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: remote ? "#22c55e" : "#4B5563" }} />
                Remote only
              </button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-ghost flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg ml-auto shrink-0">
                <SlidersHorizontal size={13} />
                {activeFilterCount > 0 && <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#C9A84C", color: "#07090F" }}>{activeFilterCount}</span>}
                Filters
              </button>
            </div>
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2">
                <FilterSelect value={seniority} onChange={setSeniority} options={SENIORITY} active={seniority !== "Any Level"} />
                <FilterSelect value={jobType} onChange={setJobType} options={JOB_TYPES} active={jobType !== "Any Type"} />
                <FilterSelect value={datePosted} onChange={setDatePosted} options={DATE_POSTED} active={datePosted !== "Any time"} />
                <FilterSelect value={source} onChange={setSource} options={SOURCES} active={source !== "All"} />
              </div>
            )}
          </form>
        </div>

        {/* ── Results area ── */}
        <div className="max-w-4xl mx-auto px-6">

          {/* Status bar */}
          {searched && !loading && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-[#F0F2F7] text-sm font-medium">
                  {total > 0 ? <><span className="text-gold-gradient font-bold">{total}</span> jobs found</> : "No jobs found"}
                </span>
                <div className="flex items-center gap-1.5">
                  {isLive
                    ? <><Wifi size={12} className="text-[#22c55e]" /><span className="text-xs text-[#22c55e]">Live data</span></>
                    : <><WifiOff size={12} className="text-[#f59e0b]" /><span className="text-xs text-[#f59e0b]">Demo mode</span></>
                  }
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setViewMode("list")} className="p-2 rounded-lg transition-all" style={{ color: viewMode === "list" ? "#C9A84C" : "#4B5563", background: viewMode === "list" ? "rgba(201,168,76,0.08)" : "transparent" }}><List size={16} /></button>
                <button onClick={() => setViewMode("grid")} className="p-2 rounded-lg transition-all" style={{ color: viewMode === "grid" ? "#C9A84C" : "#4B5563", background: viewMode === "grid" ? "rgba(201,168,76,0.08)" : "transparent" }}><LayoutGrid size={16} /></button>
              </div>
            </div>
          )}

          {/* Demo notice */}
          {notice && (
            <div className="flex items-start gap-3 p-4 rounded-xl mb-5 text-sm" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <WifiOff size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
              <div><span className="text-[#f59e0b] font-medium">Demo mode: </span><span className="text-[#9CA3AF]">{notice}</span></div>
            </div>
          )}

          {/* ── Loading — cinematic board scan ── */}
          {loading && (
            <div>
              <div
                className="relative overflow-hidden rounded-2xl mb-6 px-6 py-5"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(201,168,76,0.12)", boxShadow: "0 0 40px rgba(201,168,76,0.05)" }}
              >
                {/* Gold shimmer top */}
                <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)", marginBottom: "1rem" }} />

                {/* Header row */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.22)" }}>
                    <Search size={16} className="text-[#C9A84C] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: "#DEC27A" }}>
                      Finding top matches for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Scanning 500+ job boards in real-time</p>
                  </div>
                  <div className="text-right shrink-0">
                    <motion.p
                      key={scanProgress}
                      animate={{ opacity: 1 }}
                      className="text-sm font-bold font-mono tabular-nums"
                      style={{ color: "#C9A84C" }}
                    >
                      {scanProgress}%
                    </motion.p>
                    <p className="text-[0.6rem] uppercase tracking-widest" style={{ color: "#3A4558" }}>scanned</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 rounded-full overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ background: "linear-gradient(90deg, rgba(201,168,76,0.5) 0%, rgba(222,194,122,1) 100%)", boxShadow: "0 0 8px rgba(201,168,76,0.5)" }}
                  />
                </div>

                {/* Board chips */}
                <div className="flex flex-wrap gap-1.5">
                  {SCAN_BOARDS.map((board) => {
                    const checked = scannedBoards.includes(board);
                    return (
                      <motion.span
                        key={board}
                        animate={checked ? { scale: [1, 1.08, 1] } : {}}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-500"
                        style={{
                          background: checked ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${checked ? "rgba(34,197,94,0.22)" : "rgba(255,255,255,0.06)"}`,
                          color: checked ? "#4ade80" : "#3A4558",
                        }}
                      >
                        {checked
                          ? <CheckCircle size={9} style={{ color: "#22c55e" }} />
                          : <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(201,168,76,0.4)" }} />
                        }
                        {board}
                      </motion.span>
                    );
                  })}
                </div>

                <div className="scan-beam" />
              </div>

              {/* Skeleton cards */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card p-5" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex gap-4">
                      <div className="skeleton w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2.5">
                        <div className="skeleton h-5 w-1/2 rounded" />
                        <div className="skeleton h-4 w-1/3 rounded" />
                        <div className="skeleton h-3 w-3/4 rounded" />
                        <div className="flex gap-2"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-16 rounded-full" /></div>
                        <div className="skeleton h-9 w-full rounded-xl mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low-results hint */}
          {!loading && searched && jobs.length > 0 && jobs.length < 5 && source !== "All" && isLive && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl mb-4 text-xs" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <span className="text-[#C9A84C] shrink-0 mt-0.5">ℹ</span>
              <span className="text-[#9CA3AF]">
                Only {jobs.length} {source} listing{jobs.length !== 1 ? "s" : ""} found.{" "}
                <button type="button" onClick={() => { setSource("All"); setTimeout(() => handleSearch(), 50); }} className="text-[#C9A84C] hover:underline font-medium">Switch to All Sources</button>{" "}to see the full results.
              </span>
            </div>
          )}

          {/* Results */}
          {!loading && jobs.length > 0 && (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.055, ease: "easeOut" }}
                >
                  <JobCard job={job} onTailor={handleTailor} compact={viewMode === "grid"} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty state after search */}
          {!loading && searched && jobs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.14)" }}>
                <Search size={26} style={{ color: "#3A4558" }} />
              </div>
              <h3 className="text-[#F0F2F7] font-semibold text-lg mb-2">No jobs found</h3>
              <p className="text-[#6B7A99] text-sm max-w-xs mx-auto mb-6">Try different keywords, broaden your location, or switch to &quot;All&quot; sources.</p>
              <button
                onClick={clearSearch}
                className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "#DEC27A" }}
              >
                Start a new search
              </button>
            </div>
          )}

          {/* ── Initial state — live activity feed ── */}
          {!searched && !loading && (
            <div className="py-4">

              {/* Trending roles header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#6B7A99] text-xs font-semibold tracking-widest uppercase">Hot right now</span>
                </div>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.07), transparent)" }} />
                <span className="text-[0.65rem] text-[#3A4558]">Updated just now</span>
              </div>

              {/* Trending role cards — 2-col grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {TRENDING_ROLES.map((job, i) => {
                  const cs = COMPANY_STYLE[job.company] ?? { bg: "rgba(255,255,255,0.06)", color: "#6B7A99", grad: "rgba(255,255,255,0.08)" };
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
                      className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${cs.bg} 0%, rgba(255,255,255,0.02) 100%)`,
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onClick={() => launchSearch(job.title)}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${cs.color}35`;
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${cs.color}20`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }}
                    >
                      {/* Company color accent — top edge */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${cs.color}60, ${cs.color}90, ${cs.color}60, transparent)` }} />

                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: cs.bg, color: cs.color, border: `1px solid ${cs.color}30` }}
                          >
                            {job.company[0]}
                          </div>
                          <span className="text-xs font-medium" style={{ color: cs.color }}>{job.company}</span>
                        </div>
                        {job.tag && (
                          <span
                            className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full"
                            style={job.tag === "Hot"
                              ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171" }
                              : { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }
                            }
                          >
                            {job.tag === "Hot" ? "🔥 Hot" : "✦ New"}
                          </span>
                        )}
                      </div>

                      {/* Job title */}
                      <p className="text-sm font-semibold mb-2 transition-colors duration-150 group-hover:text-[#DEC27A]" style={{ color: "#E8EDF5", lineHeight: 1.3 }}>
                        {job.title}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#6B7A99" }}>{job.location}</span>
                        <span className="text-xs font-bold" style={{ color: "#C9A84C" }}>{job.salary}</span>
                      </div>

                      {/* Arrow hint */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <ArrowRight size={14} style={{ color: cs.color }} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-10 sm:gap-16 mb-10">
                {[
                  ["500+", "Job Boards"],
                  ["Real-time", "Live Results"],
                  ["1-click", "Auto Tailor"],
                ].map(([val, label], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="font-bold text-xl mb-1" style={{ color: "#C9A84C", fontFamily: "Playfair Display, serif" }}>{val}</div>
                    <div className="text-[#5A6A82] text-xs">{label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Popular searches */}
              <div className="text-center">
                <p className="text-[#3A4A5C] text-[0.7rem] mb-3 uppercase tracking-widest font-semibold">Popular searches</p>
                <div className="flex items-center justify-center flex-wrap gap-2">
                  {["Senior Designer", "React Engineer", "Product Manager", "Data Scientist", "DevRel", "AI Engineer"].map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      onClick={() => launchSearch(q)}
                      className="badge-gold cursor-pointer transition-all duration-150 hover:scale-105"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
