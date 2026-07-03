import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { env, requireEnv } from "@/lib/env";

export const mealAnalysisSchema = z.object({
  mealName: z.string().min(1).max(120),
  detectedFoods: z.array(z.object({
    name: z.string().min(1).max(80),
    estimatedPortion: z.string().min(1).max(120),
  })).min(1).max(20),
  calorieEstimate: z.object({
    minimum: z.number().int().min(0).max(5000),
    maximum: z.number().int().min(0).max(6000),
  }).refine((v) => v.maximum >= v.minimum, "maximum must be >= minimum"),
  estimatedMacrosGrams: z.object({
    protein: z.number().min(0).max(400),
    carbohydrates: z.number().min(0).max(800),
    fat: z.number().min(0).max(400),
    fiber: z.number().min(0).max(150).nullable(),
  }),
  mealScore: z.number().int().min(1).max(10),
  confidence: z.enum(["low", "medium", "high"]),
  biggestIssue: z.string().min(1).max(280),
  betterMove: z.string().min(1).max(280),
  coachTakeaway: z.string().min(1).max(420),
  assumptions: z.array(z.string().min(1).max(180)).min(1).max(8),
  uncertaintyNotes: z.array(z.string().min(1).max(180)).min(1).max(8),
  clarificationQuestion: z.string().max(180).nullable(),
});

export type MealAnalysis = z.infer<typeof mealAnalysisSchema>;

export function getOpenAIClient() {
  return new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY"), timeout: env.MEAL_ANALYSIS_TIMEOUT_MS });
}

export async function analyzeMealWithAI(input: {
  imageUrl: string;
  context?: string;
  profileSummary: string;
}) {
  const client = getOpenAIClient();
  const response = await client.responses.parse({
    model: env.OPENAI_MEAL_MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a direct, practical general wellness meal coach for busy men. Estimate from the image and notes. Use plain English. Be nonjudgmental. Never diagnose, treat, or claim to prevent disease. Present calories as a range and explain uncertainty from sauces, oils, drinks, hidden ingredients, portion depth, or blurry images.",
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: `User profile and goal: ${input.profileSummary}\nMeal notes: ${input.context || "No extra notes."}` },
          { type: "input_image", image_url: input.imageUrl, detail: "auto" },
        ],
      },
    ],
    text: { format: zodTextFormat(mealAnalysisSchema, "meal_analysis") },
  });

  const parsed = response.output_parsed;
  return mealAnalysisSchema.parse(parsed);
}

export async function askCoach(input: {
  question: string;
  context: string;
}) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: env.OPENAI_COACH_MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a brief, practical, direct general wellness coach. Use available profile, meals, and weight data. Be honest when data is missing. No diagnosis, treatment, disease-prevention claims, fear, or shame.",
      },
      { role: "user", content: `${input.context}\n\nQuestion: ${input.question}` },
    ],
  });
  return response.output_text.trim();
}
