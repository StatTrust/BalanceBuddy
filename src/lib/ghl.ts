import { env } from "@/lib/env";

export async function sendLifecycleEvent(event: string, payload: Record<string, unknown>) {
  if (!env.GHL_WEBHOOK_URL) return;
  try {
    await fetch(env.GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, ...payload }),
    });
  } catch (error) {
    console.error("ghl.webhook.failed", { event, error: error instanceof Error ? error.message : "unknown" });
  }
}
