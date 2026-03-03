import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Resume Tailor — Tailor Your Resume to Any Job",
  description:
    "Upload your resume and paste a job description. ResumeIdol's AI rewrites your resume with the right keywords to beat ATS and impress recruiters. Get your ATS score before and after.",
  alternates: {
    canonical: "https://resumeidol.com/tailor",
  },
  openGraph: {
    title: "AI Resume Tailor — Tailor Your Resume to Any Job | ResumeIdol",
    description:
      "Upload your resume, paste the job description, and get a fully tailored resume in seconds — with ATS score before & after.",
    url: "https://resumeidol.com/tailor",
  },
};

export default function TailorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
