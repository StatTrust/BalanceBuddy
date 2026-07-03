"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field, WellnessNotice } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setMessage(error.message);
    else router.push("/app");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-5 px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-action">Meal Coach</Link>
      <h1 className="text-3xl font-black text-ink">Log in</h1>
      <Field label="Email"><input className="min-h-11 rounded-md border px-3" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" /></Field>
      <Field label="Password"><input className="min-h-11 rounded-md border px-3" value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" /></Field>
      <Button onClick={login} disabled={loading}>{loading ? "Checking..." : "Log in"}</Button>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <div className="flex justify-between text-sm">
        <a className="font-semibold text-action" href="/signup">Create account</a>
        <a className="font-semibold text-slate-600" href="/reset-password">Reset password</a>
      </div>
      <WellnessNotice />
    </main>
  );
}
