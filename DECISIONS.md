# Product And Engineering Decisions

## Assumptions

- The first waitlist release is a responsive web app and installable PWA, deployed on Vercel.
- Supabase is the source of truth for authentication, app data, and private meal-photo storage.
- Waitlist membership is the current access source of truth. Stripe remains dormant until paid plans are intentionally introduced.
- Meal analysis is a direct server-side request so a normal scan can complete inside the product's 60-second promise.
- OpenAI model names are configured through environment variables. The documented defaults are starting points and should be adjusted before launch if newer production-approved models are preferred.
- Upstash Redis is available for production rate limiting after the waitlist rollout. Verified waitlist members are unlimited while `WAITLIST_MODE=true`.
- GoHighLevel is treated as an optional outbound lifecycle webhook. Failures are logged and do not block the user.

## MVP Scope

- One free public meal preview, followed by a verified waitlist account for unlimited MVP access.
- Passwordless email login; no separate tester-account concept.
- No native iOS or Android app in this phase.
- No medical diagnosis, treatment, or disease-prevention claims.
- No public meal-photo bucket. Meal images are private and accessed by short-lived signed URLs.
- No microservices, queue dependency, or speculative infrastructure for scale.

## User Experience

- Mobile-first screens prioritize quick meal checks, simple progress, and direct coaching.
- Nutrition numbers are always presented as estimates and uncertainty is shown in the analysis.
- Waitlist members can sign in from any device using the email tied to their waitlist entry.
