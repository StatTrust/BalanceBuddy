import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { analyzeMealWithAI } from "@/lib/openai";
import { getSubscriptionAccess } from "@/lib/billing";
import { sendLifecycleEvent } from "@/lib/ghl";
import { summarizeProfile } from "@/lib/profile";
import { enforceDailyLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const started = Date.now();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const access = await getSubscriptionAccess(user.id, user.email);
  if (!access.active) return NextResponse.json({ error: "Join the waitlist to use meal checks." }, { status: 403 });

  const limit = await enforceDailyLimit("meal", user.id);
  if (!limit.success) return NextResponse.json({ error: "You reached today's meal check limit." }, { status: 429 });

  const form = await request.formData();
  const file = form.get("image");
  const context = String(form.get("context") || "").slice(0, 1000);
  if (!(file instanceof File)) return NextResponse.json({ error: "Add a supported meal image." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "Image is too large. Use a photo under 8MB." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/${randomUUID()}.${extension}`;

  const upload = await supabase.storage.from("meal-photos").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ error: "Could not upload the meal image." }, { status: 500 });

  const signed = await supabase.storage.from("meal-photos").createSignedUrl(path, 60);
  if (signed.error || !signed.data?.signedUrl) return NextResponse.json({ error: "Could not prepare the image for analysis." }, { status: 500 });

  try {
    const analysis = await analyzeMealWithAI({
      imageUrl: signed.data.signedUrl,
      context,
      profileSummary: summarizeProfile(profile),
    });
    const { data: meal, error } = await supabase.from("meals").insert({
      user_id: user.id,
      image_path: path,
      context,
      analysis,
      meal_name: analysis.mealName,
      calorie_min: analysis.calorieEstimate.minimum,
      calorie_max: analysis.calorieEstimate.maximum,
      protein_grams: analysis.estimatedMacrosGrams.protein,
      meal_score: analysis.mealScore,
      confidence: analysis.confidence,
      duration_ms: Date.now() - started,
    }).select("id").single();
    if (error) throw error;
    await supabase.from("app_events").insert({ user_id: user.id, event_name: "meal_analysis.completed", metadata: { durationMs: Date.now() - started } });
    await sendLifecycleEvent("first_meal.completed", { userId: user.id });
    return NextResponse.json({ mealId: meal.id });
  } catch (error) {
    await supabase.from("app_events").insert({ user_id: user.id, event_name: "meal_analysis.failed", metadata: { message: error instanceof Error ? error.message : "unknown" } });
    return NextResponse.json({ error: "Meal analysis failed. Try a clearer photo or shorter notes." }, { status: 500 });
  }
}
