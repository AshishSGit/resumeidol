import { NextResponse } from "next/server";

// Strips HTML tags and cleans up whitespace
function extractText(html: string): string {
  return html
    // Remove script/style blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    // Replace block-level tags with newlines
    .replace(/<\/(p|div|li|h[1-6]|section|article|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    // Strip all remaining tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse excess whitespace / blank lines
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Heuristic: find the longest meaningful block of text that looks like a JD
function extractJobDescription(text: string): string {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 40);

  if (paragraphs.length === 0) return text.slice(0, 4000);

  // Score each paragraph by length + job-related keywords
  const JD_KEYWORDS = /\b(responsibilities|requirements|qualifications|experience|skills|about|role|position|team|benefits|salary|apply|candidate|bachelor|degree|years|remote|hybrid|full.?time|part.?time)\b/i;

  const scored = paragraphs.map((p, i) => ({
    text: p,
    score: p.length + (JD_KEYWORDS.test(p) ? 500 : 0) + (i > 2 ? 100 : 0),
  }));

  // Find the highest-scoring anchor paragraph, then include surrounding context
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const anchorText = sorted[0].text;
  const anchorIdx = paragraphs.indexOf(anchorText);

  // Take up to 30 paragraphs around the anchor
  const start = Math.max(0, anchorIdx - 3);
  const end = Math.min(paragraphs.length, anchorIdx + 27);
  const result = paragraphs.slice(start, end).join("\n\n");

  return result.slice(0, 6000);
}

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Reject non-HTTP URLs
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // LinkedIn requires auth — skip gracefully
  if (/linkedin\.com/i.test(url)) {
    return NextResponse.json(
      { error: "LinkedIn requires sign-in — please copy and paste the job description directly." },
      { status: 422 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch that page (${response.status}). Try copying the job description manually.` },
        { status: 422 }
      );
    }

    const html = await response.text();
    const text = extractText(html);
    const jd = extractJobDescription(text);

    if (jd.length < 100) {
      return NextResponse.json(
        { error: "Couldn't extract a job description from that page. Please paste it manually." },
        { status: 422 }
      );
    }

    // Detect gated/paywalled pages that show Lorem ipsum placeholder content
    if (/lorem ipsum/i.test(jd)) {
      return NextResponse.json(
        { error: "This job posting requires login to view the full description. Please paste the job description manually." },
        { status: 422 }
      );
    }

    // Detect pages with too little real job content (nav/footer junk only)
    const wordCount = jd.split(/\s+/).filter(Boolean).length;
    if (wordCount < 40) {
      return NextResponse.json(
        { error: "Couldn't find enough job details on that page. Please paste the description manually." },
        { status: 422 }
      );
    }

    // Try to extract job title and company from <title> tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    return NextResponse.json({ text: jd, pageTitle });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("timeout") || msg.includes("abort")) {
      return NextResponse.json({ error: "Page took too long to load. Please paste the job description manually." }, { status: 422 });
    }
    return NextResponse.json({ error: "Could not fetch that URL. Please paste the job description manually." }, { status: 422 });
  }
}
