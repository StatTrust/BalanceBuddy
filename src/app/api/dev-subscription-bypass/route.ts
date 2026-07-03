import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_SUBSCRIPTION_BYPASS !== "true") {
    redirect("/subscribe");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await supabase.from("subscriptions").upsert({
    user_id: user.id,
    status: "dev_bypass",
    updated_at: new Date().toISOString(),
  });
  redirect("/app");
}
