# Product And Engineering Decisions

## Assumptions

- The first paid beta is a responsive web app and installable PWA, deployed on Vercel.
- Supabase is the source of truth for authentication, app data, and private meal-photo storage.
- Stripe is the billing source of truth; subscription state is mirrored into Supabase only after trusted server-side events.
- Meal analysis is a direct server-side request so a normal scan can complete inside the product's 60-second promise.
- OpenAI model names are configured through environment variables. The documented defaults are starting points and should be adjusted before launch if newer production-approved models are preferred.
- Upstash Redis is used for production rate limiting. Local development can run without Upstash credentials, but production should provide them.
- GoHighLevel is treated as an optional outbound lifecycle webhook. Failures are logged and do not block the user.

## MVP Scope

- One founding beta subscription with monthly and annual billing options.
- No native iOS or Android app in this phase.
- No medical diagnosis, treatment, or disease-prevention claims.
- No public meal-photo bucket. Meal images are private and accessed by short-lived signed URLs.
- No microservices, queue dependency, or speculative infrastructure for scale.

## User Experience

- Mobile-first screens prioritize quick meal checks, simple progress, and direct coaching.
- Nutrition numbers are always presented as estimates and uncertainty is shown in the analysis.
- Users can test locally with a development-only subscription bypass when explicitly enabled.
