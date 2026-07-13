import { NextResponse } from "next/server";
import { analyzeMealWithAI } from "@/lib/openai";
import { env } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase-server";
import { hasWaitlistAccess } from "@/lib/waitlist";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 6 * 1024 * 1024;
const maxBase64Bytes = 12 * 1024 * 1024;

export const maxDuration = 60;

export async function POST(request: Request) {
  const started = Date.now();
  if (!env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "The free meal check will be available after OpenAI is connected. Join the waitlist and we will invite you first." },
      { status: 503 }
    );
  }

  const isLocalTest = new URL(request.url).hostname === "localhost";
  const cookieHeader = request.headers.get("cookie") || "";
  const supabase = hasSupabaseConfig() ? await createSupabaseServerClient() : null;
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const unlocked = await hasWaitlistAccess(user?.email);
  const used = cookieHeader.includes("free_meal_preview_used=true");
  if (used && !unlocked && !isLocalTest) {
    return NextResponse.json({ error: "You already used your free meal check. Join the waitlist for early access." }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const file = form.get("image");
    const context = String(form.get("context") || "").slice(0, 800);
    const goal = String(form.get("goal") || "General eating improvement").slice(0, 160);

    if (!(file instanceof File)) return NextResponse.json({ error: "Add a meal photo first." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 400 });
    if (file.size > maxBytes) return NextResponse.json({ error: "Use a photo under 6MB for the free check." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isSupportedImageBuffer(buffer, file.type)) {
      return NextResponse.json({ error: "That file does not look like a valid JPG, PNG, or WebP image." }, { status: 400 });
    }

    const imageUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    if (imageUrl.length > maxBase64Bytes) {
      return NextResponse.json({ error: "That image is still too large. Try a smaller photo." }, { status: 400 });
    }

    const analysis = await analyzeMealWithAI({
      imageUrl,
      context,
      profileSummary: `Landing page free preview. User goal: ${goal}. No account profile yet.`,
    });

    await logFreePreviewEvent("free_meal_preview.completed", {
      goal,
      fileType: file.type,
      fileSize: file.size,
      mealName: analysis.mealName,
      mealScore: analysis.mealScore,
      calorieEstimate: analysis.calorieEstimate,
      proteinGrams: analysis.estimatedMacrosGrams.protein,
      confidence: analysis.confidence,
      durationMs: Date.now() - started,
    });

    const response = NextResponse.json({ analysis });
    if (!isLocalTest && !unlocked) {
      response.cookies.set("free_meal_preview_used", "true", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    await logFreePreviewEvent("free_meal_preview.failed", { message });
    console.error("free_meal_preview.failed", { message });
    return NextResponse.json(
      { error: "That meal check did not finish. Try a clear JPG or PNG photo with the plate fully visible." },
      { status: 500 }
    );
  }
}

function isSupportedImageBuffer(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

async function logFreePreviewEvent(eventName: string, metadata: Record<string, unknown>) {
  if (!hasSupabaseConfig() || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    await createSupabaseAdminClient().from("app_events").insert({
      event_name: eventName,
      metadata,
    });
  } catch (error) {
    console.error("free_meal_preview.log_failed", error);
  }
}
