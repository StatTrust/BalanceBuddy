import { redirect } from "next/navigation";
import { LinkButton, Card, WellnessNotice } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase";

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: meals }, { data: latestWeight }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("meals").select("*").eq("user_id", user.id).gte("created_at", todayRange()).order("created_at", { ascending: false }),
    supabase.from("weight_entries").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const calories = meals?.reduce((sum, meal) => sum + Math.round((meal.calorie_min + meal.calorie_max) / 2), 0) ?? 0;
  const protein = meals?.reduce((sum, meal) => sum + Math.round(meal.protein_grams), 0) ?? 0;
  const recentMeal = meals?.[0];

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-action">Today</p>
          <h1 className="text-3xl font-black text-ink">Hey{profile.first_name ? `, ${profile.first_name}` : ""}.</h1>
        </div>
        <LinkButton href="/app/meal/new">Check a Meal</LinkButton>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-xs text-slate-500">Calories</p><p className="text-2xl font-black">{calories}</p><p className="text-xs text-slate-500">of {profile.calorie_target ?? "unset"} est.</p></Card>
        <Card><p className="text-xs text-slate-500">Protein</p><p className="text-2xl font-black">{protein}g</p><p className="text-xs text-slate-500">of {profile.protein_target ?? "unset"}g est.</p></Card>
      </div>
      <Card>
        <h2 className="font-bold text-ink">Most recent meal</h2>
        {recentMeal ? (
          <a href={`/app/meals/${recentMeal.id}`} className="mt-3 block rounded-md bg-slate-50 p-3">
            <p className="font-semibold">{recentMeal.meal_name}</p>
            <p className="text-sm text-slate-600">{recentMeal.calorie_min}-{recentMeal.calorie_max} cal est. · {Math.round(recentMeal.protein_grams)}g protein · {recentMeal.meal_score}/10</p>
          </a>
        ) : <p className="mt-2 text-sm text-slate-600">No meals logged today yet.</p>}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <LinkButton href="/app/coach" variant="secondary">Ask Coach</LinkButton>
        <LinkButton href="/app/weight" variant="secondary">Weight</LinkButton>
      </div>
      <Card>
        <h2 className="font-bold text-ink">Weight</h2>
        <p className="mt-2 text-sm text-slate-600">Current: {latestWeight?.weight_lbs ?? profile.current_weight_lbs ?? "unset"} lb · Goal: {profile.goal_weight_lbs ?? "unset"} lb</p>
      </Card>
      <WellnessNotice />
    </div>
  );
}
