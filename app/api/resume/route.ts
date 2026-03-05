import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET — load saved resume for current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ resume: null });

  const { data } = await supabase
    .from("user_resumes")
    .select("resume_text, file_name, updated_at")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ resume: data ?? null });
}

// POST — save/overwrite resume for current user
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resume_text, file_name } = await request.json();
  if (!resume_text?.trim()) {
    return NextResponse.json({ error: "resume_text is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_resumes")
    .upsert(
      { user_id: user.id, resume_text, file_name: file_name ?? null, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
