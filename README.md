# BalanceBuddy MVP

Mobile-first waitlist MVP for fast AI meal checks, practical coaching, meal history, and weight progress.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project and run the SQL migration in `supabase/migrations`.
3. Create a private Supabase Storage bucket named `meal-photos`.
4. Enable the Supabase Email auth provider.
5. In Supabase Auth URL Configuration, use the deployed domain as the Site URL and add these Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://balance-buddy-lemon.vercel.app/auth/callback`
6. Add the Supabase and OpenAI credentials. Upstash is optional while `WAITLIST_MODE=true`.
7. Run `npm install`, then `npm run dev`.

## Notes

- Service-role, OpenAI, Stripe, and Upstash credentials are only used server-side.
- Waitlist accounts use passwordless Supabase email links. Signed-in waitlist members have unlimited MVP access.
- Keep `WAITLIST_MODE=true` until billing is intentionally enabled.
- `ENABLE_DEV_SUBSCRIPTION_BYPASS=true` enables a local testing route and should be disabled in production.
- Meal analysis uses OpenAI Responses API with structured output validation.
