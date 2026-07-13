"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button, Field, WellnessNotice } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);

  async function requestLoginLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setNeedsAccount(false);

    try {
      const eligibilityResponse = await fetch("/api/waitlist-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const eligibility = await eligibilityResponse.json();

      if (!eligibilityResponse.ok) {
        setMessage(eligibility.error || "Enter a valid email address.");
        return;
      }
      if (!eligibility.eligible) {
        setNeedsAccount(true);
        setMessage("That email is not on the waitlist yet.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Check your email and tap the secure login link. You will open directly in the meal analyzer.");
    } catch {
      setMessage("We could not send the login link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md content-center gap-5 px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-action">Meal Coach</Link>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-action">Private access</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Waitlist login</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Enter the email on your waitlist account. We will send one secure link to sign you in.</p>
      </div>
      <form className="grid gap-4" onSubmit={requestLoginLink}>
        <Field label="Email">
          <input
            className="min-h-11 rounded-md border px-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Button className="gap-2" type="submit" disabled={loading}>
          <Mail size={18} />
          {loading ? "Sending..." : "Email me a login link"}
        </Button>
      </form>
      {message ? <p className="rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
      <p className="text-sm text-slate-600">
        Not on the waitlist?{" "}
        <Link className="font-semibold text-action" href="/signup">
          {needsAccount ? "Create waitlist account" : "Create a waitlist account"}
        </Link>
      </p>
      <WellnessNotice />
    </main>
  );
}
