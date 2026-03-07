"use client";

import { useState } from "react";
import {
  MapPin, Clock, ExternalLink, Bookmark,
  BookmarkCheck, Zap
} from "lucide-react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  posted: string;
  description: string;
  applyUrl: string;
  logo?: string;
  matchScore?: number;
  atsType?: string;
  isGhost?: boolean;
  source?: string;
  skills?: string[];
}

interface JobCardProps {
  job: Job;
  onTailor?: (job: Job) => void;
  onSave?: (job: Job) => void;
  saved?: boolean;
  compact?: boolean;
}

// Score ring with glow — larger, more readable
function MatchRing({ score }: { score: number }) {
  const size = 62;
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#C9A84C" : "#9CA3AF";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-sm font-bold leading-none" style={{ color, fontFamily: "Playfair Display, serif" }}>{score}</span>
        <span className="text-[0.55rem] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>match</span>
      </div>
    </div>
  );
}

const TYPE_COLOR: Record<string, string> = {
  Remote:     "#22c55e",
  Contract:   "#f59e0b",
  "Full-time": "#6366f1",
  "Part-time": "#8b5cf6",
  Internship: "#06b6d4",
};

const SOURCE_BG: Record<string, { bg: string; color: string }> = {
  LinkedIn:    { bg: "rgba(0,119,181,0.12)",  color: "#60a5fa" },
  Indeed:      { bg: "rgba(33,100,243,0.12)", color: "#818cf8" },
  Glassdoor:   { bg: "rgba(12,170,65,0.1)",   color: "#4ade80" },
  ZipRecruiter:{ bg: "rgba(255,165,0,0.1)",   color: "#fbbf24" },
  Dice:        { bg: "rgba(232,97,45,0.1)",   color: "#fb923c" },
  Remotive:    { bg: "rgba(59,130,246,0.1)",  color: "#93c5fd" },
};

export default function JobCard({ job, onTailor, onSave, saved = false, compact = false }: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(saved);
  const [tailoring, setTailoringState] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    onSave?.(job);
  };

  const handleTailor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTailoringState(true);
    onTailor?.(job);
    setTimeout(() => setTailoringState(false), 1000);
  };

  const matchColor = job.matchScore
    ? job.matchScore >= 80 ? "#22c55e"
    : job.matchScore >= 65 ? "#C9A84C"
    : "#9CA3AF"
    : undefined;

  const typeColor = TYPE_COLOR[job.type] ?? "#6B7A99";
  const srcStyle = SOURCE_BG[job.source ?? ""] ?? { bg: "rgba(255,255,255,0.05)", color: "#6B7A99" };

  return (
    <div
      className="card group relative overflow-hidden cursor-pointer transition-all duration-200"
      style={{ padding: "20px", borderRadius: "16px" }}
      onClick={() => window.open(job.applyUrl, "_blank")}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.18)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(201,168,76,0.1)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      {/* Match score progress bar — top edge */}
      {job.matchScore && (
        <div
          className="absolute top-0 left-0 h-[2px] rounded-t-2xl transition-all duration-700"
          style={{
            width: `${job.matchScore}%`,
            background: `linear-gradient(90deg, ${matchColor}80, ${matchColor})`,
            boxShadow: `0 0 8px ${matchColor}60`,
          }}
        />
      )}

      <div className="flex items-start gap-4">

        {/* Company logo / initial */}
        <div
          className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain rounded" />
          ) : (
            <span style={{ color: "#9CA3AF" }}>{job.company[0]}</span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Title row */}
          <div className="flex items-start gap-3 mb-1">
            <h3
              className="flex-1 min-w-0 font-semibold leading-snug transition-colors duration-200 group-hover:text-[#DEC27A]"
              style={{ fontSize: "0.975rem", color: "#E8EDF5" }}
            >
              {job.title}
            </h3>
            {job.matchScore && <MatchRing score={job.matchScore} />}
          </div>

          {/* Company name */}
          <p className="text-sm font-medium mb-3" style={{ color: "#8A97AA" }}>
            {job.company}
          </p>

          {/* Key info — location · salary · date */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: "#6B7A90" }}>
              <MapPin size={11} className="shrink-0" />
              {job.location}
            </span>
            {job.salary && (
              <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs" style={{ color: "#4B5A6A" }}>
              <Clock size={11} className="shrink-0" />
              {job.posted}
            </span>
          </div>

          {/* Description */}
          {!compact && job.description && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mb-4"
              style={{ color: "#6B7A90" }}
            >
              {job.description}
            </p>
          )}

          {/* Skills */}
          {!compact && job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#6B7A99" }}
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs" style={{ color: "#4B5A6A" }}>+{job.skills.length - 5} more</span>
              )}
            </div>
          )}

          {/* Tags row */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${typeColor}13`, border: `1px solid ${typeColor}28`, color: typeColor }}
            >
              {job.type}
            </span>
            {job.source && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: srcStyle.bg, border: `1px solid ${srcStyle.color}25`, color: srcStyle.color }}
              >
                {job.source}
              </span>
            )}
            {job.isGhost && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                ⚠ Ghost job risk
              </span>
            )}
          </div>

          {/* Primary CTA — Tailor Resume (full-width, dominant) */}
          <button
            onClick={handleTailor}
            disabled={tailoring}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all mb-2 disabled:opacity-60"
            style={tailoring
              ? { background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#DEC27A" }
              : { background: "linear-gradient(135deg, #C9A84C 0%, #B8952F 100%)", color: "#07090F", boxShadow: "0 4px 20px rgba(201,168,76,0.25)" }
            }
          >
            <Zap size={14} />
            {tailoring ? "Opening Tailor..." : "Tailor My Resume for This Role →"}
          </button>

          {/* Secondary row — Apply + Bookmark */}
          <div className="flex items-center gap-2">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg flex-1 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              Apply directly
              <ExternalLink size={11} />
            </a>
            <button
              onClick={handleSave}
              className="p-2 rounded-lg transition-all"
              style={{
                color: bookmarked ? "#C9A84C" : "#4B5563",
                background: bookmarked ? "rgba(201,168,76,0.08)" : "transparent",
                border: bookmarked ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => { if (!bookmarked) (e.currentTarget as HTMLButtonElement).style.color = "#6B7A99"; }}
              onMouseLeave={(e) => { if (!bookmarked) (e.currentTarget as HTMLButtonElement).style.color = bookmarked ? "#C9A84C" : "#4B5563"; }}
            >
              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
