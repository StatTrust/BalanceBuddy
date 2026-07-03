import { redirect } from "next/navigation";
import { Card, LinkButton, WellnessNotice } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getSubscriptionAccess } from "@/lib/billing";

export default async function SubscribePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await getSubscriptionAccess(user.id);
  if (access.active && env.WAITLIST_MODE !== "true") redirect("/app");

  if (env.WAITLIST_MODE === "true") {
    return (
      <main className="mx-auto grid min-h-screen max-w-xl content-center gap-4 px-4 py-10">
        <h1 className="text-3xl font-black text-ink">The beta is invite-first.</h1>
        <Card>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            We are not collecting payment yet. Join the waitlist, try the preview, and we will invite the first testers before turning on billing.
          </p>
          <WaitlistForm />
        </Card>
        <LinkButton href="/app" variant="secondary">Continue as tester</LinkButton>
        <WellnessNotice />
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-4 px-4 py-10">
      <h1 className="text-3xl font-black text-ink">Choose your founding beta plan</h1>
      <PricingCard title="Monthly" price="$8.99/mo" priceKey="monthly" />
      <PricingCard title="Annual" price="$59.99/yr" priceKey="annual" />
      {process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_SUBSCRIPTION_BYPASS === "true" ? (
        <form action="/api/dev-subscription-bypass" method="post">
          <button className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink">Use development bypass</button>
        </form>
      ) : null}
      <WellnessNotice />
    </main>
  );
}

function PricingCard({ title, price, priceKey }: { title: string; price: string; priceKey: string }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-xl font-black">{title}</h2><p className="text-sm text-slate-600">{price}</p></div>
        <form action="/api/create-checkout-session" method="post">
          <input type="hidden" name="plan" value={priceKey} />
          <button className="min-h-11 rounded-md bg-action px-4 py-2 text-sm font-semibold text-white">Checkout</button>
        </form>
      </div>
    </Card>
  );
}
