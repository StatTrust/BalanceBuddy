# Busy Men Health Coach MVP

Mobile-first paid-beta PWA for fast AI meal checks, practical coaching, meal history, and weight progress.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Create a Supabase project and run the SQL migration in `supabase/migrations`.
3. Create a private Supabase Storage bucket named `meal-photos`.
4. Add Supabase, Stripe, OpenAI, and Upstash credentials.
5. Create two Stripe recurring prices and set `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID`.
6. Run `npm install`, then `npm run dev`.

## Notes

- Service-role, Stripe, OpenAI, and Upstash credentials are only used server-side.
- `ENABLE_DEV_SUBSCRIPTION_BYPASS=true` enables a local testing route and should be disabled in production.
- Meal analysis uses OpenAI Responses API with structured output validation.
