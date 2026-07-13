import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLifecycleEvent } from "@/lib/ghl";
import { env } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase-server";
import { hasWaitlistAccess } from "@/lib/waitlist";

const waitlistSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(180),
  phoneNumber: z.string().max(40).optional(),
  primaryGoal: z.string().max(120).optional(),
  interestLevel: z.string().max(80).optional(),
  source: z.string().max(120).optional(),
  triedFreeScan: z.boolean().default(false),
});

export async function GET() {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ authenticated: false, waitlisted: false });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const waitlisted = await hasWaitlistAccess(user?.email);

  return NextResponse.json({ authenticated: Boolean(user), waitlisted });
}

export async function POST(request: Request) {
  const parsed = waitlistSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Add your name and a valid email." }, { status: 400 });
  }

  const entry = parsed.data;
  if (hasSupabaseConfig() && env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("waitlist_entries").upsert(
      {
        name: entry.name,
        email: entry.email.toLowerCase(),
        phone_number: entry.phoneNumber || null,
        primary_goal: entry.primaryGoal || null,
        interest_level: entry.interestLevel || null,
        source: entry.source || null,
        referral: null,
        tried_free_scan: entry.triedFreeScan,
      },
      { onConflict: "email" }
    );
    if (error) return NextResponse.json({ error: "Could not save your spot yet." }, { status: 500 });
  }

  await sendLifecycleEvent("waitlist.joined", {
    email: entry.email.toLowerCase(),
    primaryGoal: entry.primaryGoal,
    triedFreeScan: entry.triedFreeScan,
  });

  const response = NextResponse.json({
    ok: true,
    stored: Boolean(hasSupabaseConfig() && env.SUPABASE_SERVICE_ROLE_KEY),
  });
  response.cookies.set("waitlist_unlocked", "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
