import { redirect } from "next/navigation";
import { Home, MessageSquare, Scale, Settings, Utensils } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase";

const nav = [
  ["/app", Home, "Home"],
  ["/app/meal/new", Utensils, "Meal"],
  ["/app/coach", MessageSquare, "Coach"],
  ["/app/weight", Scale, "Weight"],
  ["/app/settings", Settings, "Settings"],
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="safe-bottom mx-auto grid max-w-3xl grid-cols-5 px-2 pt-2">
          {nav.map(([href, Icon, label]) => (
            <a key={href} href={href} className="grid justify-items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-slate-600">
              <Icon size={20} />
              {label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
