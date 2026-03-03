"use client";

import { useState, useCallback, useRef } from "react";
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

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [seniority, setSeniority] = useState("Any Level");
  const [jobType, setJobType] = useState("Any Type");
  const [datePosted, setDatePosted] = useState("Past week");
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

    setLoading(true);
    setSearched(true);
    setJobs([]);

    try {
      const params = new URLSearchParams({
        q: query,
        location,
        remote: String(remote),
        seniority,
        jobType,
        datePosted,
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
  }, [query, location, remote, seniority, jobType, datePosted]);

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

  return (
    <div className="min-h-screen" style={{ background: "#07090F" }}>
      <Navbar />

      <div className="pt-20 pb-12">
        {/* ── Search Hero ── */}
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
          <div className="text-center mb-8">
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
              Searching across 500+ job boards in real-time
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1 relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Try "Senior Designer", "React Engineer", "Product Manager"'
                  className="input-luxury w-full pl-11 pr-10 py-3.5 text-sm"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#374151] hover:text-[#6B7A99]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="relative sm:w-52">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#374151] pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (or leave blank)"
                  className="input-luxury w-full pl-10 pr-4 py-3.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="btn-gold px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="flex items-center flex-wrap gap-2">
              {/* Remote toggle */}
              <button
                type="button"
                onClick={() => setRemote(!remote)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: remote ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                  border: remote ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.07)",
                  color: remote ? "#4ade80" : "#6B7A99",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: remote ? "#22c55e" : "#374151" }} />
                Remote only
              </button>

              {/* Seniority */}
              <div className="relative">
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="input-luxury text-xs pl-3 pr-8 py-2 rounded-lg appearance-none cursor-pointer"
                  style={{ color: seniority !== "Any Level" ? "#DEC27A" : "#6B7A99" }}
                >
                  {SENIORITY.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#374151]" />
              </div>

              {/* Job type */}
              <div className="relative">
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="input-luxury text-xs pl-3 pr-8 py-2 rounded-lg appearance-none cursor-pointer"
                  style={{ color: jobType !== "Any Type" ? "#DEC27A" : "#6B7A99" }}
                >
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#374151]" />
              </div>

              {/* Date posted */}
              <div className="relative">
                <select
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value)}
                  className="input-luxury text-xs pl-3 pr-8 py-2 rounded-lg appearance-none cursor-pointer"
                  style={{ color: "#6B7A99" }}
                >
                  {DATE_POSTED.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#374151]" />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn-ghost flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg ml-auto"
              >
                <SlidersHorizontal size={13} />
                More filters
              </button>
            </div>
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
                  style={{ color: viewMode === "list" ? "#C9A84C" : "#374151", background: viewMode === "list" ? "rgba(201,168,76,0.08)" : "transparent" }}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: viewMode === "grid" ? "#C9A84C" : "#374151", background: viewMode === "grid" ? "rgba(201,168,76,0.08)" : "transparent" }}
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

          {/* Empty state */}
          {!loading && searched && jobs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-[#F0F2F7] font-semibold text-lg mb-2">No jobs found</h3>
              <p className="text-[#6B7A99] text-sm max-w-xs mx-auto">
                Try different keywords, broaden your location, or enable remote search.
              </p>
            </div>
          )}

          {/* Initial state — no search yet */}
          {!searched && !loading && (
            <div className="text-center py-24">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.12)" }}
              >
                <Search size={28} className="text-[#C9A84C] opacity-60" />
              </div>
              <h3 className="text-[#F0F2F7] font-semibold text-xl mb-3" style={{ fontFamily: "Playfair Display, serif" }}>
                What&apos;s your dream role?
              </h3>
              <p className="text-[#6B7A99] text-sm max-w-xs mx-auto mb-8">
                Search once. We check 500+ boards and score every result against your profile.
              </p>
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
