import { ArrowRight, Camera, MessageSquare, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FreeMealPreview } from "@/components/free-meal-preview";
import { LinkButton, WellnessNotice } from "@/components/ui";
import { WaitlistForm } from "@/components/waitlist-form";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="text-base font-black tracking-tight text-ink">Meal Coach</span>
        <Link className="text-sm font-semibold text-slate-700" href="/login">Waitlist login</Link>
      </header>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-6 md:grid-cols-[1.05fr_.95fr] md:items-center md:pt-12">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-action">Private waitlist</p>
          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-normal text-ink md:text-6xl">
            Built for real-life busy men.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
            Snap your meal, get practical feedback, and know what to change next-without spending your life tracking food.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="#try-free" className="gap-2">Try One Meal Free <ArrowRight size={18} /></LinkButton>
            <LinkButton href="#waitlist" variant="secondary">Join the Waitlist</LinkButton>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="rounded-md bg-slate-100 p-4">
            <Image
              src="/meal-score-demo.png"
              alt="Grilled chicken, rice, and vegetables used in the meal score demo"
              width={1456}
              height={1024}
              priority
              className="aspect-[4/3] rounded-md object-cover"
            />
            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between text-sm"><span>Meal Score</span><strong>7/10</strong></div>
              <div className="flex items-center justify-between text-sm"><span>Estimated Calories</span><strong>650-820</strong></div>
              <p className="rounded-md bg-white p-3 text-sm text-slate-700">
                Keep the protein and rice. Use half the sauce and add vegetables. This can fit a fat-loss goal.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        {[
          ["How it works", "Take a photo, add quick context, and get a plain-English meal check in under a minute."],
          ["Who it is for", "Contractors, business owners, fathers, and men who need useful guidance without obsessive tracking."],
          ["What you get", "Estimated calories, protein, score, assumptions, uncertainty, and one better move."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </div>
        ))}
      </section>
      <FreeMealPreview />
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
        <div className="flex gap-3"><Camera className="text-action" /><p className="text-sm text-slate-700">Fast AI meal checks from photos.</p></div>
        <div className="flex gap-3"><MessageSquare className="text-action" /><p className="text-sm text-slate-700">Ask a brief coach follow-up.</p></div>
        <div className="flex gap-3"><Scale className="text-action" /><p className="text-sm text-slate-700">Track weight progress without overbuilt analytics.</p></div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div id="waitlist" className="grid gap-6 rounded-lg bg-ink p-6 text-white md:grid-cols-[.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-black">Join the private waitlist</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              No payment required. We are inviting a small group first so we can make the meal feedback fast, useful, and worth paying for later.
            </p>
          </div>
          <div className="rounded-md bg-white p-4 text-ink">
            <WaitlistForm />
          </div>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-4 py-8">
        <WellnessNotice />
      </footer>
    </main>
  );
}
