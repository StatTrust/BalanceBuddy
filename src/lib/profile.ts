import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function summarizeProfile(profile: Profile) {
  if (!profile) return "No completed profile yet.";
  return [
    profile.first_name ? `Name: ${profile.first_name}` : null,
    profile.age ? `Age: ${profile.age}` : null,
    profile.height_inches ? `Height: ${profile.height_inches} inches` : null,
    profile.current_weight_lbs ? `Current weight: ${profile.current_weight_lbs} lb` : null,
    profile.goal_weight_lbs ? `Goal weight: ${profile.goal_weight_lbs} lb` : null,
    profile.primary_goal ? `Goal: ${profile.primary_goal}` : null,
    profile.activity_level ? `Activity: ${profile.activity_level}` : null,
    profile.work_style ? `Work style: ${profile.work_style}` : null,
    profile.dietary_preference ? `Diet: ${profile.dietary_preference}` : null,
    profile.foods_to_avoid ? `Avoids: ${profile.foods_to_avoid}` : null,
    profile.calorie_target ? `Calorie target: ${profile.calorie_target}` : null,
    profile.protein_target ? `Protein target: ${profile.protein_target}g` : null,
  ].filter(Boolean).join("; ");
}
