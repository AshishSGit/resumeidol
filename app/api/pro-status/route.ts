import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ isPro: false, plan: "free" });

  // Owner bypass (unlimited)
  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail && user.email === ownerEmail) {
    return NextResponse.json({ isPro: true, plan: "lifetime" });
  }

  // Check Supabase user_plans table (set by Stripe webhook)
  const { data } = await supabase
    .from("user_plans")
    .select("plan, plan_expires_at")
    .eq("user_id", user.id)
    .single();

  if (data && (data.plan === "pro" || data.plan === "lifetime")) {
    // For subscriptions, check if it hasn't expired
    if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) {
      return NextResponse.json({ isPro: false, plan: "free" });
    }
    return NextResponse.json({ isPro: true, plan: data.plan });
  }

  return NextResponse.json({ isPro: false, plan: "free" });
}
