"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Field, WellnessNotice } from "@/components/ui";

const progress = ["Uploading your meal", "Identifying the food", "Estimating portions", "Building your recommendation"];

export default function NewMealPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!file) {
      setError("Add a meal photo first.");
      return;
    }
    setError("");
    setStatus(progress[0]);
    const form = new FormData();
    form.append("image", file);
    form.append("context", context);
    const tick = window.setInterval(() => {
      setStatus((current) => progress[Math.min(progress.indexOf(current) + 1, progress.length - 1)] || progress[1]);
    }, 9000);
    const res = await fetch("/api/meal-analysis", { method: "POST", body: form });
    window.clearInterval(tick);
    const body = await res.json();
    if (!res.ok) {
      setStatus("");
      setError(body.error || "Meal check failed.");
      return;
    }
    router.push(`/app/meals/${body.mealId}`);
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-black text-ink">Check a Meal</h1>
      <Card>
        <div className="grid gap-4">
          <Field label="Meal photo">
            <input className="rounded-md border bg-white p-3" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
          <Field label="Optional context" hint="Ingredients, portion size, restaurant, sauce, drink, or prep details.">
            <textarea className="min-h-28 rounded-md border px-3 py-2" value={context} onChange={(e) => setContext(e.target.value)} />
          </Field>
          <Button onClick={submit} disabled={Boolean(status)}>{status ? "Checking..." : "Analyze meal"}</Button>
          {status ? <p className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-action">{status}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>
      <WellnessNotice />
    </div>
  );
}
