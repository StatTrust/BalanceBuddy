"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function WaitlistForm({
  triedFreeScan = false,
  onJoined,
  compact = false,
  source = "landing_page",
  buttonLabel = "Join the Waitlist",
}: {
  triedFreeScan?: boolean;
  onJoined?: () => void;
  compact?: boolean;
  source?: string;
  buttonLabel?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    primaryGoal: "Lose fat",
    interestLevel: "I want an invite",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    let spotSaved = false;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          source,
          triedFreeScan,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMessage(body.error || "Could not save your spot yet.");
        return;
      }
      spotSaved = true;

      try {
        window.sessionStorage.setItem("mealCoachWaitlistFormCompleted", "true");
      } catch {
        // Storage can be unavailable in private browsing; the in-memory event still unlocks the result.
      }
      window.dispatchEvent(new Event("mealCoachWaitlistFormCompleted"));
      onJoined?.();

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: form.email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { name: form.name },
        },
      });

      if (error) {
        console.error("waitlist.login_email_failed", { message: error.message, status: error.status });
        setMessage(loginEmailFailureMessage(error.message, triedFreeScan));
        return;
      }

      setMessage("You're on the waitlist. Check your email and tap the secure link to activate unlimited access.");
    } catch (error) {
      console.error("waitlist.account_creation_failed", error);
      setMessage(
        spotSaved
          ? savedSpotEmailFailureMessage(triedFreeScan)
          : "Could not create your waitlist account yet. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <Field label="Name">
          <input className="min-h-11 rounded-md border px-3" value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required />
        </Field>
        <Field label="Email">
          <input className="min-h-11 rounded-md border px-3" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required />
        </Field>
      </div>
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <Field label="Phone" hint="Optional">
          <input className="min-h-11 rounded-md border px-3" type="tel" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} autoComplete="tel" />
        </Field>
        <Field label="Main goal">
          <select className="min-h-11 rounded-md border px-3" value={form.primaryGoal} onChange={(e) => update("primaryGoal", e.target.value)}>
            {["Lose fat", "Maintain weight", "Build muscle", "Improve eating habits", "Improve energy"].map((goal) => <option key={goal}>{goal}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-3">
        <Field label="Interest">
          <select className="min-h-11 rounded-md border px-3" value={form.interestLevel} onChange={(e) => update("interestLevel", e.target.value)}>
            {["I want an invite", "I would pay if it works", "Just curious"].map((level) => <option key={level}>{level}</option>)}
          </select>
        </Field>
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Creating account..." : buttonLabel}</Button>
      {message ? <p className="rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
    </form>
  );
}

function loginEmailFailureMessage(message: string, triedFreeScan: boolean) {
  if (message.toLowerCase().includes("rate") || message.toLowerCase().includes("too many")) {
    return triedFreeScan
      ? "Your spot is saved and your meal result is unlocked. Too many login emails were requested, so wait a minute and then use Waitlist login."
      : "Your spot is saved. Too many login emails were requested, so wait a minute and then use Waitlist login.";
  }

  return savedSpotEmailFailureMessage(triedFreeScan);
}

function savedSpotEmailFailureMessage(triedFreeScan: boolean) {
  return triedFreeScan
    ? "Your spot is saved and your meal result is unlocked, but the login email could not be sent. Use Waitlist login to try again."
    : "Your spot is saved, but the login email could not be sent. Use Waitlist login to try again.";
}
