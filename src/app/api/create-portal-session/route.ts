import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const { data: sub } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.stripe_customer_id) return NextResponse.json({ error: "No Stripe customer found yet." }, { status: 400 });
  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/app/settings`,
  });
  return NextResponse.json({ url: session.url });
}
