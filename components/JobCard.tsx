"use client";

import { useState } from "react";
import {
  MapPin, Clock, DollarSign, ExternalLink, Bookmark,
  BookmarkCheck, Zap, Building2
} from "lucide-react";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string; // "Full-time" | "Part-time" | "Contract" | "Remote"
  posted: string; // "2 days ago", "Just now", etc.
  description: string;
  applyUrl: string;
  logo?: string;
  matchScore?: number;
  atsType?: string; // "Workday" | "Greenhouse" | "Lever" etc.
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

function MatchRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#C9A84C" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 54, height: 54 }}>
      <svg width={54} height={54} className="absolute">
        <circle
          cx={27} cy={27} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={3}
        />
        <circle
          cx={27} cy={27} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <span className="text-xs font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "#0077B5",
  Indeed: "#2164F3",
  Glassdoor: "#0CAA41",
  Dice: "#E8612D",
  Remotive: "#3B82F6",
  default: "#6B7A99",
};

export default function JobCard({ job, onTailor, onSave, saved = false, compact = false }: JobCardProps) {
  const [bookmarked, setBookmarked] = useState(saved);
  const [tailoring, setTailoringState] = useState(false);

  const handleSave = () => {
    setBookmarked(!bookmarked);
    onSave?.(job);
  };

  const handleTailor = async () => {
    setTailoringState(true);
    onTailor?.(job);
    setTimeout(() => setTailoringState(false), 1000);
  };

  const typeColor = job.type === "Remote" ? "#22c55e" : job.type === "Contract" ? "#f59e0b" : "#6B7A99";
  const srcColor = SOURCE_COLORS[job.source ?? ""] ?? SOURCE_COLORS.default;

  return (
    <div className="card p-5 group cursor-pointer" onClick={() => window.open(job.applyUrl, "_blank")}>
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div
          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-lg font-bold border border-[rgba(255,255,255,0.08)]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain rounded" />
          ) : (
            <Building2 size={20} className="text-[#374151]" />
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-[#F0F2F7] font-semibold text-[0.95rem] leading-snug group-hover:text-[#DEC27A] transition-colors truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              {job.matchScore && <MatchRing score={job.matchScore} />}
            </div>
          </div>

          <p className="text-[#6B7A99] text-sm font-medium mb-3">{job.company}</p>

          {/* Meta row */}
          <div className="flex items-center flex-wrap gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-[#6B7A99]">
              <MapPin size={12} />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7A99]">
                <DollarSign size={12} />
                {job.salary}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-[#6B7A99]">
              <Clock size={12} />
              {job.posted}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                background: `${typeColor}15`,
                border: `1px solid ${typeColor}25`,
                color: typeColor,
              }}
            >
              {job.type}
            </span>
            {job.atsType && (
              <span className="badge-blue text-[0.7rem]">{job.atsType}</span>
            )}
            {job.source && (
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  background: `${srcColor}12`,
                  border: `1px solid ${srcColor}20`,
                  color: srcColor,
                }}
              >
                {job.source}
              </span>
            )}
            {job.isGhost && (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                ⚠ Ghost job risk
              </span>
            )}
          </div>

          {!compact && job.description && (
            <p className="text-[#4B5563] text-xs leading-relaxed line-clamp-2 mb-4">
              {job.description}
            </p>
          )}

          {/* Skills */}
          {!compact && job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 5).map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#6B7A99" }}>
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="text-xs text-[#374151]">+{job.skills.length - 5} more</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleTailor}
              disabled={tailoring}
              className="btn-gold flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg"
            >
              <Zap size={12} />
              {tailoring ? "Tailoring..." : "Tailor Resume"}
            </button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              Apply
              <ExternalLink size={11} />
            </a>
            <button
              onClick={handleSave}
              className="ml-auto p-2 rounded-lg transition-all"
              style={{ color: bookmarked ? "#C9A84C" : "#374151" }}
            >
              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
