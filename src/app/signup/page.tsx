"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, WellnessNotice } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else router.push("/onboarding");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-5 px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-action">Meal Coach</Link>
      <h1 className="text-3xl font-black text-ink">Create account</h1>
      <Field label="Email"><input className="min-h-11 rounded-md border px-3" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" /></Field>
      <Field label="Password" hint="Use at least 8 characters."><input className="min-h-11 rounded-md border px-3" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" /></Field>
      <Button onClick={signup} disabled={loading}>{loading ? "Creating..." : "Create tester account"}</Button>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <a className="text-sm font-semibold text-action" href="/login">I already have an account</a>
      <WellnessNotice />
    </main>
  );
}
