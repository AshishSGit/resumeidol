import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Search — Find Jobs Across 500+ Boards",
  description:
    "Search millions of jobs from LinkedIn, Indeed, Glassdoor, and 500+ job boards in one place. Filter by role, location, type, and experience level.",
  alternates: {
    canonical: "https://resumeidol.com/search",
  },
  openGraph: {
    title: "Job Search — Find Jobs Across 500+ Boards | ResumeIdol",
    description:
      "Search millions of jobs from LinkedIn, Indeed, Glassdoor, and 500+ boards. Filter, save, and apply — all in one place.",
    url: "https://resumeidol.com/search",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
