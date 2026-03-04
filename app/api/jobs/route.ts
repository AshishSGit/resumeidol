import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MOCK_JOBS = [
  {
    id: "1",
    title: "Senior Product Designer",
    company: "Linear",
    location: "San Francisco, CA (Remote OK)",
    salary: "$140k – $180k",
    type: "Remote",
    posted: "2 days ago",
    description: "We're looking for a Senior Product Designer to shape the future of software development tools. You'll own end-to-end design for our core product experience.",
    applyUrl: "https://linear.app/careers",
    logo: "https://logo.clearbit.com/linear.app",
    matchScore: 91,
    atsType: "Greenhouse",
    source: "LinkedIn",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "B2B SaaS"],
    isGhost: false,
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "Vercel",
    location: "Remote — Worldwide",
    salary: "$160k – $220k",
    type: "Remote",
    posted: "1 day ago",
    description: "Join the team building the platform that powers millions of developers. You'll work on core infrastructure and developer experience features.",
    applyUrl: "https://vercel.com/careers",
    logo: "https://logo.clearbit.com/vercel.com",
    matchScore: 88,
    atsType: "Lever",
    source: "Indeed",
    skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    isGhost: false,
  },
  {
    id: "3",
    title: "AI/ML Engineer",
    company: "Anthropic",
    location: "San Francisco, CA",
    salary: "$200k – $300k",
    type: "Full-time",
    posted: "3 days ago",
    description: "Work on frontier AI safety research and help build AI systems that are safe, beneficial, and understandable.",
    applyUrl: "https://anthropic.com/careers",
    logo: "https://logo.clearbit.com/anthropic.com",
    matchScore: 76,
    atsType: "Workday",
    source: "Glassdoor",
    skills: ["Python", "PyTorch", "LLMs", "RLHF", "ML Research"],
    isGhost: false,
  },
  {
    id: "4",
    title: "Product Manager — Growth",
    company: "Notion",
    location: "New York, NY (Hybrid)",
    salary: "$155k – $195k",
    type: "Full-time",
    posted: "5 days ago",
    description: "Lead growth initiatives for Notion's core product. Drive user acquisition, activation, and retention through data-driven experimentation.",
    applyUrl: "https://notion.so/careers",
    logo: "https://logo.clearbit.com/notion.so",
    matchScore: 83,
    atsType: "Greenhouse",
    source: "LinkedIn",
    skills: ["Growth PM", "A/B Testing", "SQL", "Analytics", "PLG"],
    isGhost: false,
  },
  {
    id: "5",
    title: "DevRel Engineer",
    company: "Supabase",
    location: "Remote — US",
    salary: "$120k – $160k",
    type: "Remote",
    posted: "Just now",
    description: "Evangelize Supabase through content, talks, and code. Help developers build better products with our platform.",
    applyUrl: "https://supabase.com/careers",
    logo: "https://logo.clearbit.com/supabase.com",
    matchScore: 79,
    atsType: "Lever",
    source: "Remotive",
    skills: ["PostgreSQL", "TypeScript", "Developer Advocacy", "Content", "OSS"],
    isGhost: false,
  },
  {
    id: "6",
    title: "Senior Frontend Engineer",
    company: "Figma",
    location: "San Francisco, CA",
    salary: "$180k – $240k",
    type: "Full-time",
    posted: "1 week ago",
    description: "Build the creative tools used by millions of designers worldwide. Own complex UI systems and collaborate with design to push what's possible on the web.",
    applyUrl: "https://figma.com/careers",
    logo: "https://logo.clearbit.com/figma.com",
    matchScore: 72,
    atsType: "Workday",
    source: "Indeed",
    skills: ["React", "TypeScript", "WebGL", "Canvas API", "Performance"],
    isGhost: true,
  },
];

// Map UI filter values to JSearch API params
const DATE_MAP: Record<string, string> = {
  "Past 24 hours": "today",
  "Past week": "week",
  "Past month": "month",
  "Any time": "all",
};

const JOB_TYPE_MAP: Record<string, string> = {
  "Full-time": "FULLTIME",
  "Part-time": "PARTTIME",
  "Contract": "CONTRACTOR",
  "Internship": "INTERN",
};

const SENIORITY_KEYWORDS: Record<string, string> = {
  "Entry Level": "entry level",
  "Mid Level": "mid level",
  "Senior": "senior",
  "Lead": "lead",
  "Director": "director",
  "Internship": "intern",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const remote = searchParams.get("remote") === "true";
  const seniority = searchParams.get("seniority") || "Any Level";
  const jobType = searchParams.get("jobType") || "Any Type";
  const datePosted = searchParams.get("datePosted") || "Any time";
  const source = searchParams.get("source") || "All";
  const page = parseInt(searchParams.get("page") || "1");

  const rapidApiKey = process.env.RAPIDAPI_KEY;

  if (rapidApiKey && query) {
    try {
      // Build search query with seniority keyword appended
      const seniorityKw = SENIORITY_KEYWORDS[seniority] ?? "";
      const searchQuery = [
        seniorityKw,
        query,
        location && location !== "Remote" ? `in ${location}` : "",
        remote || location === "Remote" ? "remote" : "",
      ]
        .filter(Boolean)
        .join(" ");

      const apiParams = new URLSearchParams({
        query: searchQuery,
        page: String(page),
        num_pages: "3",
        date_posted: DATE_MAP[datePosted] ?? "all",
      });

      // Employment type filter
      if (jobType !== "Any Type" && jobType !== "Remote" && JOB_TYPE_MAP[jobType]) {
        apiParams.set("employment_types", JOB_TYPE_MAP[jobType]);
      }
      if (jobType === "Remote" || remote) {
        apiParams.set("remote_jobs_only", "true");
      }

      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?${apiParams}`,
        {
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        let jobs = (data.data || []).map((job: Record<string, unknown>, i: number) => {
          const postedAt = job.job_posted_at_datetime_utc as string | undefined;
          const daysAgo = postedAt
            ? Math.floor((Date.now() - new Date(postedAt).getTime()) / 86400000)
            : null;
          const postedLabel =
            daysAgo === null ? "Recently" : daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;
          const isGhost = daysAgo !== null && daysAgo > 21;

          return {
            id: (job.job_id as string) || String(i),
            title: (job.job_title as string) || "",
            company: (job.employer_name as string) || "",
            location: job.job_is_remote
              ? "Remote"
              : `${job.job_city || ""}${job.job_state ? `, ${job.job_state}` : ""}`,
            salary:
              job.job_min_salary && job.job_max_salary
                ? `$${Math.round((job.job_min_salary as number) / 1000)}k – $${Math.round((job.job_max_salary as number) / 1000)}k`
                : undefined,
            type: job.job_is_remote ? "Remote" : (job.job_employment_type as string) || "Full-time",
            posted: postedLabel,
            description: ((job.job_description as string) || "").slice(0, 300) + "...",
            applyUrl: (job.job_apply_link as string) || "#",
            logo: (job.employer_logo as string) || undefined,
            matchScore: Math.floor(Math.random() * 30) + 60,
            atsType: undefined,
            source: (job.job_publisher as string) || "Job Board",
            skills: (job.job_required_skills as string[]) || [],
            isGhost,
          };
        });

        // Filter by source if selected
        if (source !== "All") {
          jobs = jobs.filter((j: { source: string }) =>
            j.source.toLowerCase().includes(source.toLowerCase())
          );
        }

        return NextResponse.json({ jobs, total: jobs.length, source: "live" });
      }
    } catch (err) {
      console.error("JSearch API error:", err);
    }
  }

  // Filter mock data
  let results = MOCK_JOBS.filter((job) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q));
    const matchesRemote = !remote || job.type === "Remote";
    const matchesLocation =
      !location ||
      location === "Remote" ||
      job.location.toLowerCase().includes(location.toLowerCase()) ||
      job.type === "Remote";
    const matchesSource =
      source === "All" || job.source.toLowerCase() === source.toLowerCase();
    return matchesQuery && matchesRemote && matchesLocation && matchesSource;
  });

  await new Promise((r) => setTimeout(r, 400));

  return NextResponse.json({
    jobs: results,
    total: results.length,
    source: "demo",
    notice: !rapidApiKey
      ? "Running in demo mode. Add RAPIDAPI_KEY for live job data."
      : undefined,
  });
}
