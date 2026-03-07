import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Use the service-role key so we can write to user_plans without RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function upsertPlan(
  supabase: ReturnType<typeof getAdminClient>,
  email: string,
  plan: "pro" | "lifetime" | "starter" | "free",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  expiresAt?: Date | null
) {
  // Look up the Supabase user by email
  const { data: users, error: lookupErr } = await supabase
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .limit(1);

  // auth.users isn't directly queryable via PostgREST; use the admin API instead
  const { data: listResult, error: listErr } =
    await supabase.auth.admin.listUsers();

  if (listErr) {
    console.error("Failed to list users:", listErr);
    return;
  }

  const user = listResult.users.find((u) => u.email === email);
  if (!user) {
    console.warn(`Stripe webhook: no Supabase user found for email ${email}`);
    return;
  }

  const { error } = await supabase.from("user_plans").upsert(
    {
      user_id: user.id,
      plan,
      stripe_customer_id: stripeCustomerId ?? null,
      stripe_subscription_id: stripeSubscriptionId ?? null,
      plan_expires_at: expiresAt ? expiresAt.toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) console.error("upsertPlan error:", error);
  else console.log(`Set plan=${plan} for user ${user.id} (${email})`);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secret);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      // ── One-time payment (Lifetime) or new subscription (Pro) ────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email;
        const plan = (session.metadata?.plan ?? "pro") as "pro" | "lifetime" | "starter";
        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (email) {
          await upsertPlan(
            supabase,
            email,
            plan,
            customerId,
            subscriptionId ?? undefined,
            null // no expiry — subscription active or lifetime
          );
        }
        break;
      }

      // ── Subscription renewed ─────────────────────────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email;
        const customerId = invoice.customer as string | undefined;
        const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;

        if (email) {
          await upsertPlan(supabase, email, "pro", customerId, subscriptionId ?? undefined, null);
        }
        break;
      }

      // ── Subscription cancelled / expired ─────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Find the customer's email via Stripe API
        const stripe = new Stripe(secret);
        const customer = await stripe.customers.retrieve(customerId);
        const email = !customer.deleted ? customer.email : null;

        if (email) {
          await upsertPlan(supabase, email, "free", customerId, sub.id, null);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        // Don't revoke immediately — Stripe will retry. Log only.
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment failed for ${invoice.customer_email}`);
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
