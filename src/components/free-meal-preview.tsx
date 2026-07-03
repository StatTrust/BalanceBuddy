"use client";

import { useEffect, useState } from "react";
import { Camera, Lock } from "lucide-react";
import { Button, Card, Field, WellnessNotice } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";
import type { MealAnalysis } from "@/lib/openai";

const progress = ["Preparing your photo", "Uploading your meal", "Identifying the food", "Estimating portions", "Building your recommendation"];
const maxPreviewBytes = 6 * 1024 * 1024;

export function FreeMealPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("Lose fat");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [used, setUsed] = useState(false);
  const [selectedFileLabel, setSelectedFileLabel] = useState("");
  const allowRepeatLocalTests = typeof window !== "undefined" && window.location.hostname === "localhost";

  useEffect(() => {
    if (window.location.hostname === "localhost") {
      window.localStorage.removeItem("mealCoachFreePreviewUsed");
      setUsed(false);
      return;
    }
    setUsed(window.localStorage.getItem("mealCoachFreePreviewUsed") === "true");
  }, []);

  async function submit() {
    if (!file) {
      setError("Add a meal photo first.");
      return;
    }
    setError("");
    setStatus(progress[0]);
    let tick: number | undefined;
    try {
      await waitForPaint();
      const image = await prepareImageForMealCheck(file);
      const form = new FormData();
      form.append("image", image);
      form.append("context", context);
      form.append("goal", goal);

      tick = window.setInterval(() => {
        setStatus((current) => progress[Math.min(progress.indexOf(current) + 1, progress.length - 1)] || progress[1]);
      }, 7000);
      setStatus(progress[1]);

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 70000);
      const res = await fetch("/api/free-meal-preview", { method: "POST", body: form, signal: controller.signal });
      window.clearTimeout(timeout);
      const body = await parseJsonResponse(res);

      if (!res.ok) {
        setError(body.error || "The free meal check is not ready yet. Try a clearer JPG or PNG photo.");
        if (res.status === 429) setUsed(true);
        return;
      }
      if (!allowRepeatLocalTests) {
        window.localStorage.setItem("mealCoachFreePreviewUsed", "true");
        setUsed(true);
      }
      setAnalysis(body.analysis);
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      const message = err instanceof Error ? err.message : "";
      setError(timedOut ? "That meal check took too long. Try a smaller or clearer photo." : message || "That image could not be checked. Try a standard JPG or PNG meal photo.");
    } finally {
      if (tick) window.clearInterval(tick);
      setStatus("");
    }
  }

  return (
    <section id="try-free" className="mx-auto grid max-w-6xl gap-5 px-4 py-8 md:grid-cols-[.9fr_1.1fr] md:items-start">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-action">Try it once free</p>
        <h2 className="mt-2 text-3xl font-black text-ink">Check one meal before joining.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Upload a meal photo, add quick context, and see the kind of practical feedback the app gives. After the free check, join the waitlist for early access.
        </p>
      </div>
      <Card>
        {!used && !analysis ? (
          <div className="grid gap-4">
            <Field label="Meal photo">
              <input
                className="rounded-md border bg-white p-3"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={(e) => {
                  const nextFile = e.target.files?.[0] ?? null;
                  setFile(nextFile);
                  setAnalysis(null);
                  setError("");
                  setSelectedFileLabel(nextFile ? `${nextFile.name || "Selected photo"} · ${formatBytes(nextFile.size)}` : "");
                }}
              />
            </Field>
            {selectedFileLabel ? <p className="rounded-md bg-slate-50 p-3 text-xs font-semibold text-slate-600">Selected: {selectedFileLabel}</p> : null}
            <Field label="Your goal">
              <select className="min-h-11 rounded-md border px-3" value={goal} onChange={(e) => setGoal(e.target.value)}>
                {["Lose fat", "Maintain weight", "Build muscle", "Improve eating habits", "Improve energy"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Optional context" hint="Restaurant, portion size, sauce, drink, or prep details.">
              <textarea className="min-h-24 rounded-md border px-3 py-2" value={context} onChange={(e) => setContext(e.target.value)} />
            </Field>
            <Button className="gap-2" onClick={submit} disabled={Boolean(status) || !file}><Camera size={18} />{status ? "Checking..." : "Run my free meal check"}</Button>
            {status ? <p className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-action">{status}</p> : null}
            {error ? <p className="rounded-md bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p> : null}
            <WellnessNotice />
          </div>
        ) : (
          <div className="grid gap-4">
            {analysis ? <MealPreviewResult analysis={analysis} /> : (
              <div className="rounded-md bg-slate-100 p-4">
                <div className="flex items-center gap-2 font-bold text-ink"><Lock size={18} />Free preview used</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">Join the waitlist and we will invite you when the full beta is ready.</p>
              </div>
            )}
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-black text-ink">Want early access?</h3>
              <p className="mb-4 mt-1 text-sm text-slate-600">Join the waitlist. No payment required.</p>
              <WaitlistForm triedFreeScan />
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: "The meal check hit a server error. Try again with a smaller JPG or PNG photo." };
  }
}

async function prepareImageForMealCheck(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Use a JPG, PNG, or WebP meal photo. iPhone Live Photo/HEIC files need to be saved as JPG first.");
  }

  if (file.size <= maxPreviewBytes) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That photo could not be prepared. Try taking a normal JPG photo or choosing a smaller image.");
  }
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context2d = canvas.getContext("2d");
  if (!context2d) throw new Error("Could not prepare image.");
  context2d.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Could not prepare image.");
  return new File([blob], "meal-preview.jpg", { type: "image/jpeg" });
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MealPreviewResult({ analysis }: { analysis: MealAnalysis }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-2xl font-black text-ink">{analysis.mealName}</h3>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Meal Score" value={`${analysis.mealScore}/10`} />
        <Metric label="Calories" value={`${analysis.calorieEstimate.minimum}-${analysis.calorieEstimate.maximum}`} />
        <Metric label="Protein" value={`About ${Math.round(analysis.estimatedMacrosGrams.protein)}g`} />
        <Metric label="Confidence" value={analysis.confidence} />
      </div>
      <p className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{analysis.coachTakeaway}</p>
      <p className="text-sm leading-6 text-slate-700"><strong>Better move:</strong> {analysis.betterMove}</p>
      <p className="text-xs leading-5 text-slate-500">{analysis.uncertaintyNotes[0] || analysis.assumptions[0]}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-slate-100 p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-black capitalize text-ink">{value}</p></div>;
}
