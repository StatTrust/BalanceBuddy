import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasWaitlistAccess } from "@/lib/waitlist";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && await hasWaitlistAccess(user.email)) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
      await supabase.auth.signOut();
    }
  }

  return NextResponse.redirect(new URL("/login?error=invalid-link", url.origin));
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/app/meal/new";
  return value;
}
