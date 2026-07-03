import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const form = await request.formData();
  const mealId = String(form.get("mealId") || "");
  const { data: meal } = await supabase.from("meals").select("image_path").eq("id", mealId).eq("user_id", user.id).maybeSingle();
  if (meal?.image_path) await supabase.storage.from("meal-photos").remove([meal.image_path]);
  await supabase.from("meals").delete().eq("id", mealId).eq("user_id", user.id);
  redirect("/app/meals");
}
