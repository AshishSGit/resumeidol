import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";

export const runtime = "nodejs";

type LineType =
  | "blank"
  | "name"
  | "contact"
  | "role-tagline"
  | "section-header"
  | "job-title"
  | "date-location"
  | "bullet"
  | "body";

function classifyLine(line: string, idx: number, firstIdx: number): LineType {
  const t = line.trim();
  if (!t) return "blank";

  const hasYear    = /\b(19|20)\d{2}\b/.test(t);
  const hasPipe    = t.includes("|");
  const hasEmail   = /@/.test(t);
  const hasPhone   = /[\+]?\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/.test(t);

  if (idx === firstIdx) return "name";

  // Contact line: has email or phone number
  if (hasEmail || hasPhone) return "contact";

  // Location | Date line: pipe + 4-digit year
  if (hasPipe && hasYear) return "date-location";

  // Section header: all-caps, short, no pipe
  if (
    !hasPipe &&
    t.length >= 4 &&
    t.length <= 60 &&
    /^[A-Z][A-Z\s&\/\-—–]{3,}$/.test(t)
  )
    return "section-header";

  // Role tagline: near the top, before first section header area, no pipe
  if (idx <= firstIdx + 4 && !hasPipe && t.length < 120) return "role-tagline";

  // Job title | Company: pipe, no year, no email, appears after the header block
  if (hasPipe && !hasYear && !hasEmail && idx > firstIdx + 3) return "job-title";

  // Explicit bullet
  if (/^[-•*·]\s/.test(t)) return "bullet";

  return "body";
}

function buildParagraph(line: string, type: LineType): Paragraph {
  const t = line.trim();

  switch (type) {
    case "blank":
      return new Paragraph({ text: "", spacing: { after: 80 } });

    case "name":
      return new Paragraph({
        children: [new TextRun({ text: t, bold: true, size: 52, color: "111111", font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      });

    case "contact":
      return new Paragraph({
        children: [new TextRun({ text: t, size: 20, color: "444444", font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      });

    case "role-tagline":
      return new Paragraph({
        children: [new TextRun({ text: t, size: 21, italics: true, color: "333333", font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      });

    case "section-header":
      return new Paragraph({
        children: [new TextRun({ text: t, bold: true, size: 22, color: "111111", font: "Calibri", allCaps: true })],
        spacing: { before: 300, after: 100 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "AAAAAA" },
        },
      });

    case "job-title": {
      // Split "Title | Company" → bold title + separator + company
      const parts = t.split("|").map((p) => p.trim());
      const runs: TextRun[] = [];
      parts.forEach((part, i) => {
        if (i > 0) runs.push(new TextRun({ text: "  |  ", size: 22, color: "888888", font: "Calibri" }));
        runs.push(
          i === 0
            ? new TextRun({ text: part, bold: true, size: 22, color: "111111", font: "Calibri" })
            : new TextRun({ text: part, bold: true, size: 22, color: "333333", font: "Calibri" })
        );
      });
      return new Paragraph({ children: runs, spacing: { before: 180, after: 40 } });
    }

    case "date-location":
      return new Paragraph({
        children: [new TextRun({ text: t, size: 20, italics: true, color: "555555", font: "Calibri" })],
        spacing: { after: 100 },
      });

    case "bullet":
      return new Paragraph({
        children: [new TextRun({ text: t.replace(/^[-•*·]\s*/, ""), size: 20, color: "222222", font: "Calibri" })],
        bullet: { level: 0 },
        spacing: { after: 60 },
      });

    default: // "body"
      return new Paragraph({
        children: [new TextRun({ text: t, size: 20, color: "222222", font: "Calibri" })],
        spacing: { after: 60 },
      });
  }
}

function parseResumeToParagraphs(text: string): Paragraph[] {
  const lines = text.split(/\r?\n/);
  const firstIdx = lines.findIndex((l) => l.trim());

  return lines.map((line, idx) => {
    const type = classifyLine(line, idx, firstIdx);
    return buildParagraph(line, type);
  });
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, fileName = "resume" } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: "resumeText is required." }, { status: 400 });
    }

    const paragraphs = parseResumeToParagraphs(resumeText as string);

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 900, right: 900 },
            },
          },
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeName = String(fileName).replace(/[^a-zA-Z0-9\-_]/g, "-").slice(0, 80);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeName}.docx"`,
      },
    });
  } catch (err) {
    console.error("DOCX generation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate DOCX: ${message}` }, { status: 500 });
  }
}
