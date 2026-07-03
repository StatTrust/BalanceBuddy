import { NextResponse } from "next/server";
import { env, requireEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.redirect(new URL("/login", request.url));

  const form = await request.formData();
  const plan = String(form.get("plan"));
  const price = plan === "annual" ? env.STRIPE_ANNUAL_PRICE_ID : env.STRIPE_MONTHLY_PRICE_ID;
  if (!price) return NextResponse.json({ error: "Stripe price is not configured." }, { status: 500 });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/app`,
    cancel_url: `${requireEnv("NEXT_PUBLIC_APP_URL")}/subscribe`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
