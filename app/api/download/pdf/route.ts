import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

function isHeader(t: string) {
  return /^[A-Z][A-Z\s&\/\-—–]{3,}$/.test(t) && t.length >= 4 && t.length <= 60;
}

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobTitle, company } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: "resumeText is required." }, { status: 400 });
    }

    const buffer = await new Promise<Buffer<ArrayBuffer>>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "LETTER", autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const lines = (resumeText as string).split(/\r?\n/);
      const firstIdx = lines.findIndex((l) => l.trim());
      const W = doc.page.width - 100; // usable width

      lines.forEach((raw, idx) => {
        const t = raw.trim();

        if (!t) {
          doc.moveDown(0.35);
          return;
        }

        // ── Name ───────────────────────────────────────────────────────────
        if (idx === firstIdx) {
          doc.fontSize(22).font("Helvetica-Bold").fillColor("#111111").text(t, 50, doc.y, { width: W, align: "center" });
          return;
        }

        // ── Contact: has email or phone ────────────────────────────────────
        if (/@/.test(t) || /[\+]?\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/.test(t)) {
          doc.fontSize(9.5).font("Helvetica").fillColor("#555555").text(t, 50, doc.y, { width: W, align: "center" });
          return;
        }

        // ── Role tagline: near top, short, no pipe ─────────────────────────
        if (idx <= firstIdx + 4 && !t.includes("|") && t.length < 120 && !isHeader(t)) {
          doc.fontSize(10).font("Helvetica-Oblique").fillColor("#333333").text(t, 50, doc.y, { width: W, align: "center" });
          doc.moveDown(0.6);
          return;
        }

        // ── Section header ─────────────────────────────────────────────────
        if (isHeader(t)) {
          doc.moveDown(0.6);
          doc.fontSize(10.5).font("Helvetica-Bold").fillColor("#111111").text(t, 50, doc.y, { width: W });
          const lineY = doc.y + 2;
          doc.moveTo(50, lineY).lineTo(50 + W, lineY).strokeColor("#AAAAAA").lineWidth(0.5).stroke();
          doc.moveDown(0.4);
          return;
        }

        // ── Date/location: has | and 4-digit year ─────────────────────────
        if (t.includes("|") && /\b(19|20)\d{2}\b/.test(t)) {
          doc.fontSize(9.5).font("Helvetica-Oblique").fillColor("#666666").text(t, 50, doc.y, { width: W });
          doc.moveDown(0.2);
          return;
        }

        // ── Job title: has | no year ───────────────────────────────────────
        if (t.includes("|") && !/\b(19|20)\d{2}\b/.test(t) && !/@/.test(t) && idx > firstIdx + 3) {
          doc.moveDown(0.3);
          doc.fontSize(10.5).font("Helvetica-Bold").fillColor("#222222").text(t, 50, doc.y, { width: W });
          return;
        }

        // ── Bullet ─────────────────────────────────────────────────────────
        if (/^[-•*·]\s/.test(t)) {
          doc.fontSize(10).font("Helvetica").fillColor("#222222").text(
            "•  " + t.replace(/^[-•*·]\s*/, ""),
            65, doc.y,
            { width: W - 15 }
          );
          doc.moveDown(0.1);
          return;
        }

        // ── Body ───────────────────────────────────────────────────────────
        doc.fontSize(10).font("Helvetica").fillColor("#222222").text(t, 50, doc.y, { width: W });
        doc.moveDown(0.1);
      });

      doc.end();
    });

    const baseName = `${jobTitle || "resume"}-${company || "resumeidol"}`;
    const safeName = baseName.replace(/[^a-zA-Z0-9\-_]/g, "-").slice(0, 80);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate PDF: ${message}` }, { status: 500 });
  }
}
