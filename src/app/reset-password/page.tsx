"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function reset() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setMessage(error ? error.message : "Check your email for the reset link.");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-5 px-4">
      <h1 className="text-3xl font-black text-ink">Reset password</h1>
      <Field label="Email"><input className="min-h-11 rounded-md border px-3" value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></Field>
      <Button onClick={reset}>Send reset link</Button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </main>
  );
}
