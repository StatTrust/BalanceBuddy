import { NextResponse } from "next/server";
import { z } from "zod";
import { hasWaitlistAccess } from "@/lib/waitlist";

const loginSchema = z.object({
  email: z.string().email().max(180),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const eligible = await hasWaitlistAccess(parsed.data.email);
  return NextResponse.json({ eligible });
}
