import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://resumeidol.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ResumeIdol — AI Resume Tailor That Gets You Hired",
    template: "%s | ResumeIdol",
  },
  description:
    "ResumeIdol uses AI to tailor your resume for every job — beating ATS filters and impressing recruiters. Search 500+ job boards, get a custom-tailored resume, and land more interviews.",
  keywords: [
    "AI resume tailor",
    "ATS resume optimizer",
    "resume builder AI",
    "job search AI",
    "beat ATS",
    "resume keywords",
    "tailor resume to job description",
    "AI job application",
    "resume rewriter",
    "ATS score checker",
  ],
  authors: [{ name: "ResumeIdol" }],
  creator: "ResumeIdol",
  publisher: "ResumeIdol",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "ResumeIdol — AI Resume Tailor That Gets You Hired",
    description:
      "Tailor your resume to any job in seconds. Beat ATS, impress recruiters, and land interviews faster with AI-powered resume optimization.",
    type: "website",
    url: BASE_URL,
    siteName: "ResumeIdol",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ResumeIdol — AI Resume Tailor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIdol — AI Resume Tailor That Gets You Hired",
    description:
      "Tailor your resume to any job in seconds. Beat ATS filters and land more interviews.",
    images: ["/opengraph-image"],
    site: "@resumeidol",
    creator: "@resumeidol",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "ResumeIdol",
      description:
        "AI-powered resume tailor and job search platform. Tailor your resume for every job and beat ATS filters.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "ResumeIdol",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
      sameAs: [],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "ResumeIdol",
      url: BASE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Free Plan",
          description: "3 resume tailors and 50 job searches per month",
        },
        {
          "@type": "Offer",
          price: "18",
          priceCurrency: "USD",
          name: "Pro Plan",
          description: "Unlimited resume tailors and job searches",
          billingIncrement: "P1M",
        },
      ],
      featureList: [
        "AI-powered resume tailoring",
        "ATS score optimization",
        "Job search across 500+ boards",
        "Keyword gap analysis",
        "DOCX and PDF resume download",
      ],
      description:
        "ResumeIdol uses AI to tailor your resume for every job application, optimizing for ATS systems and recruiter appeal.",
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does ResumeIdol tailor my resume?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ResumeIdol uses AI to analyze the job description and reframe your existing experience using the right keywords and language — without fabricating anything. It then gives you an estimated ATS match score before and after.",
          },
        },
        {
          "@type": "Question",
          name: "Will the tailored resume sound like me?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. ResumeIdol rewrites your resume using your existing experience as the foundation. It never invents skills or achievements — it repositions what you already have.",
          },
        },
        {
          "@type": "Question",
          name: "What ATS systems does ResumeIdol optimize for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ResumeIdol optimizes for major ATS platforms including Workday, Greenhouse, Lever, iCIMS, and Taleo.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download my tailored resume?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. You can download your tailored resume as a DOCX or PDF file directly from the tailor page.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
