"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const router = useRouter();
  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/");
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-black text-ink">Settings</h1>
      <Card>
        <h2 className="font-bold">Waitlist access</h2>
        <p className="mt-2 text-sm text-slate-600">Your signed-in waitlist account includes unlimited access during the MVP rollout.</p>
      </Card>
      <Card>
        <h2 className="font-bold">Account</h2>
        <Button className="mt-3" variant="secondary" onClick={logout}>Log out</Button>
      </Card>
    </div>
  );
}
