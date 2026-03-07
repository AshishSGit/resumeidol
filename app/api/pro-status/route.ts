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

  if (data) {
    // For subscriptions, check if it hasn't expired
    if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date()) {
      return NextResponse.json({ isPro: false, plan: "free" });
    }
    if (data.plan === "pro" || data.plan === "lifetime") {
      return NextResponse.json({ isPro: true, plan: data.plan });
    }
    if (data.plan === "starter") {
      return NextResponse.json({ isPro: false, plan: "starter" });
    }
  }

  return NextResponse.json({ isPro: false, plan: "free" });
}
