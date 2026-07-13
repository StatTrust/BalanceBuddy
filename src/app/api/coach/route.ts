import { NextResponse } from "next/server";
import { z } from "zod";
import { askCoach } from "@/lib/openai";
import { getSubscriptionAccess } from "@/lib/billing";
import { summarizeProfile } from "@/lib/profile";
import { enforceDailyLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase";

const inputSchema = z.object({
  question: z.string().min(1).max(600),
  mealId: z.string().uuid().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const access = await getSubscriptionAccess(user.id, user.email);
  if (!access.active) return NextResponse.json({ error: "Join the waitlist to use the coach." }, { status: 403 });
  const limit = await enforceDailyLimit("coach", user.id);
  if (!limit.success) return NextResponse.json({ error: "You reached today's coach message limit." }, { status: 429 });

  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Ask a shorter question." }, { status: 400 });

  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [{ data: profile }, { data: meals }, { data: weights }, { data: currentMeal }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("meals").select("meal_name, calorie_min, calorie_max, protein_grams, meal_score, created_at").eq("user_id", user.id).gte("created_at", since).order("created_at", { ascending: false }).limit(12),
    supabase.from("weight_entries").select("weight_lbs, logged_at").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(8),
    parsed.data.mealId ? supabase.from("meals").select("analysis").eq("user_id", user.id).eq("id", parsed.data.mealId).maybeSingle() : Promise.resolve({ data: null }),
  ]);

  const context = [
    `Profile: ${summarizeProfile(profile)}`,
    `Recent meals: ${JSON.stringify(meals ?? [])}`,
    `Recent weights: ${JSON.stringify(weights ?? [])}`,
    currentMeal ? `Current meal analysis: ${JSON.stringify(currentMeal.analysis)}` : null,
  ].filter(Boolean).join("\n");

  const answer = await askCoach({ question: parsed.data.question, context });
  await supabase.from("coach_messages").insert([
    { user_id: user.id, role: "user", content: parsed.data.question, meal_id: parsed.data.mealId ?? null },
    { user_id: user.id, role: "assistant", content: answer, meal_id: parsed.data.mealId ?? null },
  ]);
  return NextResponse.json({ answer });
}
