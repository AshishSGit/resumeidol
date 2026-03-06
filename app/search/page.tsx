"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import JobCard, { Job } from "@/components/JobCard";
import {
  Search, SlidersHorizontal, MapPin, X, Loader2,
  Wifi, WifiOff, ChevronDown, LayoutGrid, List
} from "lucide-react";

const SENIORITY = ["Any Level", "Internship", "Entry Level", "Mid Level", "Senior", "Lead", "Director"];
const JOB_TYPES = ["Any Type", "Full-time", "Part-time", "Contract", "Remote", "Internship"];
const DATE_POSTED = ["Any time", "Past 24 hours", "Past week", "Past month"];
const SOURCES = ["All", "LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Dice", "Remotive", "BeBee", "Jooble", "Snagajob"];

const DEFAULT_LOCATIONS = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "San Jose, CA",
  "Los Angeles, CA",
  "Seattle, WA",
  "Austin, TX",
  "Chicago, IL",
  "Boston, MA",
  "London, UK",
  "Toronto, Canada",
  "Sydney, Australia",
];

function formatPlace(displayName: string): string {
  const parts = displayName.split(", ").map((p) => p.trim());
  if (parts.length >= 2) return `${parts[0]}, ${parts[parts.length - 1]}`;
  return parts[0];
}

function FilterSelect({
  value,
  onChange,
  options,
  active,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  active?: boolean;
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
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setShowLocSuggestions(false);
    setLoading(true);
    setSearched(true);
    setJobs([]);

    try {
      const locVal = locationInput.trim();
      const effectiveLocation = locVal === "" || locVal.toLowerCase() === "anywhere" ? "" : locVal;
      const effectiveRemote = remote || locVal.toLowerCase() === "remote";

      const params = new URLSearchParams({
        q: query,
        location: effectiveLocation,
        remote: String(effectiveRemote),
        seniority,
        jobType,
        datePosted,
        source,
      });

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();

      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setNotice(data.notice || null);
      setIsLive(data.source === "live");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, locationInput, remote, seniority, jobType, datePosted, source]);

  const handleTailor = (job: Job) => {
    const params = new URLSearchParams({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      applyUrl: job.applyUrl,
    });
    router.push(`/tailor?${params}`);
  };

  const clearSearch = () => {
    setQuery("");
    setJobs([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(e.target as Node)) {
        setShowLocSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [nominatimResults, setNominatimResults] = useState<string[]>([]);
  const nominatimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = locationInput.trim();
    if (!q || q.toLowerCase() === "remote") {
      setNominatimResults([]);
      return;
    }
    if (nominatimTimer.current) clearTimeout(nominatimTimer.current);
    nominatimTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8&featuretype=city&addressdetails=0&accept-language=en`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const names: string[] = Array.from(
          new Set(
            (data as { display_name: string }[]).map((d) => formatPlace(d.display_name))
          )
        );
        setNominatimResults(names.slice(0, 8));
      } catch {
        setNominatimResults([]);
      }
    }, 350);
    return () => { if (nominatimTimer.current) clearTimeout(nominatimTimer.current); };
  }, [locationInput]);

  const locSuggestions = useMemo(() => {
    const q = locationInput.trim().toLowerCase();
    if (!q) return DEFAULT_LOCATIONS;
    if (q === "remote") return ["Remote"];
    const combined = nominatimResults.length > 0
      ? nominatimResults
      : DEFAULT_LOCATIONS.filter((l) => l.toLowerCase().includes(q));
    if (!combined.some((c) => c.toLowerCase() === locationInput.trim().toLowerCase())) {
      return [locationInput.trim(), ...combined].slice(0, 9);
    }
    return combined;
  }, [locationInput, nominatimResults]);

  const activeFilterCount = [
    seniority !== "Any Level",
    jobType !== "Any Type",
    datePosted !== "Past week",
    source !== "All",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen relative" style={{ background: "#07090F" }}>
      {/* Ambient orbs */}
      <div className="absolute top-20 left-1/4 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.045) 0%, transparent 65%)", zIndex: 0 }} />
      <div className="absolute top-2/3 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 65%)", zIndex: 0 }} />
      <Navbar />

      <div className="relative z-10 pt-20 pb-12">
        {/* ── Search Hero ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
          <div className="text-center mb-8">
            <div className="badge-gold mb-4 inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              Live · 500+ job boards · Real-time
            </div>
            <h1
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
                fontWeight: 700,
                color: "#F0F2F7",
                lineHeight: 1.1,
              }}
            >
              Find your next{" "}
              <span className="text-gold-gradient italic">breakthrough role</span>
            </h1>
            <p className="text-[#6B7A99] mt-3 text-base">
              Search once. ResumeIdol scans 500+ boards and surfaces the best fits.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch}>
            {/* Unified premium search pill */}
            <div
              className="search-pill-container flex flex-col sm:flex-row rounded-2xl mb-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
              }}
            >
              {/* Query input */}
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7A99] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Job title, skill, or company...'
                  className="search-pill-input w-full pl-11 pr-10 py-4 text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#9CA3AF] transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Vertical divider (desktop) / horizontal (mobile) */}
              <div className="hidden sm:block w-px self-stretch my-3" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="sm:hidden h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />

              {/* Location autocomplete */}
              <div className="relative sm:w-52" ref={locRef}>
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7A99] pointer-events-none z-10" />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setShowLocSuggestions(true);
                    if (!e.target.value.trim()) setRemote(false);
                  }}
                  onFocus={() => setShowLocSuggestions(true)}
                  placeholder="Location or Remote"
                  className="search-pill-input w-full pl-9 pr-8 py-4 text-sm"
                  style={{ color: locationInput ? "#DEC27A" : undefined }}
                />
                {locationInput ? (
                  <button
                    type="button"
                    onClick={() => { setLocationInput(""); setRemote(false); setShowLocSuggestions(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#9CA3AF] transition-colors"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7A99]" />
                )}
                {showLocSuggestions && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-xl"
                    style={{ background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "220px", overflowY: "auto" }}
                  >
                    {locSuggestions.slice(0, 10).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLocationInput(loc);
                          setShowLocSuggestions(false);
                          if (loc === "Remote") setRemote(true);
                          else setRemote(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors"
                        style={{ color: "#9CA3AF" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <MapPin size={12} className="text-[#6B7A99] shrink-0" />
                        {loc}
                      </button>
                    ))}
                    {locSuggestions.length === 0 && (
                      <div className="px-4 py-3 text-xs text-[#6B7A99]">No matching locations — press Search to use your input</div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile divider before button */}
              <div className="sm:hidden h-px mx-4" style={{ background: "rgba(255,255,255,0.07)" }} />

              {/* Search button */}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-gold search-btn px-8 py-4 font-semibold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                Search
              </button>
            </div>

            {/* Quick filters row */}
            <div className="flex items-center gap-2">
              {/* Remote toggle */}
              <button
                type="button"
                onClick={() => setRemote(!remote)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0"
                style={{
                  background: remote ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                  border: remote ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.07)",
                  color: remote ? "#4ade80" : "#6B7A99",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: remote ? "#22c55e" : "#4B5563" }} />
                Remote only
              </button>

              {/* Desktop filter selects */}
              <div className="hidden sm:flex items-center gap-2 flex-wrap">
                <FilterSelect value={seniority} onChange={setSeniority} options={SENIORITY} active={seniority !== "Any Level"} />
                <FilterSelect value={jobType} onChange={setJobType} options={JOB_TYPES} active={jobType !== "Any Type"} />
                <FilterSelect value={datePosted} onChange={setDatePosted} options={DATE_POSTED} active={datePosted !== "Any time"} />
                <FilterSelect value={source} onChange={setSource} options={SOURCES} active={source !== "All"} />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg ml-auto shrink-0"
              >
                <SlidersHorizontal size={13} />
                {activeFilterCount > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: "#C9A84C", color: "#07090F" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
                Filters
              </button>
            </div>

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="sm:hidden flex flex-wrap gap-2 pt-2">
                <FilterSelect value={seniority} onChange={setSeniority} options={SENIORITY} active={seniority !== "Any Level"} />
                <FilterSelect value={jobType} onChange={setJobType} options={JOB_TYPES} active={jobType !== "Any Type"} />
                <FilterSelect value={datePosted} onChange={setDatePosted} options={DATE_POSTED} active={datePosted !== "Any time"} />
                <FilterSelect value={source} onChange={setSource} options={SOURCES} active={source !== "All"} />
              </div>
            )}
          </form>
        </div>

        {/* ── Results ── */}
        <div className="max-w-4xl mx-auto px-6">
          {/* Status bar */}
          {searched && !loading && (
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-[#F0F2F7] text-sm font-medium">
                  {total > 0 ? (
                    <><span className="text-gold-gradient font-bold">{total}</span> jobs found</>
                  ) : (
                    "No jobs found"
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  {isLive ? (
                    <><Wifi size={12} className="text-[#22c55e]" /><span className="text-xs text-[#22c55e]">Live data</span></>
                  ) : (
                    <><WifiOff size={12} className="text-[#f59e0b]" /><span className="text-xs text-[#f59e0b]">Demo mode</span></>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: viewMode === "list" ? "#C9A84C" : "#4B5563", background: viewMode === "list" ? "rgba(201,168,76,0.08)" : "transparent" }}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: viewMode === "grid" ? "#C9A84C" : "#4B5563", background: viewMode === "grid" ? "rgba(201,168,76,0.08)" : "transparent" }}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Demo notice */}
          {notice && (
            <div className="flex items-start gap-3 p-4 rounded-xl mb-5 text-sm" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <WifiOff size={15} className="text-[#f59e0b] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#f59e0b] font-medium">Demo mode: </span>
                <span className="text-[#9CA3AF]">{notice}</span>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Loader2 size={15} className="text-[#C9A84C] animate-spin shrink-0" />
                <span className="text-[#6B7A99] text-sm">
                  Scanning 500+ job boards for <span className="text-[#DEC27A] font-medium">&ldquo;{query}&rdquo;</span>...
                </span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card p-5">
                    <div className="flex gap-4">
                      <div className="skeleton w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-2.5">
                        <div className="skeleton h-5 w-1/2 rounded" />
                        <div className="skeleton h-4 w-1/3 rounded" />
                        <div className="skeleton h-3 w-3/4 rounded" />
                        <div className="flex gap-2">
                          <div className="skeleton h-6 w-20 rounded-full" />
                          <div className="skeleton h-6 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low-results hint when source-filtered */}
          {!loading && searched && jobs.length > 0 && jobs.length < 5 && source !== "All" && isLive && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl mb-4 text-xs"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
              <span className="text-[#C9A84C] shrink-0 mt-0.5">ℹ</span>
              <span className="text-[#9CA3AF]">
                Only {jobs.length} {source} listing{jobs.length !== 1 ? "s" : ""} found — {source} data is limited in our index.{" "}
                <button
                  type="button"
                  onClick={() => { setSource("All"); setTimeout(() => handleSearch(), 50); }}
                  className="text-[#C9A84C] hover:underline font-medium"
                >
                  Switch to All Sources
                </button>{" "}
                to see the full results.
              </span>
            </div>
          )}

          {/* Results */}
          {!loading && jobs.length > 0 && (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onTailor={handleTailor}
                  compact={viewMode === "grid"}
                />
              ))}
            </div>
          )}

          {/* Empty state (after failed search) */}
          {!loading && searched && jobs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-[#F0F2F7] font-semibold text-lg mb-2">No jobs found</h3>
              <p className="text-[#6B7A99] text-sm max-w-xs mx-auto">
                Try different keywords, broaden your location, or switch to &quot;All&quot; sources.
              </p>
            </div>
          )}

          {/* Initial state */}
          {!searched && !loading && (
            <div className="text-center py-16">
              {/* Animated icon with pulsing rings */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-3xl animate-ping opacity-20" style={{ background: "rgba(201,168,76,0.15)", animationDuration: "2.5s" }} />
                <div className="absolute -inset-3 rounded-[28px] animate-ping opacity-10" style={{ background: "rgba(201,168,76,0.08)", animationDuration: "2.5s", animationDelay: "0.6s" }} />
                <div
                  className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.18)", boxShadow: "0 0 50px rgba(201,168,76,0.1)" }}
                >
                  <Search size={30} className="text-[#C9A84C]" />
                </div>
              </div>

              <h3 className="text-[#F0F2F7] font-semibold text-2xl mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                What&apos;s your dream role?
              </h3>
              <p className="text-[#6B7A99] text-sm max-w-sm mx-auto mb-10">
                Search once. ResumeIdol scans 500+ boards and scores every result against your profile.
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-center gap-8 sm:gap-14 mb-10">
                {[
                  ["500+", "Job Boards"],
                  ["Real-time", "Live Results"],
                  ["1-click", "Auto Tailor"],
                ].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="font-bold text-xl mb-1" style={{ color: "#C9A84C", fontFamily: "Playfair Display, serif" }}>{val}</div>
                    <div className="text-[#6B7A99] text-xs">{label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[#445568] text-xs mb-3 uppercase tracking-widest font-medium">Popular searches</p>
              <div className="flex items-center justify-center flex-wrap gap-2">
                {["Senior Designer", "React Engineer", "Product Manager", "Data Scientist", "DevRel"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); setTimeout(() => inputRef.current?.form?.requestSubmit(), 50); }}
                    className="badge-gold cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
