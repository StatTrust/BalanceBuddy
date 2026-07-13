"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";

export function WaitlistForm({
  triedFreeScan = false,
  onJoined,
  compact = false,
}: {
  triedFreeScan?: boolean;
  onJoined?: () => void;
  compact?: boolean;
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

  async function submit() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        source: "landing_page",
        triedFreeScan,
      }),
    });
    const body = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(body.error || "Could not save your spot yet.");
      return;
    }
    window.localStorage.setItem("mealCoachWaitlistJoined", "true");
    window.dispatchEvent(new Event("mealCoachWaitlistJoined"));
    setMessage(body.stored ? "You're on the waitlist. We'll send early access details soon." : "You're on the list for this preview. Next step is connecting the database so we can collect real signups.");
    onJoined?.();
  }

  return (
    <div className="grid gap-3">
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <Field label="Name">
          <input className="min-h-11 rounded-md border px-3" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="min-h-11 rounded-md border px-3" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </Field>
      </div>
      <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
        <Field label="Phone" hint="Optional">
          <input className="min-h-11 rounded-md border px-3" type="tel" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} />
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
      <Button onClick={submit} disabled={loading}>{loading ? "Saving..." : "Join the Waitlist"}</Button>
      {message ? <p className="rounded-md bg-slate-100 p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
    </div>
  );
}
