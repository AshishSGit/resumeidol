import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ isPro: false });

  const ownerEmail = process.env.OWNER_EMAIL;
  const isPro = !!ownerEmail && user.email === ownerEmail;

  return NextResponse.json({ isPro });
}
