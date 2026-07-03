import { redirect } from "next/navigation";
import { Button, Card, WellnessNotice } from "@/components/ui";
import { mealAnalysisSchema } from "@/lib/openai";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: meal } = await supabase.from("meals").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!meal) redirect("/app/meals");
  const analysis = mealAnalysisSchema.parse(meal.analysis);

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-slate-500">{new Date(meal.created_at).toLocaleString()}</p><h1 className="text-3xl font-black text-ink">{analysis.mealName}</h1></div>
        <form action="/api/delete-meal" method="post">
          <input type="hidden" name="mealId" value={meal.id} />
          <Button variant="danger">Delete</Button>
        </form>
      </div>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Meal Score" value={`${analysis.mealScore}/10`} />
          <Metric label="Calories" value={`${analysis.calorieEstimate.minimum}-${analysis.calorieEstimate.maximum}`} />
          <Metric label="Protein" value={`About ${Math.round(analysis.estimatedMacrosGrams.protein)}g`} />
          <Metric label="Confidence" value={analysis.confidence} />
        </div>
      </Card>
      <Card><h2 className="font-bold">Biggest issue</h2><p className="mt-2 text-sm leading-6 text-slate-700">{analysis.biggestIssue}</p></Card>
      <Card><h2 className="font-bold">Better move</h2><p className="mt-2 text-sm leading-6 text-slate-700">{analysis.betterMove}</p></Card>
      <Card><h2 className="font-bold">Coach takeaway</h2><p className="mt-2 text-sm leading-6 text-slate-700">{analysis.coachTakeaway}</p></Card>
      <Card>
        <h2 className="font-bold">Detected foods</h2>
        <ul className="mt-2 grid gap-2 text-sm text-slate-700">{analysis.detectedFoods.map((food) => <li key={`${food.name}-${food.estimatedPortion}`}>{food.name}: {food.estimatedPortion}</li>)}</ul>
      </Card>
      <Card>
        <h2 className="font-bold">Assumptions and uncertainty</h2>
        <ul className="mt-2 grid gap-2 text-sm text-slate-700">{[...analysis.assumptions, ...analysis.uncertaintyNotes].map((note) => <li key={note}>{note}</li>)}</ul>
      </Card>
      <a className="rounded-md bg-action px-4 py-3 text-center text-sm font-bold text-white" href={`/app/coach?mealId=${meal.id}`}>Ask Coach about this meal</a>
      <WellnessNotice />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-black capitalize text-ink">{value}</p></div>;
}
