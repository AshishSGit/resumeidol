import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";

    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      // DOCX → plain text via mammoth
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // PDF → plain text via pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import("pdf-parse")) as any;
      const data = await (pdfParse.default ?? pdfParse)(buffer);
      text = data.text;
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    // Clean up extra whitespace
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from file. Please paste your resume below." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, wordCount: text.split(/\s+/).filter(Boolean).length });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse file. Please paste your resume text below." },
      { status: 500 }
    );
  }
}
