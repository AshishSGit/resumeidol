import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  // next must be a relative path to prevent open-redirect
  const rawNext = searchParams.get("next") ?? "/tailor";
  const next = rawNext.startsWith("/") ? rawNext : "/tailor";

  const supabase = await createClient();

  // Token hash flow (no PKCE cookie required — works from any origin)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      // Recovery tokens land on the update-password page
      const dest = type === "recovery" ? "/update-password" : next;
      return NextResponse.redirect(`https://resumeidol.com${dest}`);
    }
  }

  // PKCE code flow (OAuth + magic link fallback)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`https://resumeidol.com${next}`);
    }
  }

  return NextResponse.redirect(`https://resumeidol.com/signin?error=auth_failed`);
}
