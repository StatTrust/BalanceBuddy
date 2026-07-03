import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function MealsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase.from("meals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (params.range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    query = query.gte("created_at", start.toISOString());
  } else if (params.range === "7") {
    const start = new Date(Date.now() - 7 * 86400000);
    query = query.gte("created_at", start.toISOString());
  }
  const { data: meals } = await query.limit(100);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-ink">Meal history</h1>
        <LinkButton href="/app/meal/new">New</LinkButton>
      </div>
      <div className="flex gap-2 text-sm font-semibold">
        <Link className="rounded-md border bg-white px-3 py-2" href="/app/meals?range=today">Today</Link>
        <Link className="rounded-md border bg-white px-3 py-2" href="/app/meals?range=7">7 days</Link>
        <Link className="rounded-md border bg-white px-3 py-2" href="/app/meals">All</Link>
      </div>
      <div className="grid gap-3">
        {meals?.map((meal) => (
          <a key={meal.id} href={`/app/meals/${meal.id}`}>
            <Card>
              <p className="font-bold">{meal.meal_name}</p>
              <p className="text-sm text-slate-600">{new Date(meal.created_at).toLocaleDateString()} · {meal.calorie_min}-{meal.calorie_max} cal est. · {Math.round(meal.protein_grams)}g protein · {meal.meal_score}/10</p>
            </Card>
          </a>
        ))}
        {!meals?.length ? <p className="text-sm text-slate-600">No meal checks yet.</p> : null}
      </div>
    </div>
  );
}
