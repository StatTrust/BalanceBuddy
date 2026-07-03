"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, WellnessNotice } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string | boolean>>({ primary_goal: "Lose fat", activity_level: "Mixed", work_style: "Mixed", sms_consent: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function set(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const payload = {
      user_id: user.id,
      first_name: form.first_name || null,
      age: Number(form.age) || null,
      height_inches: Number(form.height_inches) || null,
      current_weight_lbs: Number(form.current_weight_lbs) || null,
      goal_weight_lbs: Number(form.goal_weight_lbs) || null,
      primary_goal: String(form.primary_goal || ""),
      activity_level: String(form.activity_level || ""),
      work_style: String(form.work_style || ""),
      dietary_preference: form.dietary_preference || null,
      foods_to_avoid: form.foods_to_avoid || null,
      calorie_target: Number(form.calorie_target) || null,
      protein_target: Number(form.protein_target) || null,
      sms_consent: Boolean(form.sms_consent),
      phone_number: form.phone_number || null,
      onboarding_completed: true,
    };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setLoading(false);
    if (error) setMessage(error.message);
    else router.push("/app");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-3xl font-black text-ink">Set your coaching basics</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Only what helps the meal feedback. This is not medical history.</p>
      <div className="mt-6 grid gap-4">
        <Field label="First name"><input className="min-h-11 rounded-md border px-3" onChange={(e) => set("first_name", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("age", e.target.value)} /></Field>
          <Field label="Height in inches"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("height_inches", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Current weight"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("current_weight_lbs", e.target.value)} /></Field>
          <Field label="Goal weight"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("goal_weight_lbs", e.target.value)} /></Field>
        </div>
        <Field label="Primary goal"><select className="min-h-11 rounded-md border px-3" onChange={(e) => set("primary_goal", e.target.value)}>{["Lose fat","Maintain weight","Build muscle","Improve eating habits","Improve energy"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Activity level"><select className="min-h-11 rounded-md border px-3" onChange={(e) => set("activity_level", e.target.value)}>{["Low","Mixed","High"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Typical work style"><select className="min-h-11 rounded-md border px-3" onChange={(e) => set("work_style", e.target.value)}>{["Mostly seated","Mixed","Physically active"].map((v) => <option key={v}>{v}</option>)}</select></Field>
        <Field label="Dietary preference"><input className="min-h-11 rounded-md border px-3" onChange={(e) => set("dietary_preference", e.target.value)} placeholder="No preference, low carb, vegetarian..." /></Field>
        <Field label="Allergies or foods to avoid"><textarea className="min-h-24 rounded-md border px-3 py-2" onChange={(e) => set("foods_to_avoid", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Calorie target" hint="Optional estimate"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("calorie_target", e.target.value)} /></Field>
          <Field label="Protein target" hint="Optional estimate"><input className="min-h-11 rounded-md border px-3" type="number" onChange={(e) => set("protein_target", e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" onChange={(e) => set("sms_consent", e.target.checked)} /> I agree to optional SMS coaching reminders.</label>
        <Field label="Phone number" hint="Optional"><input className="min-h-11 rounded-md border px-3" type="tel" onChange={(e) => set("phone_number", e.target.value)} /></Field>
        <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Continue"}</Button>
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
        <WellnessNotice />
      </div>
    </main>
  );
}
