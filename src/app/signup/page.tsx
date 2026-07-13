import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { WellnessNotice } from "@/components/ui";

export default function SignupPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-lg content-center gap-5 px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-action">Meal Coach</Link>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-action">Private waitlist</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Create waitlist account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">No password or payment required. After you join, use the secure link in your email to sign in.</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <WaitlistForm compact source="waitlist_account_page" buttonLabel="Create waitlist account" />
      </div>
      <p className="text-sm text-slate-600">Already joined? <Link className="font-semibold text-action" href="/login">Waitlist login</Link></p>
      <WellnessNotice />
    </main>
  );
}
