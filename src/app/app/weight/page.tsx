"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card, Field } from "@/components/ui";

type WeightEntry = { id: string; weight_lbs: number; note: string | null; logged_at: string };

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const res = await fetch("/api/weight");
    const body = await res.json();
    if (res.ok) setEntries(body.entries);
  }

  async function add() {
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ weight: Number(weight), note }),
    });
    if (res.ok) {
      setWeight("");
      setNote("");
      await load();
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/weight?id=${id}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  useEffect(() => { load(); }, []);
  const chronological = [...entries].reverse();
  const change = entries.length > 1 ? entries[0].weight_lbs - entries[entries.length - 1].weight_lbs : 0;

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-black text-ink">Weight progress</h1>
      <Card>
        <p className="text-sm text-slate-500">Total change</p>
        <p className="text-2xl font-black">{change ? `${change > 0 ? "+" : ""}${change.toFixed(1)} lb` : "Not enough entries yet"}</p>
      </Card>
      <Card>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chronological.map((e) => ({ date: new Date(e.logged_at).toLocaleDateString(), weight: e.weight_lbs }))}>
              <XAxis dataKey="date" hide />
              <YAxis domain={["dataMin - 5", "dataMax + 5"]} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#0f766e" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <div className="grid gap-3">
          <Field label="Weight"><input className="min-h-11 rounded-md border px-3" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
          <Field label="Note"><input className="min-h-11 rounded-md border px-3" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button onClick={add}>Add entry</Button>
        </div>
      </Card>
      <div className="grid gap-3">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-center justify-between gap-3">
              <div><p className="font-bold">{entry.weight_lbs} lb</p><p className="text-sm text-slate-600">{new Date(entry.logged_at).toLocaleDateString()} {entry.note ? `· ${entry.note}` : ""}</p></div>
              <Button variant="secondary" onClick={() => remove(entry.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
