import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireEnv } from "@/lib/env";
import { sendLifecycleEvent } from "@/lib/ghl";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, requireEnv("STRIPE_WEBHOOK_SECRET"));
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (userId && session.customer) {
      await admin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: String(session.customer),
        status: "checkout_completed",
        updated_at: new Date().toISOString(),
      });
    }
  }

  if (event.type.startsWith("customer.subscription.")) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;
    if (userId) {
      await admin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: String(subscription.customer),
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        price_id: subscription.items.data[0]?.price.id ?? null,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (subscription.status === "active") await sendLifecycleEvent("subscription.started", { userId });
      if (subscription.status === "canceled") await sendLifecycleEvent("subscription.canceled", { userId });
    }
  }

  return NextResponse.json({ received: true });
}
