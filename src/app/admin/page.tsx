import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { adminEmails } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || !adminEmails.includes(user.email.toLowerCase())) redirect("/app");

  const admin = createSupabaseAdminClient();
  const [profiles, waitlist, meals, failed, events] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("waitlist_entries").select("id", { count: "exact", head: true }),
    admin.from("meals").select("duration_ms"),
    admin.from("app_events").select("id", { count: "exact", head: true }).eq("event_name", "meal_analysis.failed"),
    admin.from("app_events").select("*").order("created_at", { ascending: false }).limit(10),
  ]);
  const durations = meals.data?.map((m) => m.duration_ms).filter((n): n is number => typeof n === "number") ?? [];
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  return (
    <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6">
      <h1 className="text-3xl font-black text-ink">Admin</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Users" value={profiles.count ?? 0} />
        <Metric label="Waitlist" value={waitlist.count ?? 0} />
        <Metric label="Meal scans" value={meals.data?.length ?? 0} />
        <Metric label="Failed scans" value={failed.count ?? 0} />
      </div>
      <Metric label="Average analysis duration" value={`${avg} ms`} />
      <Card>
        <h2 className="font-bold">Recent events</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700">
          {events.data?.map((event) => <p key={event.id}>{new Date(event.created_at).toLocaleString()} · {event.event_name}</p>)}
        </div>
      </Card>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Card><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></Card>;
}
