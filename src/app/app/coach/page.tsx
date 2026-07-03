"use client";

import { useState } from "react";
import { Button, Card, Field, WellnessNotice } from "@/components/ui";

export default function CoachPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    const nextQuestion = question.trim();
    setQuestion("");
    setMessages((current) => [...current, { role: "user", content: nextQuestion }]);
    setLoading(true);
    const params = new URLSearchParams(window.location.search);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: nextQuestion, mealId: params.get("mealId") }),
    });
    const body = await res.json();
    setLoading(false);
    setMessages((current) => [...current, { role: "assistant", content: res.ok ? body.answer : body.error }]);
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-black text-ink">Ask Coach</h1>
      <div className="grid gap-3">
        {messages.map((msg, index) => (
          <Card key={index} className={msg.role === "user" ? "bg-slate-100" : undefined}>
            <p className="text-sm leading-6 text-slate-800">{msg.content}</p>
          </Card>
        ))}
        {loading ? <p className="rounded-md bg-slate-100 p-3 text-sm font-semibold text-action">Thinking through your recent meals...</p> : null}
      </div>
      <Card>
        <Field label="Question">
          <textarea className="min-h-28 rounded-md border px-3 py-2" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should I eat for dinner?" />
        </Field>
        <Button className="mt-3 w-full" onClick={ask} disabled={loading}>Ask</Button>
      </Card>
      <WellnessNotice />
    </div>
  );
}
