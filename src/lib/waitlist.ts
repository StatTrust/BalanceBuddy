import { env } from "@/lib/env";
import { createSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase-server";

export async function hasWaitlistAccess(email: string | null | undefined) {
  if (!email || !hasSupabaseConfig() || !env.SUPABASE_SERVICE_ROLE_KEY) return false;

  const { data, error } = await createSupabaseAdminClient()
    .from("waitlist_entries")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("waitlist.access_check_failed", { message: error.message });
    return false;
  }

  return Boolean(data);
}
