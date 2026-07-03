import { createSupabaseServerClient } from "@/lib/supabase";
import { env } from "@/lib/env";

const activeStatuses = new Set(["active", "trialing"]);

export async function getSubscriptionAccess(userId: string) {
  if (env.WAITLIST_MODE === "true") return { active: true, status: "waitlist_mode" };

  if (process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_SUBSCRIPTION_BYPASS === "true") {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
    if (data?.status === "dev_bypass") return { active: true, status: "dev_bypass" };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("subscriptions").select("status").eq("user_id", userId).maybeSingle();
  const status = data?.status ?? "none";
  return { active: activeStatuses.has(status), status };
}
