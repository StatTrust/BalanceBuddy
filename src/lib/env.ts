import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MEAL_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_COACH_MODEL: z.string().default("gpt-4.1-mini"),
  MEAL_ANALYSIS_TIMEOUT_MS: z.coerce.number().int().positive().default(55000),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_ANNUAL_PRICE_ID: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  MEAL_SCANS_PER_DAY: z.coerce.number().int().positive().default(8),
  COACH_MESSAGES_PER_DAY: z.coerce.number().int().positive().default(30),
  ADMIN_EMAILS: z.string().default(""),
  ENABLE_DEV_SUBSCRIPTION_BYPASS: z.string().default("false"),
  GHL_WEBHOOK_URL: z.string().url().optional(),
  WAITLIST_MODE: z.string().default("true"),
});

export const env = envSchema.parse(process.env);

export function requireEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return String(value);
}

export const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
