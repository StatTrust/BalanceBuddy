import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null;

export async function enforceDailyLimit(kind: "meal" | "coach", userId: string) {
  if (!redis) return { success: true, remaining: null };
  const limit = kind === "meal" ? env.MEAL_SCANS_PER_DAY : env.COACH_MESSAGES_PER_DAY;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, "1 d"),
    analytics: true,
    prefix: `limit:${kind}`,
  });
  return limiter.limit(userId);
}
