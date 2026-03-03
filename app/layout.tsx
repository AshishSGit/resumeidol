import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeIdol — The AI resume tailor that gets you hired",
  description:
    "AI-powered job search platform. Find the right jobs, tailor your resume to beat ATS, and land interviews faster. Aggregates LinkedIn, Indeed, Glassdoor, and 500+ boards.",
  keywords: "job search, ATS optimizer, resume tailor, AI job matching, beat ATS, job application tracker",
  openGraph: {
    title: "ResumeIdol — The AI resume tailor that gets you hired",
    description:
      "Find smarter. Apply better. Get hired. The AI job search platform that gives you an unfair advantage.",
    type: "website",
    url: "https://resumeidol.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIdol",
    description: "The AI resume tailor that gets you hired.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
