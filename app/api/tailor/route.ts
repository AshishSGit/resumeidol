import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = `You are an elite career coach and ATS optimization expert.
You help job seekers tailor their resumes to maximize both ATS pass rates AND human appeal.

Rules you always follow:
1. Never fabricate experience, skills, or achievements the candidate doesn't have
2. Reposition and reframe existing experience to match the job — don't invent new experience
3. Use keywords from the job description naturally in context, not as a keyword dump
4. Keep the resume authentically human — it must impress a recruiter, not just a bot
5. Quantify achievements wherever possible
6. Use strong action verbs that match the role's seniority level
7. The professional summary should be laser-focused on this specific role
8. NEVER use horizontal rules (---) or markdown dividers anywhere in the resume. Use plain section headers in ALL CAPS (e.g. PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION) with no decorative lines
9. NEVER add placeholder contact fields like "LinkedIn: [linkedin profile]" or "GitHub: [github profile]". Only include LinkedIn, GitHub, or portfolio URLs if they were explicitly present in the candidate's original resume`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobTitle, jobDescription, company } = body;

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required." },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured." },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userPrompt = `Job to apply for:
Title: ${jobTitle}
Company: ${company}
Description:
${jobDescription}

---
Candidate's current resume:
${resumeText}

---
Please provide:

1. TAILORED_RESUME - The complete rewritten resume optimized for this specific role. Preserve all real experience but reframe it. Include a targeted professional summary.

2. KEYWORDS_ADDED - A bullet list of keywords/phrases from the job description that were naturally incorporated

3. CHANGES_MADE - A bullet list of the key changes made and why

4. ATS_SCORE_BEFORE - Estimated ATS match score for original resume (0-100)

5. ATS_SCORE_AFTER - Estimated ATS match score for tailored resume (0-100)

6. GAPS - Any skills or experience from the job description that the candidate doesn't have (be honest — don't add these, just flag them)

Format your response with these exact section headers.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Claude sometimes wraps headers in **bold** or ## markdown — strip those
    const text = raw.replace(/\*\*(.*?)\*\*/g, "$1").replace(/^#{1,3} /gm, "");

    // Flexible section extractor — matches "SECTION_NAME" regardless of surrounding formatting
    const extract = (key: string, nextKey?: string): string => {
      // Match the key with optional number prefix and surrounding punctuation
      const startRe = new RegExp(`(?:^|\\n)[^\\n]*${key}[^\\n]*\\n`, "i");
      const startMatch = startRe.exec(text);
      if (!startMatch) return "";
      const contentStart = startMatch.index + startMatch[0].length;

      let end = text.length;
      if (nextKey) {
        const endRe = new RegExp(`(?:^|\\n)[^\\n]*${nextKey}[^\\n]*\\n`, "i");
        const endMatch = endRe.exec(text.slice(contentStart));
        if (endMatch) end = contentStart + endMatch.index;
      }
      return text.slice(contentStart, end).trim();
    };

    // Strip markdown code fences GPT-4o sometimes wraps the resume in
    const stripFences = (s: string) =>
      s.replace(/^```[\w]*\n?/gm, "").replace(/^```$/gm, "").trim();

    // Strip horizontal rules (---, ———, ═══, etc.) that Claude sometimes adds
    const stripHrules = (s: string) =>
      s.replace(/^[ \t]*[-─═─*]{3,}[ \t]*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();

    const tailoredResume  = stripHrules(stripFences(extract("TAILORED_RESUME",  "KEYWORDS_ADDED")));
    const keywordsAdded   = extract("KEYWORDS_ADDED",   "CHANGES_MADE");
    const changesMade     = extract("CHANGES_MADE",     "ATS_SCORE_BEFORE");
    const atsScoreBefore  = extract("ATS_SCORE_BEFORE", "ATS_SCORE_AFTER");
    const atsScoreAfter   = extract("ATS_SCORE_AFTER",  "GAPS");
    const gaps            = extract("GAPS");

    const parseScore = (s: string) => {
      const match = s.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };

    return NextResponse.json({
      tailoredResume,
      keywordsAdded,
      changesMade,
      atsScoreBefore: parseScore(atsScoreBefore),
      atsScoreAfter:  parseScore(atsScoreAfter),
      gaps,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error("Tailor API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to tailor resume: ${message}` },
      { status: 500 }
    );
  }
}
